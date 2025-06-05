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
  status: text("status").notNull().default("draft"), // draft, published, in_progress, closed, awarded
  submissionDeadline: timestamp("submission_deadline").notNull(),
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
