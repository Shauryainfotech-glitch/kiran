import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Settings,
  Bot,
  Workflow,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  description: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  trigger: string;
  steps: WorkflowStep[];
  successRate: number;
  totalRuns: number;
  avgExecutionTime: number;
}

export default function WorkflowAutomation() {
  const [workflows] = useState<AutomationWorkflow[]>([
    {
      id: "1",
      name: "Smart Tender Processing",
      description: "Automated tender analysis with AI document processing and risk assessment",
      status: "active",
      trigger: "Document Upload",
      successRate: 94.2,
      totalRuns: 247,
      avgExecutionTime: 145,
      steps: [
        { id: "1", name: "Document OCR", status: "completed", duration: 15, description: "Extract text from uploaded documents" },
        { id: "2", name: "AI Analysis", status: "completed", duration: 45, description: "Analyze compliance and technical requirements" },
        { id: "3", name: "Risk Assessment", status: "completed", duration: 30, description: "Calculate risk score using ML algorithms" },
        { id: "4", name: "Blockchain Verification", status: "running", description: "Create immutable record on blockchain" },
        { id: "5", name: "Notification Dispatch", status: "pending", description: "Send alerts to stakeholders" }
      ]
    },
    {
      id: "2", 
      name: "Vendor Qualification Pipeline",
      description: "Automated vendor verification and scoring system",
      status: "active",
      trigger: "Vendor Registration",
      successRate: 98.7,
      totalRuns: 156,
      avgExecutionTime: 89,
      steps: [
        { id: "1", name: "Document Verification", status: "completed", duration: 20, description: "Verify vendor documents and certificates" },
        { id: "2", name: "Financial Analysis", status: "completed", duration: 35, description: "Analyze financial stability and history" },
        { id: "3", name: "Background Check", status: "completed", duration: 25, description: "Verify registration and compliance status" },
        { id: "4", name: "Score Calculation", status: "completed", duration: 9, description: "Calculate overall vendor score" }
      ]
    },
    {
      id: "3",
      name: "Predictive Bid Analysis", 
      description: "AI-powered prediction of bid success probability",
      status: "active",
      trigger: "Bid Submission",
      successRate: 87.3,
      totalRuns: 89,
      avgExecutionTime: 234,
      steps: [
        { id: "1", name: "Market Research", status: "completed", duration: 60, description: "Analyze market trends and competitor data" },
        { id: "2", name: "Technical Evaluation", status: "completed", duration: 45, description: "Assess technical proposal quality" },
        { id: "3", name: "Price Analysis", status: "completed", duration: 30, description: "Compare pricing with market standards" },
        { id: "4", name: "Success Prediction", status: "completed", duration: 25, description: "Generate probability score using ML" },
        { id: "5", name: "Recommendation Engine", status: "completed", duration: 15, description: "Provide improvement suggestions" }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const overallStats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    avgSuccessRate: workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length,
    totalProcessed: workflows.reduce((acc, w) => acc + w.totalRuns, 0),
    timeSaved: "347 hours",
    costReduction: "₹12.4L"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Workflow className="h-8 w-8 mr-3 text-purple-600" />
            Workflow Automation
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered automation for streamlined tender management processes
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">Total Workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{overallStats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{overallStats.totalProcessed}</div>
            <p className="text-xs text-muted-foreground">Processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.timeSaved}</div>
            <p className="text-xs text-muted-foreground">Time Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.costReduction}</div>
            <p className="text-xs text-muted-foreground">Cost Reduction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">
            <Zap className="h-4 w-4 mr-2" />
            Active Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="builder">
            <Bot className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="space-y-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Bot className="h-5 w-5 mr-2" />
                        {workflow.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {workflow.status === 'active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <h4 className="font-medium mb-3">Workflow Steps</h4>
                      <div className="space-y-3">
                        {workflow.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            {getStepStatusIcon(step.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{step.name}</span>
                                {step.duration && (
                                  <span className="text-xs text-muted-foreground">{step.duration}s</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Success Rate</span>
                            <span className="font-medium">{workflow.successRate}%</span>
                          </div>
                          <Progress value={workflow.successRate} />
                          
                          <div className="flex justify-between text-sm">
                            <span>Total Runs</span>
                            <span className="font-medium">{workflow.totalRuns}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Avg Execution</span>
                            <span className="font-medium">{workflow.avgExecutionTime}s</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Trigger</h4>
                        <Badge variant="outline">{workflow.trigger}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Workflow Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+23%</div>
                      <p className="text-xs text-muted-foreground">Efficiency Gain</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">-45%</div>
                      <p className="text-xs text-muted-foreground">Processing Time</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Improvements</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Document Processing</span>
                        <span className="text-green-600">+18% faster</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Assessment</span>
                        <span className="text-green-600">+12% accuracy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vendor Verification</span>
                        <span className="text-green-600">+8% efficiency</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  AI Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">GPT-4 Analysis</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">OCR Processing</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">ML Predictions</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Blockchain Verification</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Workflow Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Visual Workflow Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Drag-and-drop interface for creating custom automation workflows
                </p>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Create New Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}