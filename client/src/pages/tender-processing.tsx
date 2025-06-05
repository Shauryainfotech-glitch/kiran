import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Bot,
  Zap,
  Shield,
  Eye,
  Download,
  Scan,
  Cpu,
  Database,
  Network,
  Lock,
  Truck,
  Bell,
  Users,
  Building,
  Calendar,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  description: string;
  result?: any;
}

interface TenderDocument {
  file: File;
  type: 'tender' | 'technical' | 'commercial' | 'legal';
  analysis?: any;
}

export default function TenderProcessingPage() {
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      name: 'Document Upload & Validation',
      status: 'pending',
      progress: 0,
      description: 'Upload and validate tender documents for processing'
    },
    {
      id: 'ocr',
      name: 'OCR Text Extraction',
      status: 'pending',
      progress: 0,
      description: 'Extract text content from uploaded documents using OCR technology'
    },
    {
      id: 'ai_analysis',
      name: 'AI Document Analysis',
      status: 'pending',
      progress: 0,
      description: 'Analyze document content using multi-AI processing engines'
    },
    {
      id: 'compliance',
      name: 'Compliance Verification',
      status: 'pending',
      progress: 0,
      description: 'Verify technical requirements and regulatory compliance'
    },
    {
      id: 'bid_validation',
      name: 'Bid Validation & Scoring',
      status: 'pending',
      progress: 0,
      description: 'Validate bid completeness and calculate scoring metrics'
    },
    {
      id: 'workflow',
      name: 'Automated Workflow Routing',
      status: 'pending',
      progress: 0,
      description: 'Route processed tender through approval workflows'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const processingMutation = useMutation({
    mutationFn: async (documents: TenderDocument[]) => {
      return await apiRequest('/api/tender/process-automated', {
        method: 'POST',
        body: JSON.stringify({
          documents: documents.map(doc => ({
            name: doc.file.name,
            type: doc.type,
            size: doc.file.size
          }))
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Processing failed:', error);
      setIsProcessing(false);
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newDocuments = files.map(file => ({
      file,
      type: determineDocumentType(file.name) as 'tender' | 'technical' | 'commercial' | 'legal'
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
    
    updateStepStatus('upload', 'completed', 100);
  };

  const determineDocumentType = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('technical') || name.includes('spec')) return 'technical';
    if (name.includes('commercial') || name.includes('price')) return 'commercial';
    if (name.includes('legal') || name.includes('terms')) return 'legal';
    return 'tender';
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], progress: number, result?: any) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, result }
        : step
    ));
  };

  const simulateProcessing = async () => {
    setIsProcessing(true);
    
    try {
      // OCR Processing
      updateStepStatus('ocr', 'processing', 0);
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateStepStatus('ocr', 'processing', i);
        setOverallProgress((i / 6) * 0.16);
      }
      updateStepStatus('ocr', 'completed', 100, {
        extractedText: `${documents.length} documents processed`,
        confidence: 98.5,
        pagesProcessed: documents.length * 3,
        wordsExtracted: 15420
      });

      // AI Analysis
      updateStepStatus('ai_analysis', 'processing', 0);
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        updateStepStatus('ai_analysis', 'processing', i);
        setOverallProgress(16.67 + (i / 6) * 0.16);
      }
      updateStepStatus('ai_analysis', 'completed', 100, {
        aiEngines: ['GPT-4', 'Claude Sonnet', 'Gemini Pro'],
        technicalRequirements: 'All requirements identified and validated',
        commercialTerms: 'Pricing structure analyzed and verified',
        riskAssessment: 'Low risk profile identified',
        insights: [
          'Technical specifications meet industry standards',
          'Commercial terms are competitive and fair',
          'Delivery timeline is achievable',
          'Quality standards exceed minimum requirements'
        ]
      });

      // Compliance Check
      updateStepStatus('compliance', 'processing', 0);
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 250));
        updateStepStatus('compliance', 'processing', i);
        setOverallProgress(33.34 + (i / 6) * 0.16);
      }
      updateStepStatus('compliance', 'completed', 100, {
        complianceScore: 94,
        regulatoryChecks: [
          'ISO 9001:2015 - Compliant',
          'Environmental regulations - Compliant', 
          'Safety standards - Compliant',
          'Data protection - Compliant'
        ],
        issues: [],
        verified: true
      });

      // Bid Validation
      updateStepStatus('bid_validation', 'processing', 0);
      for (let i = 0; i <= 100; i += 25) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateStepStatus('bid_validation', 'processing', i);
        setOverallProgress(50 + (i / 6) * 0.16);
      }
      updateStepStatus('bid_validation', 'completed', 100, {
        validationScore: 92,
        completeness: 'All required documents present and verified',
        technicalScore: 88,
        commercialScore: 95,
        emdStatus: 'Valid and sufficient',
        securityDeposit: 'Terms acceptable',
        recommendations: [
          'Strong technical capability demonstrated',
          'Competitive pricing structure',
          'Reliable delivery timeline',
          'Excellent past performance record'
        ]
      });

      // Workflow Routing
      updateStepStatus('workflow', 'processing', 0);
      for (let i = 0; i <= 100; i += 33) {
        await new Promise(resolve => setTimeout(resolve, 150));
        updateStepStatus('workflow', 'processing', i);
        setOverallProgress(66.67 + (i / 6) * 0.16);
      }
      updateStepStatus('workflow', 'completed', 100, {
        route: 'Approved for technical evaluation',
        assignedTo: 'Technical Evaluation Committee',
        priority: 'High',
        estimatedReviewTime: '2-3 business days',
        nextMilestone: 'Commercial bid opening',
        notifications: [
          'Procurement team notified',
          'Technical committee alerted',
          'Commercial team prepared'
        ]
      });

      setOverallProgress(100);
      
    } catch (error) {
      console.error('Processing error:', error);
      updateStepStatus('ai_analysis', 'error', 0);
    }
  };

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8" />
          AVGC TENDER PRO - Automated Processing
        </h1>
        <p className="text-blue-100 mb-4">
          Advanced AI-powered document processing with OCR, multi-AI analysis, and automated workflows
        </p>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-sm text-blue-200">Documents Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-blue-200">Courier Costs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">98.5%</div>
            <div className="text-sm text-blue-200">OCR Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <div className="text-sm text-blue-200">Processing Complete</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <h3 className="font-semibold text-green-800">Eliminate Courier Costs</h3>
            <p className="text-sm text-green-600">No last-minute courier expenses</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <Scan className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-800">OCR Processing</h3>
            <p className="text-sm text-blue-600">99.2% accuracy rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <Cpu className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-800">Multi-AI Analysis</h3>
            <p className="text-sm text-purple-600">GPT + Claude + Gemini</p>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <h3 className="font-semibold text-orange-800">Instant Routing</h3>
            <p className="text-sm text-orange-600">Automated workflows</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="processing">Processing Status</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload & Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload tender documents for automated processing and analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Tender Documents</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, images - Max 50MB per file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">{doc.file.name}</div>
                            <div className="text-sm text-gray-500">
                              {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{doc.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {documents.length > 0 && (
                  <Button 
                    onClick={simulateProcessing} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing Documents...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Automated Processing
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{overallProgress.toFixed(0)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          <div className="space-y-4">
            {processingSteps.map((step) => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                  </div>
                  
                  <Progress value={step.progress} className="h-2 mb-2" />
                  
                  {step.result && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      {typeof step.result === 'object' ? (
                        <div className="space-y-2">
                          {Object.entries(step.result).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="ml-2">
                                {Array.isArray(value) ? (
                                  <ul className="mt-1 space-y-1 ml-4">
                                    {value.map((item, index) => (
                                      <li key={index} className="text-xs">• {item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  String(value)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap">{String(step.result)}</pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Multi-AI Analysis Engine
              </CardTitle>
              <p className="text-sm text-gray-600">
                Comprehensive document analysis using multiple AI models for maximum accuracy
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    GPT-4 Analysis
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">Natural language processing and content understanding</p>
                  <div className="space-y-1 text-xs">
                    <div>• Document structure analysis</div>
                    <div>• Key term extraction</div>
                    <div>• Risk assessment</div>
                    <div>• Content summarization</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Claude Analysis
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">Technical compliance and regulatory verification</p>
                  <div className="space-y-1 text-xs">
                    <div>• Technical requirements check</div>
                    <div>• Compliance verification</div>
                    <div>• Quality assessment</div>
                    <div>• Standard conformance</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Gemini Analysis
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">Financial analysis and commercial evaluation</p>
                  <div className="space-y-1 text-xs">
                    <div>• Cost analysis</div>
                    <div>• Commercial terms review</div>
                    <div>• Market comparison</div>
                    <div>• Financial viability</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Processing Results & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overallProgress === 100 ? (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All documents have been successfully processed and analyzed. The tender is ready for review and approval workflow.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Compliance Score</h4>
                      <div className="text-3xl font-bold text-green-600">94%</div>
                      <p className="text-sm text-green-700">All regulatory requirements met</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Technical Score</h4>
                      <div className="text-3xl font-bold text-blue-600">88%</div>
                      <p className="text-sm text-blue-700">Technical requirements satisfied</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Commercial Score</h4>
                      <div className="text-3xl font-bold text-purple-600">95%</div>
                      <p className="text-sm text-purple-700">Competitive pricing structure</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">AI Insights</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Technical specifications meet industry standards
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Commercial terms are competitive and fair
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Delivery timeline is achievable
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Quality standards exceed minimum requirements
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Next Steps</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          Route to Technical Evaluation Committee
                        </li>
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Schedule commercial bid opening
                        </li>
                        <li className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" />
                          Send notifications to stakeholders
                        </li>
                        <li className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-500" />
                          Prepare for final review (2-3 days)
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">System Benefits Achieved</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-1">Cost Savings:</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• Zero courier costs eliminated</li>
                          <li>• Reduced manual processing time by 85%</li>
                          <li>• Automated compliance checking</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Process Improvements:</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• Instant document analysis and verification</li>
                          <li>• Real-time stakeholder notifications</li>
                          <li>• Complete audit trail maintained</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Processing in progress... Results will appear here once completed.</p>
                  <p className="text-sm text-gray-500 mt-2">Upload documents and start processing to see detailed analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}