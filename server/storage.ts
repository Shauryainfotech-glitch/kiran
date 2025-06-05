import { 
  users, 
  tenders, 
  vendors, 
  submissions, 
  documents,
  type User, 
  type InsertUser,
  type Tender,
  type InsertTender,
  type Vendor,
  type InsertVendor,
  type Submission,
  type InsertSubmission,
  type Document,
  type InsertDocument
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Tenders
  getTenders(): Promise<Tender[]>;
  getTender(id: number): Promise<Tender | undefined>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined>;
  deleteTender(id: number): Promise<boolean>;
  getTendersByStatus(status: string): Promise<Tender[]>;

  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmissionsByTender(tenderId: number): Promise<Submission[]>;
  getSubmissionsByVendor(vendorId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, submission: Partial<InsertSubmission>): Promise<Submission | undefined>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocumentsByTender(tenderId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenders: Map<number, Tender>;
  private vendors: Map<number, Vendor>;
  private submissions: Map<number, Submission>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentTenderId: number;
  private currentVendorId: number;
  private currentSubmissionId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.tenders = new Map();
    this.vendors = new Map();
    this.submissions = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentTenderId = 1;
    this.currentVendorId = 1;
    this.currentSubmissionId = 1;
    this.currentDocumentId = 1;

    // Create default admin user with sample data
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "John Smith",
      role: "tender_manager",
      email: "admin@tenderflow.com"
    }).then(() => {
      // Add sample tenders for demonstration
      this.createTender({
        title: "IT Infrastructure Upgrade",
        reference: "TND-2024-001",
        description: "Complete modernization of company IT infrastructure including servers, networking equipment, and security systems.",
        category: "IT Services",
        estimatedValue: "150000",
        submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "published",
        createdBy: 1
      });

      this.createTender({
        title: "Office Building Renovation",
        reference: "TND-2024-002", 
        description: "Comprehensive renovation of main office building including HVAC, electrical, and interior design.",
        category: "Construction",
        estimatedValue: "500000",
        submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: "published",
        createdBy: 1
      });

      this.createTender({
        title: "Marketing Campaign Strategy",
        reference: "TND-2024-003",
        description: "Development and execution of comprehensive digital marketing strategy for Q2 product launch.",
        category: "Marketing",
        estimatedValue: "75000",
        submissionDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        status: "draft",
        createdBy: 1
      });

      // Add sample vendors
      this.createVendor({
        name: "TechSolutions Inc",
        email: "contact@techsolutions.com",
        phone: "+1-555-0123",
        address: "123 Tech Street, Silicon Valley, CA 94000",
        contactPerson: "Sarah Johnson",
        registrationNumber: "TS-2024-001"
      });

      this.createVendor({
        name: "BuildPro Construction",
        email: "info@buildpro.com", 
        phone: "+1-555-0456",
        address: "456 Construction Ave, Builder City, TX 75001",
        contactPerson: "Mike Rodriguez",
        registrationNumber: "BP-2024-002"
      });

      this.createVendor({
        name: "Creative Marketing Solutions",
        email: "hello@creativems.com",
        phone: "+1-555-0789",
        address: "789 Creative Blvd, Design Town, NY 10001",
        contactPerson: "Emma Wilson",
        registrationNumber: "CMS-2024-003"
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "viewer",
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  // Tenders
  async getTenders(): Promise<Tender[]> {
    return Array.from(this.tenders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTender(id: number): Promise<Tender | undefined> {
    return this.tenders.get(id);
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const id = this.currentTenderId++;
    const now = new Date();
    const tender: Tender = { 
      ...insertTender, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: insertTender.status || "draft",
      description: insertTender.description || null,
      estimatedValue: insertTender.estimatedValue || null,
      createdBy: insertTender.createdBy || null,
      openingDate: insertTender.openingDate || null,
      startDate: insertTender.startDate || null,
      location: insertTender.location || null,
      department: insertTender.department || null,
      ownership: insertTender.ownership || null,
      documentFees: insertTender.documentFees || null,
      emdValue: insertTender.emdValue || null,
      tenderType: insertTender.tenderType || "BSPTL",
      organizationName: insertTender.organizationName || null
    };
    this.tenders.set(id, tender);
    return tender;
  }

  async updateTender(id: number, updates: Partial<InsertTender>): Promise<Tender | undefined> {
    const tender = this.tenders.get(id);
    if (!tender) return undefined;

    const updatedTender: Tender = {
      ...tender,
      ...updates,
      updatedAt: new Date()
    };
    this.tenders.set(id, updatedTender);
    return updatedTender;
  }

  async deleteTender(id: number): Promise<boolean> {
    return this.tenders.delete(id);
  }

  async getTendersByStatus(status: string): Promise<Tender[]> {
    return Array.from(this.tenders.values()).filter(tender => tender.status === status);
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const vendor: Vendor = { 
      ...insertVendor, 
      id, 
      createdAt: new Date(),
      email: insertVendor.email || null,
      phone: insertVendor.phone || null,
      address: insertVendor.address || null,
      contactPerson: insertVendor.contactPerson || null,
      registrationNumber: insertVendor.registrationNumber || null
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updatedVendor: Vendor = {
      ...vendor,
      ...updates
    };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }

  async getSubmissionsByTender(tenderId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => s.tenderId === tenderId);
  }

  async getSubmissionsByVendor(vendorId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(s => s.vendorId === vendorId);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const submission: Submission = { 
      ...insertSubmission, 
      id, 
      submittedAt: new Date(),
      status: insertSubmission.status || "submitted",
      bidAmount: insertSubmission.bidAmount || null,
      notes: insertSubmission.notes || null
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async updateSubmission(id: number, updates: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;

    const updatedSubmission: Submission = {
      ...submission,
      ...updates
    };
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByTender(tenderId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.tenderId === tenderId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date(),
      tenderId: insertDocument.tenderId || null,
      submissionId: insertDocument.submissionId || null
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
