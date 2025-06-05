export interface FieldConfiguration {
  name: string;
  type: FieldType;
  required?: boolean;
  validation?: ValidationRule[];
  options?: string[];
  placeholder?: string;
  description?: string;
  category?: string;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'numeric'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'file'
  | 'image'
  | 'multifile'
  | 'checkbox'
  | 'rating'
  | 'autonumber'
  | 'lookup'
  | 'table'
  | 'verification'
  | 'structured';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}

// GeM Bid Field Configurations based on CSV data
export const GEM_BID_FIELD_CONFIGS: Record<string, FieldConfiguration> = {
  // Basic Information Fields
  keyword: {
    name: 'Keyword',
    type: 'text',
    placeholder: 'Enter search keywords',
    category: 'basic'
  },
  category: {
    name: 'Category',
    type: 'dropdown',
    options: ['Infrastructure', 'Technology', 'Construction', 'Consulting', 'Supplies'],
    category: 'basic'
  },
  buyerName: {
    name: 'Buyer Name',
    type: 'text',
    placeholder: 'Enter buyer organization name',
    category: 'basic'
  },
  location: {
    name: 'Location',
    type: 'dropdown',
    options: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'],
    category: 'basic'
  },
  bidType: {
    name: 'Bid Type',
    type: 'dropdown',
    options: ['Open Tender', 'Limited Tender', 'Single Source', 'Rate Contract', 'Reverse Auction'],
    category: 'basic'
  },
  bidStatus: {
    name: 'Bid Status',
    type: 'dropdown',
    options: ['Published', 'Closed', 'Cancelled', 'Under Evaluation', 'Awarded'],
    category: 'basic'
  },
  bidNo: {
    name: 'Bid No.',
    type: 'autonumber',
    description: 'Auto-generated bid number',
    category: 'basic'
  },
  boqFile: {
    name: 'BoQ File',
    type: 'file',
    description: 'Upload Excel or PDF file',
    category: 'documents'
  },
  eligibilityCriteria: {
    name: 'Eligibility Criteria',
    type: 'textarea',
    placeholder: 'Enter detailed eligibility requirements',
    category: 'requirements'
  },
  emd: {
    name: 'EMD',
    type: 'currency',
    description: 'Earnest Money Deposit amount',
    category: 'financial'
  },
  deliveryTerms: {
    name: 'Delivery Terms',
    type: 'dropdown',
    options: ['FOB', 'CIF', 'DAP', 'DDP', 'Ex-Works'],
    category: 'terms'
  },
  consigneeDetails: {
    name: 'Consignee Details',
    type: 'structured',
    description: 'Delivery address and contact information',
    category: 'delivery'
  },
  
  // Query and Response Fields
  queryText: {
    name: 'Query Text',
    type: 'textarea',
    placeholder: 'Enter your query or clarification request',
    category: 'communication'
  },
  attachment: {
    name: 'Attachment',
    type: 'file',
    description: 'Upload supporting documents',
    category: 'documents'
  },
  submissionTime: {
    name: 'Submission Time',
    type: 'datetime',
    description: 'Bid submission deadline',
    category: 'timeline'
  },
  
  // Technical Specifications
  techSpecs: {
    name: 'Tech Specs',
    type: 'file',
    description: 'Upload technical specifications document',
    category: 'technical'
  },
  authorizationLetter: {
    name: 'Authorization Letter',
    type: 'file',
    description: 'Upload signed authorization letter',
    category: 'documents'
  },
  pan: {
    name: 'PAN',
    type: 'text',
    validation: [
      { type: 'pattern', value: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', message: 'Invalid PAN format' }
    ],
    category: 'compliance'
  },
  gst: {
    name: 'GST',
    type: 'text',
    validation: [
      { type: 'pattern', value: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', message: 'Invalid GST format' }
    ],
    category: 'compliance'
  },
  experienceProof: {
    name: 'Experience Proof',
    type: 'file',
    description: 'Upload certificates and project references',
    category: 'qualification'
  },
  iso: {
    name: 'ISO',
    type: 'dropdown',
    options: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'Not Applicable'],
    category: 'certification'
  },
  brochures: {
    name: 'Brochures',
    type: 'multifile',
    description: 'Upload product/service brochures',
    category: 'marketing'
  },
  
  // Technical Bid Fields
  boqCompliance: {
    name: 'BoQ Compliance',
    type: 'checkbox',
    description: 'Confirm BoQ compliance',
    category: 'compliance'
  },
  specificationMatch: {
    name: 'Specification Match',
    type: 'checkbox',
    description: 'Confirm specification compliance',
    category: 'compliance'
  },
  uploads: {
    name: 'Uploads',
    type: 'multifile',
    description: 'Upload all required documents',
    category: 'documents'
  },
  termsAcceptance: {
    name: 'Terms Acceptance',
    type: 'checkbox',
    required: true,
    description: 'Accept all terms and conditions',
    category: 'compliance'
  },
  dsc: {
    name: 'DSC',
    type: 'verification',
    description: 'Digital Signature Certificate verification',
    category: 'security'
  },
  
  // Financial Bid Fields
  unitRate: {
    name: 'Unit Rate',
    type: 'numeric',
    description: 'Rate per unit',
    category: 'pricing'
  },
  gstRate: {
    name: 'GST Rate',
    type: 'dropdown',
    options: ['0%', '5%', '12%', '18%', '28%'],
    category: 'pricing'
  },
  boqFormatUpload: {
    name: 'BoQ Format Upload',
    type: 'file',
    description: 'Upload completed BoQ in prescribed format',
    category: 'pricing'
  },
  priceBreakup: {
    name: 'Price Breakup',
    type: 'table',
    description: 'Detailed price breakdown',
    category: 'pricing'
  },
  
  // Evaluation Fields
  evaluationStatus: {
    name: 'Evaluation Status',
    type: 'dropdown',
    options: ['Qualified', 'Rejected', 'Under Review', 'Pending Documents'],
    category: 'evaluation'
  },
  clarificationRequest: {
    name: 'Clarification Request',
    type: 'textarea',
    placeholder: 'Enter clarification details',
    category: 'communication'
  },
  responseTime: {
    name: 'Response Time',
    type: 'datetime',
    description: 'Deadline for response',
    category: 'timeline'
  },
  
  // Reverse Auction Fields
  raWindowTime: {
    name: 'RA Window Time',
    type: 'daterange',
    description: 'Reverse auction time window',
    category: 'auction'
  },
  startingPrice: {
    name: 'Starting Price',
    type: 'numeric',
    description: 'Initial auction price',
    category: 'auction'
  },
  decrementRange: {
    name: 'Decrement Range',
    type: 'numeric',
    description: 'Minimum price decrement',
    category: 'auction'
  },
  
  // Purchase Order Fields
  poNo: {
    name: 'PO No.',
    type: 'autonumber',
    description: 'Purchase order number',
    category: 'order'
  },
  acceptanceClick: {
    name: 'Acceptance Click',
    type: 'checkbox',
    description: 'Click to accept purchase order',
    category: 'order'
  },
  commitmentDate: {
    name: 'Commitment Date',
    type: 'date',
    description: 'Delivery commitment date',
    category: 'order'
  },
  acknowledgmentUpload: {
    name: 'Acknowledgment Upload',
    type: 'file',
    description: 'Upload signed acknowledgment',
    category: 'order'
  },
  
  // Delivery Fields
  deliveryChallan: {
    name: 'Delivery Challan',
    type: 'file',
    description: 'Upload delivery challan',
    category: 'delivery'
  },
  grn: {
    name: 'GRN',
    type: 'text',
    description: 'Goods Receipt Note number',
    category: 'delivery'
  },
  transportDetails: {
    name: 'Transport Details',
    type: 'textarea',
    placeholder: 'Enter transport and logistics details',
    category: 'delivery'
  },
  photoUpload: {
    name: 'Photo Upload',
    type: 'image',
    description: 'Upload delivery photos',
    category: 'delivery'
  },
  
  // Inspection Fields
  inspectionStatus: {
    name: 'Status',
    type: 'dropdown',
    options: ['Accepted', 'Rejected', 'Partial', 'Under Inspection'],
    category: 'inspection'
  },
  inspectionComments: {
    name: 'Comments',
    type: 'textarea',
    placeholder: 'Enter inspection comments',
    category: 'inspection'
  },
  
  // Invoice Fields
  invoiceNo: {
    name: 'Invoice No.',
    type: 'text',
    description: 'Invoice number',
    category: 'invoice'
  },
  taxBreakup: {
    name: 'Tax Breakup',
    type: 'table',
    description: 'Detailed tax calculation',
    category: 'invoice'
  },
  poReference: {
    name: 'PO Reference',
    type: 'lookup',
    description: 'Reference to purchase order',
    category: 'invoice'
  },
  invoiceUpload: {
    name: 'Upload PDF',
    type: 'file',
    description: 'Upload invoice PDF',
    category: 'invoice'
  },
  
  // Payment Fields
  paymentStatus: {
    name: 'Payment Status',
    type: 'dropdown',
    options: ['Paid', 'Pending', 'Rejected', 'In Process'],
    category: 'payment'
  },
  utrNo: {
    name: 'UTR No.',
    type: 'text',
    description: 'Unique Transaction Reference',
    category: 'payment'
  },
  paymentDate: {
    name: 'Payment Date',
    type: 'date',
    description: 'Date of payment',
    category: 'payment'
  },
  
  // Feedback Fields
  rating: {
    name: 'Rating',
    type: 'rating',
    description: 'Rate from 1 to 5 stars',
    category: 'feedback'
  },
  feedbackComments: {
    name: 'Comments',
    type: 'textarea',
    placeholder: 'Enter feedback comments',
    category: 'feedback'
  },
  reviewFiling: {
    name: 'Review Filing',
    type: 'checkbox',
    description: 'File review if needed',
    category: 'feedback'
  }
};

// Field categories for organization
export const FIELD_CATEGORIES = {
  basic: 'Basic Information',
  documents: 'Documents',
  requirements: 'Requirements',
  financial: 'Financial',
  terms: 'Terms & Conditions',
  delivery: 'Delivery',
  communication: 'Communication',
  timeline: 'Timeline',
  technical: 'Technical',
  compliance: 'Compliance',
  qualification: 'Qualification',
  certification: 'Certification',
  marketing: 'Marketing',
  pricing: 'Pricing',
  evaluation: 'Evaluation',
  auction: 'Auction',
  order: 'Purchase Order',
  inspection: 'Inspection',
  invoice: 'Invoice',
  payment: 'Payment',
  feedback: 'Feedback',
  security: 'Security'
};