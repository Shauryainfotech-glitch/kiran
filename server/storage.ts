import { 
  users, 
  tenders, 
  vendors, 
  submissions, 
  documents,
  firms,
  documentCategories,
  firmDocuments,
  gemBids,
  type User, 
  type InsertUser,
  type Tender,
  type InsertTender,
  type Vendor,
  type InsertVendor,
  type Submission,
  type InsertSubmission,
  type Document,
  type InsertDocument,
  type Firm,
  type InsertFirm,
  type DocumentCategory,
  type InsertDocumentCategory,
  type FirmDocument,
  type InsertFirmDocument,
  type GemBid,
  type InsertGemBid
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

  // Firms
  getFirms(): Promise<Firm[]>;
  getFirm(id: number): Promise<Firm | undefined>;
  createFirm(firm: InsertFirm): Promise<Firm>;
  updateFirm(id: number, firm: Partial<InsertFirm>): Promise<Firm | undefined>;
  deleteFirm(id: number): Promise<boolean>;

  // Document Categories
  getDocumentCategories(): Promise<DocumentCategory[]>;
  getDocumentCategory(id: number): Promise<DocumentCategory | undefined>;
  createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory>;
  updateDocumentCategory(id: number, category: Partial<InsertDocumentCategory>): Promise<DocumentCategory | undefined>;
  deleteDocumentCategory(id: number): Promise<boolean>;

  // Firm Documents
  getFirmDocuments(): Promise<FirmDocument[]>;
  getFirmDocumentsByFirm(firmId: number): Promise<FirmDocument[]>;
  getFirmDocumentsByCategory(categoryId: number): Promise<FirmDocument[]>;
  getFirmDocument(id: number): Promise<FirmDocument | undefined>;
  createFirmDocument(document: InsertFirmDocument): Promise<FirmDocument>;
  updateFirmDocument(id: number, document: Partial<InsertFirmDocument>): Promise<FirmDocument | undefined>;
  deleteFirmDocument(id: number): Promise<boolean>;

  // Gem Bids
  getGemBids(): Promise<GemBid[]>;
  getGemBid(id: number): Promise<GemBid | undefined>;
  createGemBid(gemBid: InsertGemBid): Promise<GemBid>;
  updateGemBid(id: number, gemBid: Partial<InsertGemBid>): Promise<GemBid | undefined>;
  deleteGemBid(id: number): Promise<boolean>;
  getGemBidsByCategory(category: string): Promise<GemBid[]>;
  getGemBidsByStatus(status: string): Promise<GemBid[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tenders: Map<number, Tender>;
  private vendors: Map<number, Vendor>;
  private submissions: Map<number, Submission>;
  private documents: Map<number, Document>;
  private firms: Map<number, Firm>;
  private documentCategories: Map<number, DocumentCategory>;
  private firmDocuments: Map<number, FirmDocument>;
  private currentUserId: number;
  private currentTenderId: number;
  private currentVendorId: number;
  private currentSubmissionId: number;
  private currentDocumentId: number;
  private currentFirmId: number;
  private currentDocumentCategoryId: number;
  private currentFirmDocumentId: number;
  private gemBids: Map<number, GemBid>;
  private currentGemBidId: number;

  constructor() {
    this.users = new Map();
    this.tenders = new Map();
    this.vendors = new Map();
    this.submissions = new Map();
    this.documents = new Map();
    this.firms = new Map();
    this.documentCategories = new Map();
    this.firmDocuments = new Map();
    this.currentUserId = 1;
    this.currentTenderId = 1;
    this.currentVendorId = 1;
    this.currentSubmissionId = 1;
    this.currentDocumentId = 1;
    this.currentFirmId = 1;
    this.currentDocumentCategoryId = 1;
    this.currentFirmDocumentId = 1;
    this.gemBids = new Map();
    this.currentGemBidId = 1;

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

      // Initialize sample firms
      this.createFirm({
        name: "AVF Creative Brand Consultancy Pvt. Ltd.",
        registrationNumber: "AVF-2024-001",
        address: "Creative Hub, Mumbai, Maharashtra",
        contactPerson: "Creative Director",
        phone: "+91-9876543210",
        email: "info@avfcreative.com",
        isActive: true
      });

      // Initialize document categories
      this.createDocumentCategory({
        name: "Basic Documents",
        description: "Essential company documents",
        isRequired: true,
        sortOrder: 1
      });

      this.createDocumentCategory({
        name: "Advance Document",
        description: "Advanced certification documents",
        isRequired: false,
        sortOrder: 2
      });

      this.createDocumentCategory({
        name: "Empanelment",
        description: "Empanelment related documents",
        isRequired: false,
        sortOrder: 3
      });

      this.createDocumentCategory({
        name: "Membership",
        description: "Professional membership documents",
        isRequired: false,
        sortOrder: 4
      });

      this.createDocumentCategory({
        name: "Gem OEM Panel",
        description: "Gem OEM Panel documents",
        isRequired: false,
        sortOrder: 5
      });

      this.createDocumentCategory({
        name: "Trade Mark",
        description: "Trade mark and intellectual property documents",
        isRequired: false,
        sortOrder: 6
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

  // Firms
  async getFirms(): Promise<Firm[]> {
    return Array.from(this.firms.values());
  }

  async getFirm(id: number): Promise<Firm | undefined> {
    return this.firms.get(id);
  }

  async createFirm(insertFirm: InsertFirm): Promise<Firm> {
    const id = this.currentFirmId++;
    const firm: Firm = {
      ...insertFirm,
      id,
      isActive: insertFirm.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      establishedDate: insertFirm.establishedDate || null,
      registrationNumber: insertFirm.registrationNumber || null,
      address: insertFirm.address || null,
      contactPerson: insertFirm.contactPerson || null,
      phone: insertFirm.phone || null,
      email: insertFirm.email || null,
      website: insertFirm.website || null
    };
    this.firms.set(id, firm);
    return firm;
  }

  async updateFirm(id: number, updates: Partial<InsertFirm>): Promise<Firm | undefined> {
    const firm = this.firms.get(id);
    if (!firm) return undefined;

    const updatedFirm: Firm = {
      ...firm,
      ...updates,
      updatedAt: new Date()
    };
    this.firms.set(id, updatedFirm);
    return updatedFirm;
  }

  async deleteFirm(id: number): Promise<boolean> {
    return this.firms.delete(id);
  }

  // Document Categories
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    return Array.from(this.documentCategories.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getDocumentCategory(id: number): Promise<DocumentCategory | undefined> {
    return this.documentCategories.get(id);
  }

  async createDocumentCategory(insertCategory: InsertDocumentCategory): Promise<DocumentCategory> {
    const id = this.currentDocumentCategoryId++;
    const category: DocumentCategory = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      isRequired: insertCategory.isRequired ?? false,
      sortOrder: insertCategory.sortOrder ?? 0
    };
    this.documentCategories.set(id, category);
    return category;
  }

  async updateDocumentCategory(id: number, updates: Partial<InsertDocumentCategory>): Promise<DocumentCategory | undefined> {
    const category = this.documentCategories.get(id);
    if (!category) return undefined;

    const updatedCategory: DocumentCategory = {
      ...category,
      ...updates
    };
    this.documentCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteDocumentCategory(id: number): Promise<boolean> {
    return this.documentCategories.delete(id);
  }

  // Firm Documents
  async getFirmDocuments(): Promise<FirmDocument[]> {
    return Array.from(this.firmDocuments.values());
  }

  async getFirmDocumentsByFirm(firmId: number): Promise<FirmDocument[]> {
    return Array.from(this.firmDocuments.values()).filter(doc => doc.firmId === firmId);
  }

  async getFirmDocumentsByCategory(categoryId: number): Promise<FirmDocument[]> {
    return Array.from(this.firmDocuments.values()).filter(doc => doc.categoryId === categoryId);
  }

  async getFirmDocument(id: number): Promise<FirmDocument | undefined> {
    return this.firmDocuments.get(id);
  }

  async createFirmDocument(insertDocument: InsertFirmDocument): Promise<FirmDocument> {
    const id = this.currentFirmDocumentId++;
    const document: FirmDocument = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
      categoryId: insertDocument.categoryId || null,
      documentNumber: insertDocument.documentNumber || null,
      fileName: insertDocument.fileName || null,
      fileSize: insertDocument.fileSize || null,
      fileType: insertDocument.fileType || null,
      status: insertDocument.status || "Available",
      validity: insertDocument.validity || null,
      renewal: insertDocument.renewal || null,
      googleLinking: insertDocument.googleLinking || null,
      responsible: insertDocument.responsible || null,
      charges: insertDocument.charges || null,
      duration: insertDocument.duration || null,
      challenges: insertDocument.challenges || null,
      timeline: insertDocument.timeline || null,
      description: insertDocument.description || null,
      createdBy: insertDocument.createdBy || null
    };
    this.firmDocuments.set(id, document);
    return document;
  }

  async updateFirmDocument(id: number, updates: Partial<InsertFirmDocument>): Promise<FirmDocument | undefined> {
    const document = this.firmDocuments.get(id);
    if (!document) return undefined;

    const updatedDocument: FirmDocument = {
      ...document,
      ...updates
    };
    this.firmDocuments.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteFirmDocument(id: number): Promise<boolean> {
    return this.firmDocuments.delete(id);
  }

  // GEM Bid operations
  async getGemBids(): Promise<GemBid[]> {
    return Array.from(this.gemBids.values());
  }

  async getGemBid(id: number): Promise<GemBid | undefined> {
    return this.gemBids.get(id);
  }

  async createGemBid(insertGemBid: InsertGemBid): Promise<GemBid> {
    const gemBid: GemBid = {
      id: this.currentGemBidId++,
      ...insertGemBid,
      submissionCount: 0,
      createdAt: new Date().toISOString()
    };
    this.gemBids.set(gemBid.id, gemBid);
    return gemBid;
  }

  async updateGemBid(id: number, updates: Partial<InsertGemBid>): Promise<GemBid | undefined> {
    const gemBid = this.gemBids.get(id);
    if (!gemBid) return undefined;

    const updatedGemBid: GemBid = {
      ...gemBid,
      ...updates
    };
    this.gemBids.set(id, updatedGemBid);
    return updatedGemBid;
  }

  async deleteGemBid(id: number): Promise<boolean> {
    return this.gemBids.delete(id);
  }

  async getGemBidsByCategory(category: string): Promise<GemBid[]> {
    return Array.from(this.gemBids.values()).filter(bid => bid.category === category);
  }

  async getGemBidsByStatus(status: string): Promise<GemBid[]> {
    return Array.from(this.gemBids.values()).filter(bid => bid.status === status);
  }
}

// Complete DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Tender operations
  async getTenders(): Promise<Tender[]> {
    return await db.select().from(tenders);
  }

  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender || undefined;
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const [tender] = await db
      .insert(tenders)
      .values(insertTender)
      .returning();
    return tender;
  }

  async updateTender(id: number, updates: Partial<InsertTender>): Promise<Tender | undefined> {
    const [tender] = await db
      .update(tenders)
      .set(updates)
      .where(eq(tenders.id, id))
      .returning();
    return tender || undefined;
  }

  async deleteTender(id: number): Promise<boolean> {
    const result = await db.delete(tenders).where(eq(tenders.id, id));
    return result.rowCount > 0;
  }

  async getTendersByStatus(status: string): Promise<Tender[]> {
    return await db.select().from(tenders).where(eq(tenders.status, status));
  }

  // Vendor operations
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(updates)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount > 0;
  }

  // Submission operations
  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async getSubmissionsByTender(tenderId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.tenderId, tenderId));
  }

  async getSubmissionsByVendor(vendorId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.vendorId, vendorId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async updateSubmission(id: number, updates: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set(updates)
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentsByTender(tenderId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.tenderId, tenderId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }

  // Firm operations
  async getFirms(): Promise<Firm[]> {
    return await db.select().from(firms);
  }

  async getFirm(id: number): Promise<Firm | undefined> {
    const [firm] = await db.select().from(firms).where(eq(firms.id, id));
    return firm || undefined;
  }

  async createFirm(insertFirm: InsertFirm): Promise<Firm> {
    const [firm] = await db
      .insert(firms)
      .values(insertFirm)
      .returning();
    return firm;
  }

  async updateFirm(id: number, updates: Partial<InsertFirm>): Promise<Firm | undefined> {
    const [firm] = await db
      .update(firms)
      .set(updates)
      .where(eq(firms.id, id))
      .returning();
    return firm || undefined;
  }

  async deleteFirm(id: number): Promise<boolean> {
    const result = await db.delete(firms).where(eq(firms.id, id));
    return result.rowCount > 0;
  }

  // Document Category operations
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    return await db.select().from(documentCategories);
  }

  async getDocumentCategory(id: number): Promise<DocumentCategory | undefined> {
    const [category] = await db.select().from(documentCategories).where(eq(documentCategories.id, id));
    return category || undefined;
  }

  async createDocumentCategory(insertCategory: InsertDocumentCategory): Promise<DocumentCategory> {
    const [category] = await db
      .insert(documentCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateDocumentCategory(id: number, updates: Partial<InsertDocumentCategory>): Promise<DocumentCategory | undefined> {
    const [category] = await db
      .update(documentCategories)
      .set(updates)
      .where(eq(documentCategories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteDocumentCategory(id: number): Promise<boolean> {
    const result = await db.delete(documentCategories).where(eq(documentCategories.id, id));
    return result.rowCount > 0;
  }

  // Firm Document operations
  async getFirmDocuments(): Promise<FirmDocument[]> {
    return await db.select().from(firmDocuments);
  }

  async getFirmDocumentsByFirm(firmId: number): Promise<FirmDocument[]> {
    return await db.select().from(firmDocuments).where(eq(firmDocuments.firmId, firmId));
  }

  async getFirmDocumentsByCategory(categoryId: number): Promise<FirmDocument[]> {
    return await db.select().from(firmDocuments).where(eq(firmDocuments.categoryId, categoryId));
  }

  async getFirmDocument(id: number): Promise<FirmDocument | undefined> {
    const [document] = await db.select().from(firmDocuments).where(eq(firmDocuments.id, id));
    return document || undefined;
  }

  async createFirmDocument(insertDocument: InsertFirmDocument): Promise<FirmDocument> {
    const [document] = await db
      .insert(firmDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateFirmDocument(id: number, updates: Partial<InsertFirmDocument>): Promise<FirmDocument | undefined> {
    const [document] = await db
      .update(firmDocuments)
      .set(updates)
      .where(eq(firmDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async deleteFirmDocument(id: number): Promise<boolean> {
    const result = await db.delete(firmDocuments).where(eq(firmDocuments.id, id));
    return result.rowCount > 0;
  }

  async getTenders(): Promise<Tender[]> {
    return await db.select().from(tenders);
  }

  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender || undefined;
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const [tender] = await db
      .insert(tenders)
      .values(insertTender)
      .returning();
    return tender;
  }

  async updateTender(id: number, updates: Partial<InsertTender>): Promise<Tender | undefined> {
    const [tender] = await db
      .update(tenders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tenders.id, id))
      .returning();
    return tender || undefined;
  }

  async deleteTender(id: number): Promise<boolean> {
    const result = await db.delete(tenders).where(eq(tenders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTendersByStatus(status: string): Promise<Tender[]> {
    return await db.select().from(tenders).where(eq(tenders.status, status));
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(updates)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async getSubmissionsByTender(tenderId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.tenderId, tenderId));
  }

  async getSubmissionsByVendor(vendorId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.vendorId, vendorId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async updateSubmission(id: number, updates: Partial<InsertSubmission>): Promise<Submission | undefined> {
    const [submission] = await db
      .update(submissions)
      .set(updates)
      .where(eq(submissions.id, id))
      .returning();
    return submission || undefined;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentsByTender(tenderId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.tenderId, tenderId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Gem Bids
  async getGemBids(): Promise<GemBid[]> {
    return await db.select().from(gemBids);
  }

  async getGemBid(id: number): Promise<GemBid | undefined> {
    const [gemBid] = await db.select().from(gemBids).where(eq(gemBids.id, id));
    return gemBid;
  }

  async createGemBid(insertGemBid: InsertGemBid): Promise<GemBid> {
    const [gemBid] = await db
      .insert(gemBids)
      .values(insertGemBid)
      .returning();
    return gemBid;
  }

  async updateGemBid(id: number, updates: Partial<InsertGemBid>): Promise<GemBid | undefined> {
    const [gemBid] = await db
      .update(gemBids)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gemBids.id, id))
      .returning();
    return gemBid;
  }

  async deleteGemBid(id: number): Promise<boolean> {
    const result = await db.delete(gemBids).where(eq(gemBids.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getGemBidsByCategory(category: string): Promise<GemBid[]> {
    return await db.select().from(gemBids).where(eq(gemBids.category, category));
  }

  async getGemBidsByStatus(status: string): Promise<GemBid[]> {
    return await db.select().from(gemBids).where(eq(gemBids.status, status));
  }
}

export const storage = new DatabaseStorage();
