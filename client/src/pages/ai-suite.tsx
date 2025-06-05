import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  FileText, 
  Eye, 
  BarChart3, 
  Shield, 
  Upload,
  Zap,
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AIAnalysis {
  id: string;
  type: 'document' | 'risk' | 'prediction' | 'intelligence';
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  results?: any;
  createdAt: string;
}

interface RiskAssessment {
  category: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
}

export default function AISuite() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisText, setAnalysisText] = useState("");
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysis | null>(null);

  // Mock AI analysis data - in production this would come from AI services
  const riskAssessments: RiskAssessment[] = [
    {
      category: "Financial Risk",
      score: 85,
      level: "low",
      description: "Strong financial stability indicators",
      recommendations: ["Monitor quarterly reports", "Maintain cash flow tracking"]
    },
    {
      category: "Technical Complexity",
      score: 65,
      level: "medium", 
      description: "Moderate technical challenges identified",
      recommendations: ["Allocate additional technical resources", "Plan phased implementation"]
    },
    {
      category: "Timeline Risk",
      score: 45,
      level: "high",
      description: "Tight deadline constraints detected",
      recommendations: ["Increase team capacity", "Consider milestone adjustments"]
    },
    {
      category: "Regulatory Compliance",
      score: 90,
      level: "low",
      description: "All compliance requirements met",
      recommendations: ["Regular compliance audits", "Update documentation"]
    },
    {
      category: "Market Competition",
      score: 55,
      level: "medium",
      description: "Competitive market environment",
      recommendations: ["Enhance value proposition", "Competitive pricing strategy"]
    },
    {
      category: "Resource Availability",
      score: 70,
      level: "medium",
      description: "Adequate resources with some constraints",
      recommendations: ["Resource optimization", "Backup resource planning"]
    },
    {
      category: "Stakeholder Risk",
      score: 80,
      level: "low",
      description: "Strong stakeholder alignment",
      recommendations: ["Regular stakeholder updates", "Maintain communication channels"]
    }
  ];

  const aiInsights = [
    {
      title: "Tender Success Probability",
      value: "78%",
      trend: "+12%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Document Compliance Score",
      value: "94%", 
      trend: "+5%",
      icon: CheckCircle,
      color: "text-blue-600"
    },
    {
      title: "Risk Assessment",
      value: "Medium",
      trend: "Stable",
      icon: Shield,
      color: "text-yellow-600"
    },
    {
      title: "Processing Time",
      value: "2.3h",
      trend: "-30min",
      icon: Clock,
      color: "text-purple-600"
    }
  ];

  const recentAnalyses: AIAnalysis[] = [
    {
      id: "1",
      type: "document",
      status: "completed",
      progress: 100,
      createdAt: "2025-04-08T10:30:00Z",
      results: { confidence: 0.95, extractedFields: 12, issues: 1 }
    },
    {
      id: "2", 
      type: "risk",
      status: "completed",
      progress: 100,
      createdAt: "2025-04-08T09:15:00Z",
      results: { overallRisk: "medium", criticalIssues: 2 }
    },
    {
      id: "3",
      type: "prediction",
      status: "processing",
      progress: 73,
      createdAt: "2025-04-08T11:00:00Z"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyzeDocument = () => {
    if (!uploadedFile) return;
    
    const newAnalysis: AIAnalysis = {
      id: Date.now().toString(),
      type: "document",
      status: "processing",
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    setActiveAnalysis(newAnalysis);
    
    // Simulate AI processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setActiveAnalysis({
          ...newAnalysis,
          status: "completed",
          progress: 100,
          results: {
            confidence: 0.92,
            extractedFields: 15,
            issues: 2,
            keyInsights: [
              "All mandatory fields detected",
              "Minor formatting inconsistencies found",
              "Compliance score: 94%"
            ]
          }
        });
      } else {
        setActiveAnalysis({
          ...newAnalysis,
          progress: Math.min(progress, 100)
        });
      }
    }, 500);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-purple-600" />
            TenderAI Pro Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI-powered analysis and automation for tender management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {aiInsights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{insight.title}</p>
                  <p className="text-2xl font-bold">{insight.value}</p>
                  <p className={`text-sm ${insight.color}`}>{insight.trend}</p>
                </div>
                <insight.icon className={`h-8 w-8 ${insight.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="document-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="document-analysis">
            <FileText className="h-4 w-4 mr-2" />
            Document AI
          </TabsTrigger>
          <TabsTrigger value="risk-assessment">
            <Shield className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="intelligence">
            <Brain className="h-4 w-4 mr-2" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Zap className="h-4 w-4 mr-2" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Document Upload & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Upload tender documents for AI analysis
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX files up to 50MB
                    </p>
                  </label>
                </div>
                
                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                    <Button onClick={handleAnalyzeDocument} size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                )}

                {activeAnalysis && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analysis Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(activeAnalysis.progress)}%
                      </span>
                    </div>
                    <Progress value={activeAnalysis.progress} />
                    
                    {activeAnalysis.status === "completed" && activeAnalysis.results && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Analysis Results:</h4>
                        <div className="space-y-1 text-sm">
                          <p>Confidence Score: {(activeAnalysis.results.confidence * 100).toFixed(1)}%</p>
                          <p>Extracted Fields: {activeAnalysis.results.extractedFields}</p>
                          <p>Issues Found: {activeAnalysis.results.issues}</p>
                        </div>
                        {activeAnalysis.results.keyInsights && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-2">Key Insights:</h5>
                            <ul className="space-y-1 text-sm">
                              {activeAnalysis.results.keyInsights.map((insight: string, index: number) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Recent AI Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          analysis.status === 'completed' ? 'bg-green-500' :
                          analysis.status === 'processing' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {analysis.type.replace('_', ' ')} Analysis
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(analysis.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                          {analysis.status}
                        </Badge>
                        {analysis.status === 'processing' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {analysis.progress}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AI-Powered Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {riskAssessments.map((risk, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{risk.category}</h3>
                        <Badge className={getRiskLevelColor(risk.level)}>
                          {risk.level}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Score</span>
                            <span>{risk.score}/100</span>
                          </div>
                          <Progress value={risk.score} />
                        </div>
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {risk.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="text-xs text-muted-foreground flex items-start">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Success Probability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">78%</div>
                    <p className="text-sm text-muted-foreground">Predicted Success Rate</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Score</span>
                      <span className="text-sm font-medium">85/100</span>
                    </div>
                    <Progress value={85} />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Commercial Score</span>
                      <span className="text-sm font-medium">92/100</span>
                    </div>
                    <Progress value={92} />
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Compliance Score</span>
                      <span className="text-sm font-medium">94/100</span>
                    </div>
                    <Progress value={94} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <p className="text-xs text-muted-foreground">Active Competitors</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹2.3Cr</div>
                      <p className="text-xs text-muted-foreground">Avg. Winning Bid</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Factors:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Strong technical capability match
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Competitive pricing strategy
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        High competition in segment
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Business Intelligence Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Tender Patterns</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Government Tenders</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} />
                    <div className="flex justify-between text-sm">
                      <span>Private Sector</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <Progress value={35} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Success Trends</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Quarter</span>
                      <span className="font-medium text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Quarter</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>YoY Growth</span>
                      <span className="font-medium text-green-600">+28%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">AI Insights</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start">
                      <Sparkles className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                      IT sector shows 23% higher success rate
                    </p>
                    <p className="flex items-start">
                      <Sparkles className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                      Q2 typically has 40% more opportunities
                    </p>
                    <p className="flex items-start">
                      <Sparkles className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                      Government tenders prefer local vendors
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                AI Workflow Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Active Automations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Document Auto-Classification</p>
                          <p className="text-xs text-muted-foreground">98% accuracy</p>
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Risk Alert System</p>
                          <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Smart Recommendations</p>
                          <p className="text-xs text-muted-foreground">ML-powered</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Processing</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Workflow Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Processing Speed</span>
                      <span className="font-medium text-green-600">+65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Rate</span>
                      <span className="font-medium">96.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Manual Tasks Reduced</span>
                      <span className="font-medium text-green-600">-78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost Savings</span>
                      <span className="font-medium text-green-600">₹12.5L/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}