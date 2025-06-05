import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("viewer"), // admin, tender_manager, viewer
  email: text("email"),
});

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  reference: text("reference").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  status: text("status").notNull().default("draft"), // draft, published, in_progress, closed, awarded, fresh, live, submitted
  submissionDeadline: timestamp("submission_deadline").notNull(),
  openingDate: timestamp("opening_date"),
  startDate: timestamp("start_date"),
  location: text("location"),
  department: text("department"),
  ownership: text("ownership"), // Central Government, State Government, Private
  documentFees: decimal("document_fees", { precision: 15, scale: 2 }),
  emdValue: decimal("emd_value", { precision: 15, scale: 2 }),
  tenderType: text("tender_type").default("BSPTL"),
  organizationName: text("organization_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  registrationNumber: text("registration_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  bidAmount: decimal("bid_amount", { precision: 15, scale: 2 }),
  status: text("status").notNull().default("submitted"), // submitted, under_review, accepted, rejected
  notes: text("notes"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  submissionId: integer("submission_id").references(() => submissions.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Firms table for multiple firm management
export const firms = pgTable("firms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number"),
  address: text("address"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  establishedDate: timestamp("established_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Document categories table
export const documentCategories = pgTable("document_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(false),
  sortOrder: integer("sort_order").default(0),
});

// Firm documents table - enhanced document management per firm
export const firmDocuments = pgTable("firm_documents", {
  id: serial("id").primaryKey(),
  firmId: integer("firm_id").references(() => firms.id).notNull(),
  categoryId: integer("category_id").references(() => documentCategories.id),
  documentName: text("document_name").notNull(),
  documentNumber: text("document_number"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  status: text("status").default("Available"), // Available, In Process, As per need, etc.
  validity: timestamp("validity"),
  renewal: text("renewal"), // Every Year Update, Require, etc.
  googleLinking: text("google_linking"),
  responsible: text("responsible"),
  charges: decimal("charges", { precision: 15, scale: 2 }),
  duration: text("duration"),
  challenges: text("challenges"),
  timeline: text("timeline"),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  version: integer("version").default(1),
  parentDocumentId: integer("parent_document_id"),
  isLatestVersion: boolean("is_latest_version").default(true),
  approvalStatus: text("approval_status").default("Pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  tags: text("tags").array(),
  priority: text("priority").default("Medium"),
  confidentialityLevel: text("confidentiality_level").default("Public"),
});

// Document versions table for version history
export const documentVersions = pgTable("document_versions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => firmDocuments.id),
  version: integer("version").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  changes: text("changes"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Document audit log
export const documentAuditLog = pgTable("document_audit_log", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => firmDocuments.id),
  action: text("action").notNull(),
  details: text("details"),
  performedBy: integer("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Document shares and permissions
export const documentShares = pgTable("document_shares", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => firmDocuments.id),
  sharedWith: integer("shared_with").references(() => users.id),
  sharedBy: integer("shared_by").references(() => users.id),
  permission: text("permission").default("view"), // view, edit, admin
  sharedAt: timestamp("shared_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

// Document bulk operations
export const documentBulkOperations = pgTable("document_bulk_operations", {
  id: serial("id").primaryKey(),
  operationType: text("operation_type").notNull(), // move, delete, update_status, bulk_approve
  documentIds: integer("document_ids").array(),
  parameters: jsonb("parameters"), // operation-specific parameters
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  initiatedBy: integer("initiated_by").references(() => users.id),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  affectedCount: integer("affected_count"),
});

export const financeTransactions = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  organizationName: text("organization_name").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  type: text("type").notNull(), // EMD, SD, Fees
  mode: text("mode").notNull(), // Online, Offline
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  favour: text("favour"),
  enteredBy: text("entered_by"),
  status: text("status").notNull().default("pending"), // pending, paid, refund, forfeited
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  assignedBy: integer("assigned_by").references(() => users.id),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  approvalFor: text("approval_for").notNull(),
  requestedBy: integer("requested_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  status: text("status").default("pending"), // pending, approved, rejected
  requestDate: timestamp("request_date").notNull().defaultNow(),
  actionDate: timestamp("action_date"),
  deadline: timestamp("deadline"),
  comments: text("comments"),
});

export const gemBids = pgTable("gem_bids", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  organization: text("organization"),
  category: text("category"),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  deadline: date("deadline"),
  location: text("location"),
  priority: text("priority").default("medium"),
  requirements: text("requirements").array(),
  tags: text("tags").array(),
  bidNumber: text("bid_number"),
  bidType: text("bid_type"),
  department: text("department"),
  itemCategory: text("item_category"),
  contractPeriod: text("contract_period"),
  evaluationMethod: text("evaluation_method"),
  technicalQualification: text("technical_qualification"),
  financialDocument: boolean("financial_document").default(false),
  emdRequired: boolean("emd_required").default(false),
  epbcRequired: boolean("epbc_required").default(false),
  msePurchasePreference: boolean("mse_purchase_preference").default(false),
  status: text("status").default("active"),
  submissionCount: integer("submission_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  submissionDeadline: z.union([z.string(), z.date()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  openingDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }).optional(),
  startDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }).optional(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertFinanceTransactionSchema = createInsertSchema(financeTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
  requestDate: true,
  actionDate: true,
});

export const insertFirmSchema = createInsertSchema(firms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentCategorySchema = createInsertSchema(documentCategories).omit({
  id: true,
});

export const insertFirmDocumentSchema = createInsertSchema(firmDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertGemBidSchema = createInsertSchema(gemBids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  deadline: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertFinanceTransaction = z.infer<typeof insertFinanceTransactionSchema>;
export type FinanceTransaction = typeof financeTransactions.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;

export type InsertFirm = z.infer<typeof insertFirmSchema>;
export type Firm = typeof firms.$inferSelect;

export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;
export type DocumentCategory = typeof documentCategories.$inferSelect;

export type InsertFirmDocument = z.infer<typeof insertFirmDocumentSchema>;
export type FirmDocument = typeof firmDocuments.$inferSelect;

export type InsertGemBid = z.infer<typeof insertGemBidSchema>;
export type GemBid = typeof gemBids.$inferSelect;
