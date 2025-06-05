import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Brain, 
  BookOpen, 
  Settings, 
  Upload, 
  Download,
  FileText,
  Zap,
  Shield,
  Clock,
  Database,
  Cpu,
  Activity,
  Target,
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Plus
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AIAssistantConfig {
  documentAnalysis: {
    enabled: boolean;
    autoExtractData: boolean;
    riskAssessment: boolean;
    complianceCheck: boolean;
    successProbability: boolean;
    competitorAnalysis: boolean;
    smartTaskAssignment: boolean;
    deadlinePredictions: boolean;
    automationLevel: string;
    threshold: number;
    optimizationModel: string;
    hybrid: boolean;
  };
  performance: {
    responseCacheTTL: number;
    concurrentRequestsLimit: number;
    requestTimeout: number;
  };
  privacy: {
    dataAnonymization: boolean;
    localProcessingMode: boolean;
    auditAllInteractions: boolean;
    dataRetentionDays: number;
  };
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  category: string;
  documents: number;
  lastUpdated: string;
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
}

interface WorkflowAutomation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'error';
  executionCount: number;
  lastRun: string;
  successRate: number;
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("configuration");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [config, setConfig] = useState<AIAssistantConfig>({
    documentAnalysis: {
      enabled: true,
      autoExtractData: true,
      riskAssessment: true,
      complianceCheck: true,
      successProbability: true,
      competitorAnalysis: true,
      smartTaskAssignment: true,
      deadlinePredictions: true,
      automationLevel: "medium-semi-auto",
      threshold: 0.6,
      optimizationModel: "hybrid",
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
  });

  // Knowledge bases data
  const knowledgeBases: KnowledgeBase[] = [
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

  // Workflow automations
  const workflows: WorkflowAutomation[] = [
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

  const handleConfigChange = (section: keyof AIAssistantConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveConfig = async () => {
    try {
      // Save AI assistant configuration
      console.log('Saving AI Assistant configuration:', config);
      alert('AI Assistant configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Activity className="h-4 w-4" />;
      case 'paused': return <PauseCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="h-8 w-8 mr-3 text-blue-600" />
            AI Assistant Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure advanced AI settings, knowledge base, and workflow automation
          </p>
        </div>
        <Button onClick={handleSaveConfig}>
          <Settings className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="knowledge-base">
            <BookOpen className="h-4 w-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Zap className="h-4 w-4 mr-2" />
            Workflow Automation
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Analysis Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Document Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.autoExtractData}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'autoExtractData', checked)}
                    />
                    <Label className="text-sm">Auto-extract Data</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.riskAssessment}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'riskAssessment', checked)}
                    />
                    <Label className="text-sm">Risk Assessment</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.complianceCheck}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'complianceCheck', checked)}
                    />
                    <Label className="text-sm">Compliance Check</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.successProbability}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'successProbability', checked)}
                    />
                    <Label className="text-sm">Success Probability</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.competitorAnalysis}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'competitorAnalysis', checked)}
                    />
                    <Label className="text-sm">Competitor Analysis</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.documentAnalysis.smartTaskAssignment}
                      onCheckedChange={(checked) => handleConfigChange('documentAnalysis', 'smartTaskAssignment', checked)}
                    />
                    <Label className="text-sm">Smart Task Assignment</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Confidence Threshold</Label>
                  <div className="px-3">
                    <Slider
                      value={[config.documentAnalysis.threshold]}
                      onValueChange={([value]) => handleConfigChange('documentAnalysis', 'threshold', value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0.0</span>
                      <span>{config.documentAnalysis.threshold.toFixed(1)}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Automation Level</Label>
                  <Select 
                    value={config.documentAnalysis.automationLevel || "medium-semi-auto"} 
                    onValueChange={(value) => handleConfigChange('documentAnalysis', 'automationLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select automation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-manual">Low (Manual)</SelectItem>
                      <SelectItem value="medium-semi-auto">Medium (Semi-auto)</SelectItem>
                      <SelectItem value="high-auto">High (Auto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Optimization Model</Label>
                  <Select 
                    value={config.documentAnalysis.optimizationModel || "hybrid"} 
                    onValueChange={(value) => handleConfigChange('documentAnalysis', 'optimizationModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select optimization model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speed">Speed</SelectItem>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Advanced AI Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Advanced AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Performance Tuning</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Response Cache TTL:</span>
                        <span>{config.performance.responseCacheTTL} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Concurrent Requests:</span>
                        <span>{config.performance.concurrentRequestsLimit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Response Cache TTL (minutes)</Label>
                    <Input
                      type="number"
                      value={config.performance.responseCacheTTL}
                      onChange={(e) => handleConfigChange('performance', 'responseCacheTTL', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Concurrent Requests Limit</Label>
                    <Input
                      type="number"
                      value={config.performance.concurrentRequestsLimit}
                      onChange={(e) => handleConfigChange('performance', 'concurrentRequestsLimit', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Request Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={config.performance.requestTimeout}
                      onChange={(e) => handleConfigChange('performance', 'requestTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.privacy.dataAnonymization}
                      onCheckedChange={(checked) => handleConfigChange('privacy', 'dataAnonymization', checked)}
                    />
                    <Label>Data Anonymization</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.privacy.localProcessingMode}
                      onCheckedChange={(checked) => handleConfigChange('privacy', 'localProcessingMode', checked)}
                    />
                    <Label>Local Processing Mode</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.privacy.auditAllInteractions}
                      onCheckedChange={(checked) => handleConfigChange('privacy', 'auditAllInteractions', checked)}
                    />
                    <Label>Audit All Interactions</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention (days)</Label>
                    <Input
                      type="number"
                      value={config.privacy.dataRetentionDays}
                      onChange={(e) => handleConfigChange('privacy', 'dataRetentionDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge-base" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Knowledge Base Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Knowledge Base
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {knowledgeBases.map((kb) => (
              <Card key={kb.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{kb.name}</CardTitle>
                    <Badge className={getStatusColor(kb.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(kb.status)}
                        <span className="capitalize">{kb.status}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{kb.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <p className="font-medium">{kb.documents.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p className="font-medium">{kb.accuracy}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>{kb.accuracy}%</span>
                    </div>
                    <Progress value={kb.accuracy} className="h-2" />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(kb.lastUpdated)}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Search className="h-3 w-3 mr-1" />
                      Query
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Automation</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <Badge className={getStatusColor(workflow.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(workflow.status)}
                            <span className="capitalize">{workflow.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Trigger: </span>
                          <span className="font-medium">{workflow.trigger}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Action: </span>
                          <span className="font-medium">{workflow.action}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Executions: </span>
                          <span className="font-medium">{workflow.executionCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Success Rate: </span>
                          <span className="font-medium">{workflow.successRate}%</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        Last run: {formatDate(workflow.lastRun)}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        {workflow.status === 'active' ? (
                          <>
                            <PauseCircle className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Processing</p>
                    <p className="text-2xl font-bold">94.2%</p>
                    <p className="text-sm text-green-600">+2.1% from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    <p className="text-2xl font-bold">97.8%</p>
                    <p className="text-sm text-green-600">+0.5% improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">1.4s</p>
                    <p className="text-sm text-green-600">-0.2s faster</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Knowledge Base Load</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Workflows</span>
                      <span className="text-sm font-medium">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
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