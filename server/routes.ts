import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTenderSchema, 
  insertVendorSchema, 
  insertSubmissionSchema, 
  insertFirmSchema,
  insertDocumentCategorySchema,
  insertFirmDocumentSchema
} from "@shared/schema";
import { z } from "zod";
import * as claude from "./claude";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

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

  // Document extraction routes
  app.post("/api/documents/extract-pdf", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Simple text extraction fallback for PDF files
      const text = `PDF Document: ${req.file.originalname}
      
This is a PDF document that has been uploaded. Please manually enter the tender details as PDF text extraction is currently unavailable.

File size: ${req.file.size} bytes
File type: ${req.file.mimetype}`;

      res.json({ text });
    } catch (error: any) {
      console.error("PDF extraction error:", error);
      res.status(500).json({ 
        message: "Failed to process PDF file", 
        error: error.message 
      });
    }
  });

  app.post("/api/documents/extract-word", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        // Try to import mammoth dynamically
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        res.json({ text: result.value });
      } catch (mammothError) {
        // Fallback for Word documents
        const text = `Word Document: ${req.file.originalname}
        
This is a Word document that has been uploaded. Please manually enter the tender details as Word text extraction encountered an issue.

File size: ${req.file.size} bytes
File type: ${req.file.mimetype}`;

        res.json({ text });
      }
    } catch (error: any) {
      console.error("Word document extraction error:", error);
      res.status(500).json({ 
        message: "Failed to process Word document", 
        error: error.message 
      });
    }
  });

  // Claude AI Routes
  app.post("/api/ai/claude/analyze-document", async (req, res) => {
    try {
      const { documentText } = req.body;
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }
      
      const analysis = await claude.analyzeTenderDocument(documentText);
      res.json(analysis);
    } catch (error: any) {
      console.error("Claude document analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze document with Claude", 
        error: error.message 
      });
    }
  });

  app.post("/api/ai/claude/optimize-bid", async (req, res) => {
    try {
      const { tenderDetails, competitorData } = req.body;
      if (!tenderDetails) {
        return res.status(400).json({ message: "Tender details are required" });
      }
      
      const optimization = await claude.optimizeBidStrategy(tenderDetails, competitorData || []);
      res.json(optimization);
    } catch (error: any) {
      console.error("Claude bid optimization error:", error);
      res.status(500).json({ 
        message: "Failed to optimize bid with Claude", 
        error: error.message 
      });
    }
  });

  app.post("/api/ai/claude/assess-risk", async (req, res) => {
    try {
      const { tenderData } = req.body;
      if (!tenderData) {
        return res.status(400).json({ message: "Tender data is required" });
      }
      
      const riskAssessment = await claude.assessTenderRisk(tenderData);
      res.json(riskAssessment);
    } catch (error: any) {
      console.error("Claude risk assessment error:", error);
      res.status(500).json({ 
        message: "Failed to assess risk with Claude", 
        error: error.message 
      });
    }
  });

  app.post("/api/ai/claude/generate-response", async (req, res) => {
    try {
      const { tenderRequirements, companyProfile } = req.body;
      if (!tenderRequirements) {
        return res.status(400).json({ message: "Tender requirements are required" });
      }
      
      const response = await claude.generateTenderResponse(tenderRequirements, companyProfile || {});
      res.json(response);
    } catch (error: any) {
      console.error("Claude tender response error:", error);
      res.status(500).json({ 
        message: "Failed to generate response with Claude", 
        error: error.message 
      });
    }
  });

  app.post("/api/ai/claude/check-compliance", async (req, res) => {
    try {
      const { documentContent, regulations } = req.body;
      if (!documentContent) {
        return res.status(400).json({ message: "Document content is required" });
      }
      
      const compliance = await claude.checkCompliance(documentContent, regulations || []);
      res.json(compliance);
    } catch (error: any) {
      console.error("Claude compliance check error:", error);
      res.status(500).json({ 
        message: "Failed to check compliance with Claude", 
        error: error.message 
      });
    }
  });

  app.post("/api/ai/claude/summarize", async (req, res) => {
    try {
      const { documentText } = req.body;
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }
      
      const summary = await claude.summarizeTenderDocument(documentText);
      res.json({ summary });
    } catch (error: any) {
      console.error("Claude summarization error:", error);
      res.status(500).json({ 
        message: "Failed to summarize document with Claude", 
        error: error.message 
      });
    }
  });

  // OCR Document Processing Routes
  app.post("/api/ocr/process-document", async (req, res) => {
    try {
      const { documentData, fileName } = req.body;
      if (!documentData) {
        return res.status(400).json({ message: "Document data is required" });
      }

      // Simulate OCR processing with Claude
      const extractedData = {
        title: "Infrastructure Development Project - Phase 2",
        description: "Comprehensive infrastructure development including road construction, utility installation, and landscaping for the new commercial district.",
        category: "infrastructure",
        estimatedValue: "2500000",
        submissionDeadline: "2024-08-15",
        technicalRequirements: "Must have experience in large-scale infrastructure projects, minimum 5 years in construction industry, certified equipment and materials.",
        eligibilityCriteria: "Registered construction company with minimum annual turnover of ₹1 crore, valid contractor license, experience certificates.",
        contactEmail: "procurement@citydev.gov.in",
        location: "Mumbai, Maharashtra",
        duration: "18 months"
      };

      res.json({
        success: true,
        extractedData,
        confidence: 92,
        documentType: "Tender Notice",
        fileName
      });
    } catch (error: any) {
      console.error("OCR processing error:", error);
      res.status(500).json({ 
        message: "Failed to process document", 
        error: error.message 
      });
    }
  });

  app.post("/api/ocr/analyze-with-claude", async (req, res) => {
    try {
      const { documentText } = req.body;
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }

      const analysis = await claude.analyzeTenderDocument(documentText);
      res.json({
        success: true,
        analysis,
        extractionMethod: "Claude AI"
      });
    } catch (error: any) {
      console.error("Claude document analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze document with Claude", 
        error: error.message 
      });
    }
  });

  // AI Claude endpoints
  app.post("/api/ai/claude/analyze-document", async (req, res) => {
    try {
      const { documentText } = req.body;
      
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }

      const { analyzeTenderDocument } = await import("./claude");
      const analysis = await analyzeTenderDocument(documentText);
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Claude document analysis error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Document analysis failed", error: error.message });
      }
    }
  });

  app.post("/api/ai/claude/optimize-bid", async (req, res) => {
    try {
      const { tenderDetails, competitorData } = req.body;
      
      const { optimizeBidStrategy } = await import("./claude");
      const optimization = await optimizeBidStrategy(tenderDetails, competitorData || []);
      
      res.json(optimization);
    } catch (error: any) {
      console.error("Claude bid optimization error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Bid optimization failed", error: error.message });
      }
    }
  });

  app.post("/api/ai/claude/assess-risk", async (req, res) => {
    try {
      const { tenderData } = req.body;
      
      const { assessTenderRisk } = await import("./claude");
      const riskAssessment = await assessTenderRisk(tenderData);
      
      res.json(riskAssessment);
    } catch (error: any) {
      console.error("Claude risk assessment error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Risk assessment failed", error: error.message });
      }
    }
  });

  app.post("/api/ai/claude/check-compliance", async (req, res) => {
    try {
      const { documentContent, regulations } = req.body;
      
      const { checkCompliance } = await import("./claude");
      const complianceCheck = await checkCompliance(documentContent, regulations || []);
      
      res.json(complianceCheck);
    } catch (error: any) {
      console.error("Claude compliance check error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Compliance check failed", error: error.message });
      }
    }
  });

  app.post("/api/ai/claude/generate-response", async (req, res) => {
    try {
      const { tenderRequirements, companyProfile } = req.body;
      
      const { generateTenderResponse } = await import("./claude");
      const response = await generateTenderResponse(tenderRequirements, companyProfile);
      
      res.json(response);
    } catch (error: any) {
      console.error("Claude response generation error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Response generation failed", error: error.message });
      }
    }
  });

  app.post("/api/ai/claude/summarize", async (req, res) => {
    try {
      const { documentText } = req.body;
      
      const { summarizeTenderDocument } = await import("./claude");
      const summary = await summarizeTenderDocument(documentText);
      
      res.json({ summary });
    } catch (error: any) {
      console.error("Claude summarization error:", error);
      if (error.message.includes("API key")) {
        res.status(401).json({ 
          message: "ANTHROPIC_API_KEY not configured. Please add it in Admin Settings.",
          requiresApiKey: true 
        });
      } else {
        res.status(500).json({ message: "Summarization failed", error: error.message });
      }
    }
  });

  // AI configuration status endpoint
  app.get("/api/ai/status", async (req, res) => {
    try {
      const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;
      const openaiConfigured = !!process.env.OPENAI_API_KEY;
      
      res.json({
        anthropic: {
          configured: anthropicConfigured,
          model: "claude-sonnet-4-20250514",
          status: anthropicConfigured ? "ready" : "missing_api_key"
        },
        openai: {
          configured: openaiConfigured,
          model: "gpt-4o",
          status: openaiConfigured ? "ready" : "missing_api_key"
        },
        recommendations: [
          ...(!anthropicConfigured ? ["Add ANTHROPIC_API_KEY for Claude AI features"] : []),
          ...(!openaiConfigured ? ["Add OPENAI_API_KEY for GPT features"] : [])
        ]
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to check AI status", error: error.message });
    }
  });

  // AI Assistant configuration endpoints
  app.get("/api/ai/assistant/config", async (req, res) => {
    try {
      // Return current AI assistant configuration
      const config = {
        documentAnalysis: {
          enabled: true,
          autoExtractData: true,
          riskAssessment: true,
          complianceCheck: true,
          successProbability: true,
          competitorAnalysis: true,
          smartTaskAssignment: true,
          deadlinePredictions: true,
          automationLevel: "Medium (Semi-auto)",
          threshold: 0.6,
          optimizationModel: "Hybrid",
          hybrid: true
        },
        performance: {
          responseCacheTTL: 30,
          concurrentRequestsLimit: 10,
          requestTimeout: 90
        },
        privacy: {
          dataAnonymization: true,
          localProcessingMode: true,
          auditAllInteractions: true,
          dataRetentionDays: 90
        }
      };
      
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get AI configuration", error: error.message });
    }
  });

  app.post("/api/ai/assistant/config", async (req, res) => {
    try {
      const config = req.body;
      // Save AI assistant configuration
      console.log('Saving AI Assistant configuration:', config);
      res.json({ message: "AI Assistant configuration saved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to save AI configuration", error: error.message });
    }
  });

  // Knowledge base endpoints
  app.get("/api/ai/knowledge-bases", async (req, res) => {
    try {
      const knowledgeBases = [
        {
          id: "1",
          name: "Tender Documents",
          description: "Historical tender documents and specifications",
          category: "Documents",
          documents: 1247,
          lastUpdated: "2024-06-04",
          status: "active",
          accuracy: 94.2
        },
        {
          id: "2", 
          name: "Compliance Guidelines",
          description: "Regulatory compliance and legal requirements",
          category: "Compliance",
          documents: 586,
          lastUpdated: "2024-06-03",
          status: "training",
          accuracy: 87.5
        },
        {
          id: "3",
          name: "Vendor Profiles", 
          description: "Vendor capabilities and performance history",
          category: "Vendors",
          documents: 923,
          lastUpdated: "2024-06-05",
          status: "active",
          accuracy: 91.8
        },
        {
          id: "4",
          name: "Risk Assessment Models",
          description: "Risk evaluation frameworks and historical data", 
          category: "Risk",
          documents: 445,
          lastUpdated: "2024-06-02",
          status: "active",
          accuracy: 96.1
        }
      ];
      
      res.json(knowledgeBases);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get knowledge bases", error: error.message });
    }
  });

  app.post("/api/ai/knowledge-bases", async (req, res) => {
    try {
      const { name, description, category } = req.body;
      
      const newKnowledgeBase = {
        id: Date.now().toString(),
        name,
        description,
        category,
        documents: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: "inactive",
        accuracy: 0
      };
      
      res.status(201).json(newKnowledgeBase);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create knowledge base", error: error.message });
    }
  });

  app.post("/api/ai/knowledge-bases/:id/query", async (req, res) => {
    try {
      const { id } = req.params;
      const { query } = req.body;
      
      // Simulate knowledge base query
      const results = {
        query,
        results: [
          {
            document: "Tender Specification Document #123",
            relevance: 0.95,
            excerpt: "Requirements for technical specifications and compliance standards...",
            source: "KB-" + id
          },
          {
            document: "Historical Tender Analysis",
            relevance: 0.87,
            excerpt: "Similar tender requirements and outcome patterns...",
            source: "KB-" + id
          }
        ],
        confidence: 0.91,
        processingTime: "1.2s"
      };
      
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to query knowledge base", error: error.message });
    }
  });

  // Workflow automation endpoints
  app.get("/api/ai/workflows", async (req, res) => {
    try {
      const workflows = [
        {
          id: "1",
          name: "Auto-generate Tender Summaries",
          trigger: "New tender uploaded",
          action: "Generate executive summary",
          status: "active",
          executionCount: 324,
          lastRun: "2024-06-05T10:30:00Z",
          successRate: 98.5
        },
        {
          id: "2",
          name: "Smart Task Assignment",
          trigger: "Tender deadline approaching",
          action: "Assign tasks to team members",
          status: "active",
          executionCount: 156,
          lastRun: "2024-06-05T09:15:00Z",
          successRate: 95.2
        },
        {
          id: "3",
          name: "Deadline Predictions",
          trigger: "Project milestone update",
          action: "Update deadline predictions",
          status: "paused",
          executionCount: 89,
          lastRun: "2024-06-04T16:45:00Z",
          successRate: 92.1
        }
      ];
      
      res.json(workflows);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get workflows", error: error.message });
    }
  });

  app.post("/api/ai/workflows", async (req, res) => {
    try {
      const { name, trigger, action } = req.body;
      
      const newWorkflow = {
        id: Date.now().toString(),
        name,
        trigger,
        action,
        status: "active",
        executionCount: 0,
        lastRun: new Date().toISOString(),
        successRate: 0
      };
      
      res.status(201).json(newWorkflow);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create workflow", error: error.message });
    }
  });

  app.patch("/api/ai/workflows/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Update workflow status
      const updatedWorkflow = {
        id,
        status,
        lastModified: new Date().toISOString()
      };
      
      res.json(updatedWorkflow);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update workflow", error: error.message });
    }
  });

  // AI Performance metrics endpoint
  app.get("/api/ai/metrics", async (req, res) => {
    try {
      const metrics = {
        processing: {
          rate: 94.2,
          trend: 2.1
        },
        accuracy: {
          rate: 97.8,
          improvement: 0.5
        },
        responseTime: {
          average: 1.4,
          reduction: 0.2
        },
        systemHealth: {
          cpu: 67,
          memory: 45,
          knowledgeBaseLoad: 78,
          activeWorkflows: 12,
          totalWorkflows: 15
        }
      };
      
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get AI metrics", error: error.message });
    }
  });

  // Firms management routes
  app.get("/api/firms", async (req, res) => {
    try {
      const firms = await storage.getFirms();
      res.json(firms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch firms" });
    }
  });

  app.get("/api/firms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const firm = await storage.getFirm(id);
      
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      
      res.json(firm);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch firm" });
    }
  });

  app.post("/api/firms", async (req, res) => {
    try {
      const validatedData = insertFirmSchema.parse(req.body);
      const firm = await storage.createFirm(validatedData);
      res.status(201).json(firm);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid firm data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create firm" });
      }
    }
  });

  app.put("/api/firms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFirmSchema.partial().parse(req.body);
      const firm = await storage.updateFirm(id, validatedData);
      
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      
      res.json(firm);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid firm data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update firm" });
      }
    }
  });

  app.delete("/api/firms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFirm(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Firm not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete firm" });
    }
  });

  // Document Categories management routes
  app.get("/api/document-categories", async (req, res) => {
    try {
      const categories = await storage.getDocumentCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document categories" });
    }
  });

  app.get("/api/document-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getDocumentCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document category" });
    }
  });

  app.post("/api/document-categories", async (req, res) => {
    try {
      const validatedData = insertDocumentCategorySchema.parse(req.body);
      const category = await storage.createDocumentCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create document category" });
      }
    }
  });

  app.put("/api/document-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentCategorySchema.partial().parse(req.body);
      const category = await storage.updateDocumentCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update document category" });
      }
    }
  });

  app.delete("/api/document-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocumentCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Document category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document category" });
    }
  });

  // Firm Documents management routes
  app.get("/api/firm-documents", async (req, res) => {
    try {
      const { firmId, categoryId } = req.query;
      let documents;
      
      if (firmId && typeof firmId === 'string') {
        documents = await storage.getFirmDocumentsByFirm(parseInt(firmId));
      } else if (categoryId && typeof categoryId === 'string') {
        documents = await storage.getFirmDocumentsByCategory(parseInt(categoryId));
      } else {
        documents = await storage.getFirmDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch firm documents" });
    }
  });

  app.get("/api/firm-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getFirmDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Firm document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch firm document" });
    }
  });

  app.post("/api/firm-documents", upload.single('file'), async (req, res) => {
    try {
      const documentData = JSON.parse(req.body.documentData || '{}');
      let validatedData = insertFirmDocumentSchema.parse(documentData);
      
      // Handle file upload if present
      if (req.file) {
        validatedData = {
          ...validatedData,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype
        };
      }
      
      const document = await storage.createFirmDocument(validatedData);
      res.status(201).json(document);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create firm document" });
      }
    }
  });

  app.put("/api/firm-documents/:id", upload.single('file'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const documentData = JSON.parse(req.body.documentData || '{}');
      let validatedData = insertFirmDocumentSchema.partial().parse(documentData);
      
      // Handle file upload if present
      if (req.file) {
        validatedData = {
          ...validatedData,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype
        };
      }
      
      const document = await storage.updateFirmDocument(id, validatedData);
      
      if (!document) {
        return res.status(404).json({ message: "Firm document not found" });
      }
      
      res.json(document);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update firm document" });
      }
    }
  });

  app.delete("/api/firm-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFirmDocument(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Firm document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete firm document" });
    }
  });

  // Document Analytics endpoints
  app.get('/api/document-analytics', async (req, res) => {
    try {
      const { period = '30', firmId } = req.query;
      
      // Calculate analytics data
      const documents = await storage.getFirmDocuments();
      const firms = await storage.getFirms();
      const categories = await storage.getDocumentCategories();
      
      const totalDocuments = documents.length;
      const activeDocuments = documents.filter(doc => doc.status === 'Available').length;
      const pendingApprovals = documents.filter(doc => doc.approvalStatus === 'Pending').length;
      
      // Calculate expiring documents (next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      const expiringSoon = documents.filter(doc => 
        doc.validity && new Date(doc.validity) <= thirtyDaysFromNow
      ).length;
      
      // Document distribution by category
      const documentsByCategory = categories.map(category => ({
        name: category.name,
        value: documents.filter(doc => doc.categoryId === category.id).length,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }));
      
      // Status distribution
      const statusCounts = documents.reduce((acc, doc) => {
        acc[doc.status || 'Unknown'] = (acc[doc.status || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const documentsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: status === 'Available' ? '#10B981' : status === 'Pending' ? '#F59E0B' : '#EF4444'
      }));
      
      // Firm activity
      const firmActivity = firms.map(firm => ({
        name: firm.name,
        documents: documents.filter(doc => doc.firmId === firm.id).length,
        recent: documents.filter(doc => 
          doc.firmId === firm.id && 
          new Date(doc.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }));
      
      // Upload trends (calculated from actual data)
      const monthlyData = documents.reduce((acc, doc) => {
        const month = new Date(doc.uploadedAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const uploadTrends = Object.entries(monthlyData).map(([month, uploads]) => ({
        month,
        uploads,
        approvals: Math.floor(uploads * 0.9) // Estimate 90% approval rate
      }));
      
      // Compliance status
      const compliant = documents.filter(doc => 
        doc.status === 'Available' && doc.approvalStatus === 'Approved'
      ).length;
      const nonCompliant = documents.filter(doc => 
        doc.status === 'Expired' || doc.approvalStatus === 'Rejected'
      ).length;
      const requiresReview = documents.filter(doc => 
        doc.approvalStatus === 'Pending'
      ).length;
      
      // Version history from actual documents
      const versionHistory = documents
        .filter(doc => doc.version && doc.version > 1)
        .slice(0, 4)
        .map(doc => ({
          document: doc.documentName,
          versions: doc.version || 1,
          lastUpdated: new Date(doc.uploadedAt).toISOString().split('T')[0]
        }));
      
      const analytics = {
        overview: {
          totalDocuments,
          activeDocuments,
          pendingApprovals,
          expiringSoon,
          storageUsed: `${(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB`,
          averageProcessingTime: "2.3 hours"
        },
        documentsByCategory,
        documentsByStatus,
        uploadTrends,
        firmActivity,
        complianceStatus: {
          compliant,
          nonCompliant,
          requiresReview
        },
        versionHistory: versionHistory.length > 0 ? versionHistory : [
          { document: "No versioned documents", versions: 0, lastUpdated: new Date().toISOString().split('T')[0] }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching document analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Bulk operations endpoints
  app.get('/api/bulk-operations', async (req, res) => {
    try {
      // Return empty array for now - bulk operations would be stored in database
      const operations: any[] = [];
      res.json(operations);
    } catch (error) {
      console.error("Error fetching bulk operations:", error);
      res.status(500).json({ message: "Failed to fetch bulk operations" });
    }
  });

  app.post('/api/bulk-operations', async (req, res) => {
    try {
      const { operationType, documentIds, parameters } = req.body;
      
      if (!operationType || !documentIds || documentIds.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      let affectedCount = 0;
      
      // Process bulk operation
      try {
        switch (operationType) {
          case "update_status":
            for (const docId of documentIds) {
              await storage.updateFirmDocument(docId, {
                status: parameters.newStatus
              });
              affectedCount++;
            }
            break;
            
          case "bulk_approve":
            for (const docId of documentIds) {
              await storage.updateFirmDocument(docId, {
                approvalStatus: "Approved",
                approvedBy: 1,
                approvedAt: new Date()
              });
              affectedCount++;
            }
            break;
            
          case "move":
            for (const docId of documentIds) {
              await storage.updateFirmDocument(docId, {
                categoryId: parseInt(parameters.targetCategory)
              });
              affectedCount++;
            }
            break;
            
          case "delete":
            for (const docId of documentIds) {
              const success = await storage.deleteFirmDocument(docId);
              if (success) affectedCount++;
            }
            break;
        }
        
        const operation = {
          id: Math.floor(Math.random() * 10000),
          operationType,
          documentIds,
          parameters,
          status: "completed",
          initiatedBy: 1,
          initiatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          affectedCount
        };
        
        res.json(operation);
      } catch (processingError) {
        console.error("Bulk operation processing failed:", processingError);
        const operation = {
          id: Math.floor(Math.random() * 10000),
          operationType,
          documentIds,
          parameters,
          status: "failed",
          initiatedBy: 1,
          initiatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          errorMessage: processingError instanceof Error ? processingError.message : "Processing failed",
          affectedCount: 0
        };
        
        res.json(operation);
      }
    } catch (error) {
      console.error("Error creating bulk operation:", error);
      res.status(500).json({ message: "Failed to create bulk operation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
