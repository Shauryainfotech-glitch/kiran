# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import hashlib
import mimetypes

class DocumentManagement(models.Model):
    _name = 'avf.document.management'
    _description = 'Document Management'
    _rec_name = 'name'

    name = fields.Char(string='Document Name', required=True)
    project_id = fields.Many2one('project.project', string='Project', required=True)
    
    document_type = fields.Selection([
        ('contract', 'Contract'),
        ('drawing', 'Drawing'),
        ('specification', 'Specification'),
        ('report', 'Report'),
        ('permit', 'Permit'),
        ('certificate', 'Certificate')
    ], string='Document Type', required=True)
    
    document_file = fields.Binary(string='Document File')
    filename = fields.Char(string='Filename')
    file_size = fields.Integer(string='File Size')
    mime_type = fields.Char(string='MIME Type')
    
    version = fields.Char(string='Version', default='1.0')
    status = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('archived', 'Archived')
    ], string='Status', default='draft')
    
    upload_date = fields.Datetime(string='Upload Date', default=fields.Datetime.now)
    expiry_date = fields.Date(string='Expiry Date')
    
    tags = fields.Many2many('avf.document.tag', string='Tags')
    description = fields.Text(string='Description')

class DocumentTag(models.Model):
    _name = 'avf.document.tag'
    _description = 'Document Tag'
    _rec_name = 'name'

    name = fields.Char(string='Tag Name', required=True)
    color = fields.Integer(string='Color')

class ArchitectDocument(models.Model):
    _name = 'architect.document'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.published.mixin']
    _description = 'Document Management'
    _order = 'create_date desc'

    name = fields.Char(string='Document Name', required=True, tracking=True)
    project_id = fields.Many2one('architect.project', string='Project', required=True)
    company_id = fields.Many2one('res.company', string='Company', 
                                default=lambda self: self.env.company)
    
    # Document Details
    document_type = fields.Selection([
        ('drawing', 'Drawing'),
        ('specification', 'Specification'),
        ('report', 'Report'),
        ('contract', 'Contract'),
        ('permit', 'Permit'),
        ('certificate', 'Certificate'),
        ('correspondence', 'Correspondence'),
        ('photo', 'Photo'),
        ('video', 'Video'),
        ('other', 'Other')
    ], string='Document Type', required=True)
    
    category_id = fields.Many2one('architect.document.category', string='Category')
    subcategory_id = fields.Many2one('architect.document.subcategory', string='Subcategory')
    
    # File Information
    file_data = fields.Binary(string='File', attachment=True)
    file_name = fields.Char(string='File Name')
    file_size = fields.Integer(string='File Size (bytes)', compute='_compute_file_info', store=True)
    file_type = fields.Char(string='File Type', compute='_compute_file_info', store=True)
    mime_type = fields.Char(string='MIME Type', compute='_compute_file_info', store=True)
    
    # Version Control
    version = fields.Char(string='Version', default='1.0')
    revision = fields.Integer(string='Revision', default=1)
    parent_document_id = fields.Many2one('architect.document', string='Parent Document')
    child_document_ids = fields.One2many('architect.document', 'parent_document_id', 
                                        string='Child Documents')
    is_latest_version = fields.Boolean(string='Latest Version', default=True)
    
    # Status and Workflow
    state = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('archived', 'Archived'),
        ('obsolete', 'Obsolete')
    ], string='Status', default='draft', tracking=True)
    
    # Dates
    create_date = fields.Datetime(string='Created On', readonly=True)
    review_date = fields.Date(string='Review Date')
    approval_date = fields.Date(string='Approval Date')
    publish_date = fields.Date(string='Publish Date')
    expiry_date = fields.Date(string='Expiry Date')
    
    # People
    author_id = fields.Many2one('res.users', string='Author', 
                               default=lambda self: self.env.user)
    reviewer_id = fields.Many2one('res.users', string='Reviewer')
    approver_id = fields.Many2one('res.users', string='Approver')
    
    # Access Control
    access_level = fields.Selection([
        ('public', 'Public'),
        ('internal', 'Internal'),
        ('restricted', 'Restricted'),
        ('confidential', 'Confidential')
    ], string='Access Level', default='internal')
    
    authorized_user_ids = fields.Many2many('res.users', string='Authorized Users')
    authorized_group_ids = fields.Many2many('res.groups', string='Authorized Groups')
    
    # Portal Access
    portal_visible = fields.Boolean(string='Visible in Portal', default=False)
    client_downloadable = fields.Boolean(string='Client Downloadable', default=False)
    
    # Metadata
    description = fields.Text(string='Description')
    keywords = fields.Char(string='Keywords')
    tags = fields.Many2many('architect.document.tag', string='Tags')
    
    # Digital Signature
    digitally_signed = fields.Boolean(string='Digitally Signed')
    signature_info = fields.Text(string='Signature Information')
    checksum = fields.Char(string='File Checksum', compute='_compute_checksum', store=True)
    
    # Statistics
    download_count = fields.Integer(string='Download Count', default=0)
    view_count = fields.Integer(string='View Count', default=0)
    
    _sql_constraints = [
        ('unique_name_project', 'unique(name, project_id, version)', 
         'Document name and version must be unique per project!')
    ]

    @api.depends('file_data', 'file_name')
    def _compute_file_info(self):
        for doc in self:
            if doc.file_data and doc.file_name:
                # Get file size (approximate from base64)
                doc.file_size = len(doc.file_data) * 3 / 4 if doc.file_data else 0
                
                # Get file type and MIME type
                file_ext = doc.file_name.split('.')[-1].lower() if '.' in doc.file_name else ''
                doc.file_type = file_ext
                doc.mime_type = mimetypes.guess_type(doc.file_name)[0] or 'application/octet-stream'
            else:
                doc.file_size = 0
                doc.file_type = ''
                doc.mime_type = ''
    
    @api.depends('file_data')
    def _compute_checksum(self):
        for doc in self:
            if doc.file_data:
                doc.checksum = hashlib.md5(doc.file_data).hexdigest()
            else:
                doc.checksum = ''
    
    def action_submit_for_review(self):
        self.ensure_one()
        if not self.reviewer_id:
            raise ValidationError(_("Please assign a reviewer before submitting."))
        self.write({
            'state': 'review',
            'review_date': fields.Date.today()
        })
        self.message_post(body=_("Document submitted for review."))
    
    def action_approve(self):
        self.ensure_one()
        self.write({
            'state': 'approved',
            'approval_date': fields.Date.today(),
            'approver_id': self.env.user.id
        })
        self.message_post(body=_("Document approved."))
    
    def action_publish(self):
        self.ensure_one()
        self.write({
            'state': 'published',
            'publish_date': fields.Date.today()
        })
        self.message_post(body=_("Document published."))
    
    def action_archive(self):
        self.ensure_one()
        self.state = 'archived'
        self.message_post(body=_("Document archived."))
    
    def create_new_version(self):
        self.ensure_one()
        # Mark current version as not latest
        self.is_latest_version = False
        
        # Create new version
        new_version = self.copy({
            'version': self._get_next_version(),
            'revision': self.revision + 1,
            'parent_document_id': self.id,
            'state': 'draft',
            'review_date': False,
            'approval_date': False,
            'publish_date': False,
            'is_latest_version': True
        })
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('New Version'),
            'res_model': 'architect.document',
            'res_id': new_version.id,
            'view_mode': 'form',
            'target': 'current'
        }
    
    def _get_next_version(self):
        """Generate next version number"""
        try:
            major, minor = self.version.split('.')
            return f"{major}.{int(minor) + 1}"
        except:
            return "1.1"
    
    def track_download(self):
        """Track document download"""
        self.download_count += 1
    
    def track_view(self):
        """Track document view"""
        self.view_count += 1


