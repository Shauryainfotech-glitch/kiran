# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta

class TeamCollaboration(models.Model):
    _name = 'avf.team.collaboration'
    _description = 'Team Collaboration'
    _rec_name = 'name'

    name = fields.Char(string='Collaboration Name', required=True)
    project_id = fields.Many2one('project.project', string='Project', required=True)
    
    team_members = fields.Many2many('res.users', string='Team Members')
    lead_architect = fields.Many2one('res.users', string='Lead Architect')
    
    meeting_date = fields.Datetime(string='Meeting Date')
    meeting_location = fields.Char(string='Meeting Location')
    meeting_type = fields.Selection([
        ('planning', 'Planning Meeting'),
        ('review', 'Review Meeting'),
        ('coordination', 'Coordination Meeting'),
        ('client', 'Client Meeting')
    ], string='Meeting Type')
    
    agenda = fields.Text(string='Agenda')
    minutes = fields.Text(string='Meeting Minutes')
    action_items = fields.Text(string='Action Items')
    
    status = fields.Selection([
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='scheduled')

class ArchitectTeam(models.Model):
    _name = 'architect.team'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = 'Project Team'
    _order = 'name'

    name = fields.Char(string='Team Name', required=True, tracking=True)
    code = fields.Char(string='Team Code', required=True, copy=False)
    company_id = fields.Many2one('res.company', string='Company', 
                                default=lambda self: self.env.company)
    
    # Team Members
    leader_id = fields.Many2one('res.users', string='Team Leader', required=True, 
                               tracking=True)
    member_ids = fields.Many2many('res.users', string='Team Members')
    
    # Team Details
    specialization = fields.Selection([
        ('architectural', 'Architectural Design'),
        ('structural', 'Structural Engineering'),
        ('mep', 'MEP Engineering'),
        ('interior', 'Interior Design'),
        ('landscape', 'Landscape Design'),
        ('urban', 'Urban Planning'),
        ('project_management', 'Project Management')
    ], string='Specialization')
    
    # Projects
    project_ids = fields.Many2many('architect.project', string='Projects')
    active_project_count = fields.Integer(compute='_compute_project_stats')
    completed_project_count = fields.Integer(compute='_compute_project_stats')
    
    # Team Capacity
    capacity_hours = fields.Float(string='Weekly Capacity (Hours)', default=40.0)
    allocated_hours = fields.Float(string='Allocated Hours', compute='_compute_allocated_hours')
    available_hours = fields.Float(string='Available Hours', compute='_compute_allocated_hours')
    
    # Performance Metrics
    efficiency_rating = fields.Float(string='Efficiency Rating', compute='_compute_performance_metrics')
    quality_rating = fields.Float(string='Quality Rating', compute='_compute_performance_metrics')
    
    # Status
    active = fields.Boolean(default=True)
    state = fields.Selection([
        ('forming', 'Forming'),
        ('active', 'Active'),
        ('overallocated', 'Over Allocated'),
        ('inactive', 'Inactive')
    ], string='Status', default='forming', tracking=True)
    
    @api.depends('project_ids', 'project_ids.state')
    def _compute_project_stats(self):
        for team in self:
            team.active_project_count = len(team.project_ids.filtered(
                lambda p: p.state in ['confirmed', 'in_progress', 'review']))
            team.completed_project_count = len(team.project_ids.filtered(
                lambda p: p.state == 'completed'))
    
    @api.depends('capacity_hours', 'project_ids', 'member_ids')
    def _compute_allocated_hours(self):
        for team in self:
            allocated = sum(team.project_ids.mapped('allocated_hours'))
            team.allocated_hours = allocated
            team.available_hours = team.capacity_hours - allocated
    
    @api.depends('project_ids.progress', 'project_ids.quality_rating')
    def _compute_performance_metrics(self):
        for team in self:
            completed_projects = team.project_ids.filtered(lambda p: p.state == 'completed')
            if completed_projects:
                team.efficiency_rating = sum(completed_projects.mapped('progress')) / len(completed_projects)
                team.quality_rating = sum(completed_projects.mapped('quality_rating')) / len(completed_projects)
            else:
                team.efficiency_rating = 0.0
                team.quality_rating = 0.0
    
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('code'):
                vals['code'] = self.env['ir.sequence'].next_by_code('architect.team')
        return super().create(vals_list)
    
    def action_set_active(self):
        self.state = 'active'
    
    def action_set_inactive(self):
        self.state = 'inactive'
    
    def check_allocation(self):
        self.ensure_one()
        if self.available_hours < 0:
            self.state = 'overallocated'
        elif self.state == 'overallocated':
            self.state = 'active'


class ArchitectTeamAllocation(models.Model):
    _name = 'architect.team.allocation'
    _description = 'Team Allocation'
    _order = 'start_date, id'

    team_id = fields.Many2one('architect.team', string='Team', required=True)
    project_id = fields.Many2one('architect.project', string='Project', required=True)
    
    # Allocation Details
    start_date = fields.Date(string='Start Date', required=True)
    end_date = fields.Date(string='End Date', required=True)
    allocated_hours = fields.Float(string='Allocated Hours')
    
    # Members
    member_ids = fields.Many2many('res.users', string='Allocated Members')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='draft')
    
    @api.constrains('start_date', 'end_date')
    def _check_dates(self):
        for record in self:
            if record.start_date and record.end_date:
                if record.start_date > record.end_date:
                    raise ValidationError(_("End date cannot be before start date."))


