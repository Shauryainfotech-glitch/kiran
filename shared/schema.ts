import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
