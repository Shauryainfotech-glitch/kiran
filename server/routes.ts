import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTenderSchema, insertVendorSchema, insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import * as claude from "./claude";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tenders routes
  app.get("/api/tenders", async (req, res) => {
    try {
      const { status } = req.query;
      let tenders;
      
      if (status && typeof status === 'string') {
        tenders = await storage.getTendersByStatus(status);
      } else {
        tenders = await storage.getTenders();
      }
      
      res.json(tenders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tender = await storage.getTender(id);
      
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      res.json(tender);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tender" });
    }
  });

  app.post("/api/tenders", async (req, res) => {
    try {
      const data = insertTenderSchema.parse(req.body);
      const tender = await storage.createTender(data);
      res.status(201).json(tender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tender data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tender" });
    }
  });

  app.put("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertTenderSchema.partial().parse(req.body);
      const tender = await storage.updateTender(id, data);
      
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      res.json(tender);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tender data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tender" });
    }
  });

  app.delete("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTender(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tender" });
    }
  });

  // Vendors routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const data = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(data);
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(id, data);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVendor(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Submissions routes
  app.get("/api/submissions", async (req, res) => {
    try {
      const { tenderId, vendorId } = req.query;
      let submissions;
      
      if (tenderId) {
        submissions = await storage.getSubmissionsByTender(parseInt(tenderId as string));
      } else if (vendorId) {
        submissions = await storage.getSubmissionsByVendor(parseInt(vendorId as string));
      } else {
        submissions = await storage.getSubmissions();
      }
      
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const data = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allTenders = await storage.getTenders();
      const activeTenders = allTenders.filter(t => t.status === 'published' || t.status === 'in_progress');
      
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueThisWeek = allTenders.filter(t => 
        new Date(t.submissionDeadline) <= oneWeekFromNow && 
        new Date(t.submissionDeadline) >= now
      );
      
      const totalValue = allTenders.reduce((sum, tender) => 
        sum + (parseFloat(tender.estimatedValue || '0')), 0
      );
      
      const closedTenders = allTenders.filter(t => t.status === 'closed' || t.status === 'awarded');
      const successRate = allTenders.length > 0 ? 
        Math.round((closedTenders.length / allTenders.length) * 100) : 0;

      res.json({
        activeTenders: activeTenders.length,
        dueThisWeek: dueThisWeek.length,
        totalValue: totalValue,
        successRate: successRate
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