class ArchitectTeamMember(models.Model):
    _name = 'architect.team.member'
    _description = 'Team Member Details'
    _inherits = {'res.users': 'user_id'}
    _order = 'name'

    user_id = fields.Many2one('res.users', string='User', required=True, ondelete='cascade')
    team_ids = fields.Many2many('architect.team', string='Teams')
    
    # Professional Details
    designation = fields.Char(string='Designation')
    specialization = fields.Selection([
        ('architect', 'Architect'),
        ('engineer', 'Engineer'),
        ('designer', 'Designer'),
        ('drafter', 'Drafter'),
        ('manager', 'Project Manager'),
        ('consultant', 'Consultant')
    ], string='Specialization')
    
    # Skills and Certifications
    skill_ids = fields.Many2many('architect.skill', string='Skills')
    certification_ids = fields.One2many('architect.certification', 'member_id', 
                                      string='Certifications')
    
    # Availability
    available_hours = fields.Float(string='Available Hours/Week', default=40.0)
    allocated_hours = fields.Float(string='Allocated Hours', compute='_compute_allocated_hours')
    
    # Performance
    efficiency_rating = fields.Float(string='Efficiency Rating', default=0.0)
    quality_rating = fields.Float(string='Quality Rating', default=0.0)
    
    @api.depends('team_ids.project_ids')
    def _compute_allocated_hours(self):
        for member in self:
            allocated = sum(member.team_ids.mapped('project_ids').filtered(
                lambda p: p.state in ['confirmed', 'in_progress']).mapped('allocated_hours'))
            member.allocated_hours = allocated


class ArchitectSkill(models.Model):
    _name = 'architect.skill'
    _description = 'Professional Skill'

    name = fields.Char(string='Skill Name', required=True)
    category = fields.Selection([
        ('technical', 'Technical'),
        ('software', 'Software'),
        ('design', 'Design'),
        ('management', 'Management'),
        ('other', 'Other')
    ], string='Category')
    description = fields.Text(string='Description')
    
    _sql_constraints = [
        ('name_uniq', 'unique (name)', "Skill name must be unique!")
    ]


class ArchitectCertification(models.Model):
    _name = 'architect.certification'
    _description = 'Professional Certification'

    name = fields.Char(string='Certification Name', required=True)
    member_id = fields.Many2one('architect.team.member', string='Team Member')
    issuing_body = fields.Char(string='Issuing Organization')
    issue_date = fields.Date(string='Issue Date')
    expiry_date = fields.Date(string='Expiry Date')
    certification_number = fields.Char(string='Certification Number')
    
    # Status
    active = fields.Boolean(string='Active', compute='_compute_active', store=True)
    
    @api.depends('expiry_date')
    def _compute_active(self):
        today = fields.Date.today()
        for cert in self:
            cert.active = not cert.expiry_date or cert.expiry_date >= today