class ArchitectDocumentCategory(models.Model):
    _name = 'architect.document.category'
    _description = 'Document Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True)
    code = fields.Char(string='Category Code')
    description = fields.Text(string='Description')
    sequence = fields.Integer(string='Sequence', default=10)
    parent_id = fields.Many2one('architect.document.category', string='Parent Category')
    child_ids = fields.One2many('architect.document.category', 'parent_id', 
                               string='Child Categories')
    
    # Configuration
    allowed_file_types = fields.Char(string='Allowed File Types',
                                   help="Comma-separated list of allowed file extensions")
    max_file_size = fields.Integer(string='Max File Size (MB)', default=50)
    
    active = fields.Boolean(default=True)
    color = fields.Integer(string='Color Index')


class ArchitectDocumentSubcategory(models.Model):
    _name = 'architect.document.subcategory'
    _description = 'Document Subcategory'
    _order = 'category_id, sequence, name'

    name = fields.Char(string='Subcategory Name', required=True)
    category_id = fields.Many2one('architect.document.category', string='Category', 
                                 required=True)
    description = fields.Text(string='Description')
    sequence = fields.Integer(string='Sequence', default=10)
    
    active = fields.Boolean(default=True)


class ArchitectDocumentTag(models.Model):
    _name = 'architect.document.tag'
    _description = 'Document Tag'

    name = fields.Char(string='Tag Name', required=True)
    color = fields.Integer(string='Color Index')
    description = fields.Text(string='Description')
    
    _sql_constraints = [
        ('name_uniq', 'unique (name)', "Tag name already exists!"),
    ]


class ArchitectDocumentTemplate(models.Model):
    _name = 'architect.document.template'
    _description = 'Document Template'

    name = fields.Char(string='Template Name', required=True)
    document_type = fields.Selection([
        ('drawing', 'Drawing'),
        ('specification', 'Specification'),
        ('report', 'Report'),
        ('contract', 'Contract'),
        ('other', 'Other')
    ], string='Document Type', required=True)
    
    # Template File
    template_file = fields.Binary(string='Template File', attachment=True)
    template_filename = fields.Char(string='Template Filename')
    
    # Configuration
    description = fields.Text(string='Description')
    instructions = fields.Html(string='Usage Instructions')
    
    # Metadata Template
    default_category_id = fields.Many2one('architect.document.category', 
                                        string='Default Category')
    default_tags = fields.Many2many('architect.document.tag', string='Default Tags')
    
    active = fields.Boolean(default=True)
    usage_count = fields.Integer(string='Usage Count', default=0)
    
    def use_template(self):
        """Create a new document from this template"""
        self.usage_count += 1
        return {
            'type': 'ir.actions.act_window',
            'name': _('New Document from Template'),
            'res_model': 'architect.document',
            'view_mode': 'form',
            'target': 'current',
            'context': {
                'default_name': f"New {self.name}",
                'default_document_type': self.document_type,
                'default_category_id': self.default_category_id.id,
                'default_tag_ids': [(6, 0, self.default_tags.ids)],
                'template_file': self.template_file,
                'template_filename': self.template_filename
            }
        }
