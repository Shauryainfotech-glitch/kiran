import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tender document analysis with Claude
export async function analyzeTenderDocument(documentText: string): Promise<{
  summary: string;
  keyRequirements: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  complianceScore: number;
  riskFactors: string[];
  recommendations: string[];
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are an expert tender analysis AI for the AVGC TENDER PRO platform. Analyze tender documents and provide structured insights in JSON format with keys: "summary", "keyRequirements" (array), "estimatedComplexity" (low/medium/high), "complianceScore" (0-100), "riskFactors" (array), "recommendations" (array).`,
      max_tokens: 2048,
      messages: [
        { role: 'user', content: `Analyze this tender document comprehensively:\n\n${documentText}` }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      summary: result.summary,
      keyRequirements: result.keyRequirements || [],
      estimatedComplexity: result.estimatedComplexity || 'medium',
      complianceScore: Math.max(0, Math.min(100, result.complianceScore || 75)),
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || []
    };
  } catch (error: any) {
    throw new Error("Failed to analyze tender document with Claude: " + error.message);
  }
}

// Bid optimization with Claude
export async function optimizeBidStrategy(tenderDetails: any, competitorData: any[]): Promise<{
  recommendedBidAmount: number;
  strategy: string;
  successProbability: number;
  competitiveAnalysis: string;
  pricingRecommendations: string[];
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a bid optimization expert for the AVGC TENDER PRO platform. Analyze tender details and competitor data to provide optimal bidding strategy in JSON format with keys: "recommendedBidAmount" (number), "strategy" (string), "successProbability" (0-100), "competitiveAnalysis" (string), "pricingRecommendations" (array).`,
      max_tokens: 1024,
      messages: [
        { 
          role: 'user', 
          content: `Optimize bid strategy for this tender:\n\nTender: ${JSON.stringify(tenderDetails)}\n\nCompetitor Data: ${JSON.stringify(competitorData)}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      recommendedBidAmount: result.recommendedBidAmount || 0,
      strategy: result.strategy || 'Balanced competitive approach',
      successProbability: Math.max(0, Math.min(100, result.successProbability || 50)),
      competitiveAnalysis: result.competitiveAnalysis || 'Analysis unavailable',
      pricingRecommendations: result.pricingRecommendations || []
    };
  } catch (error: any) {
    throw new Error("Failed to optimize bid strategy with Claude: " + error.message);
  }
}

// Risk assessment with Claude
export async function assessTenderRisk(tenderData: any): Promise<{
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  financialRisks: string[];
  technicalRisks: string[];
  complianceRisks: string[];
  mitigationStrategies: string[];
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a risk assessment specialist for the AVGC TENDER PRO platform. Evaluate tender risks comprehensively and provide assessment in JSON format with keys: "overallRisk" (low/medium/high/critical), "riskScore" (0-100), "financialRisks" (array), "technicalRisks" (array), "complianceRisks" (array), "mitigationStrategies" (array).`,
      max_tokens: 1024,
      messages: [
        { 
          role: 'user', 
          content: `Assess risks for this tender comprehensively:\n\n${JSON.stringify(tenderData)}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      overallRisk: result.overallRisk || 'medium',
      riskScore: Math.max(0, Math.min(100, result.riskScore || 50)),
      financialRisks: result.financialRisks || [],
      technicalRisks: result.technicalRisks || [],
      complianceRisks: result.complianceRisks || [],
      mitigationStrategies: result.mitigationStrategies || []
    };
  } catch (error: any) {
    throw new Error("Failed to assess tender risk with Claude: " + error.message);
  }
}

// Generate tender response with Claude
export async function generateTenderResponse(tenderRequirements: string, companyProfile: any): Promise<{
  proposal: string;
  technicalApproach: string;
  timeline: string;
  teamStructure: string;
  qualityAssurance: string;
  valueProposition: string;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a tender response specialist for the AVGC TENDER PRO platform. Generate comprehensive tender responses in JSON format with keys: "proposal", "technicalApproach", "timeline", "teamStructure", "qualityAssurance", "valueProposition".`,
      max_tokens: 2048,
      messages: [
        { 
          role: 'user', 
          content: `Generate a professional tender response:\n\nRequirements: ${tenderRequirements}\n\nCompany Profile: ${JSON.stringify(companyProfile)}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      proposal: result.proposal || 'Comprehensive proposal generated',
      technicalApproach: result.technicalApproach || 'Detailed technical methodology',
      timeline: result.timeline || 'Project timeline with milestones',
      teamStructure: result.teamStructure || 'Expert team composition',
      qualityAssurance: result.qualityAssurance || 'Quality management framework',
      valueProposition: result.valueProposition || 'Unique value delivery approach'
    };
  } catch (error: any) {
    throw new Error("Failed to generate tender response with Claude: " + error.message);
  }
}

// Compliance checking with Claude
export async function checkCompliance(documentContent: string, regulations: string[]): Promise<{
  isCompliant: boolean;
  complianceScore: number;
  violations: string[];
  recommendations: string[];
  requiredActions: string[];
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a compliance expert for the AVGC TENDER PRO platform. Check document compliance against regulations and provide assessment in JSON format with keys: "isCompliant" (boolean), "complianceScore" (0-100), "violations" (array), "recommendations" (array), "requiredActions" (array).`,
      max_tokens: 1024,
      messages: [
        { 
          role: 'user', 
          content: `Check compliance of this document:\n\nDocument: ${documentContent}\n\nRegulations: ${regulations.join(', ')}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      isCompliant: result.isCompliant || false,
      complianceScore: Math.max(0, Math.min(100, result.complianceScore || 0)),
      violations: result.violations || [],
      recommendations: result.recommendations || [],
      requiredActions: result.requiredActions || []
    };
  } catch (error: any) {
    throw new Error("Failed to check compliance with Claude: " + error.message);
  }
}

// Summarize tender documents with Claude
export async function summarizeTenderDocument(documentText: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { 
          role: 'user', 
          content: `Provide a comprehensive summary of this tender document, highlighting key requirements, deadlines, evaluation criteria, and important terms:\n\n${documentText}` 
        }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    return content.text;
  } catch (error: any) {
    throw new Error("Failed to summarize document with Claude: " + error.message);
  }
}

export async function extractGemBidData(documentText: string): Promise<{
  title?: string;
  description?: string;
  organization?: string;
  category?: string;
  estimatedValue?: number;
  deadline?: string;
  location?: string;
  priority?: string;
  requirements?: string[];
  tags?: string[];
  bidNumber?: string;
  bidType?: string;
  department?: string;
  itemCategory?: string;
  contractPeriod?: string;
  evaluationMethod?: string;
  technicalQualification?: string;
  financialDocument?: boolean;
  emdRequired?: boolean;
  epbcRequired?: boolean;
  msePurchasePreference?: boolean;
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured. Please provide your Claude API key in the admin settings.");
  }

  const prompt = `
    Extract structured information from this tender document for Gem Bid creation. 
    Analyze the document and provide the extracted data in JSON format:

    ${documentText}

    Extract the following fields if available:
    - title: The main title or name of the tender/bid
    - description: Brief description or summary of the project
    - organization: Name of the procuring organization/entity
    - category: Type of tender (infrastructure, technology, construction, consulting, supplies)
    - estimatedValue: Financial value in numbers only (no currency symbols)
    - deadline: Bid submission deadline in YYYY-MM-DD format
    - location: Project location or delivery location
    - priority: low, medium, or high based on urgency indicators
    - requirements: Array of key requirements or specifications
    - tags: Array of relevant keywords or categories
    - bidNumber: Official bid/tender number if mentioned
    - bidType: Type of bidding process
    - department: Government department or ministry
    - itemCategory: Specific category of items/services
    - contractPeriod: Duration of the contract
    - evaluationMethod: How bids will be evaluated
    - technicalQualification: Technical requirements summary
    - financialDocument: true if financial documents are required
    - emdRequired: true if Earnest Money Deposit is required
    - epbcRequired: true if EPBC is required
    - msePurchasePreference: true if MSE purchase preference applies

    Return only valid JSON with available fields. If a field cannot be determined, omit it from the response.
  `;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const extractedData = JSON.parse(content.text);
    return extractedData;
  } catch (error) {
    console.error('Failed to parse extracted data:', error);
    // Return basic extracted information if JSON parsing fails
    return {
      title: "",
      description: "",
      organization: "",
      category: "infrastructure",
      estimatedValue: 0,
      deadline: "",
      location: "",
      priority: "medium",
      requirements: [],
      tags: []
    };
  }
}