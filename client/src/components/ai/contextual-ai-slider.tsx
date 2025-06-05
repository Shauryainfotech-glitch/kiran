import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Brain, Zap, Target, TrendingUp, AlertTriangle, 
  CheckCircle, Settings, RefreshCw, Lightbulb,
  BarChart3, PieChart, LineChart, Activity
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  priority: number;
  actionable: boolean;
  category: string;
}

interface AIConfiguration {
  analysisDepth: number;
  riskTolerance: number;
  innovationLevel: number;
  automationLevel: number;
  responseTime: number;
  contextAwareness: boolean;
  predictiveAnalysis: boolean;
  realTimeUpdates: boolean;
  multiModelFusion: boolean;
}

export default function ContextualAISlider() {
  const [aiConfig, setAiConfig] = useState<AIConfiguration>({
    analysisDepth: 70,
    riskTolerance: 50,
    innovationLevel: 60,
    automationLevel: 40,
    responseTime: 80,
    contextAwareness: true,
    predictiveAnalysis: true,
    realTimeUpdates: false,
    multiModelFusion: true
  });

  const [activeTab, setActiveTab] = useState("insights");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/ai/contextual-insights'],
    refetchInterval: aiConfig.realTimeUpdates ? 5000 : false
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/performance-metrics']
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: AIConfiguration) => {
      return apiRequest('/api/ai/configuration', {
        method: 'POST',
        body: config
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/contextual-insights'] });
    }
  });

  const triggerAnalysisMutation = useMutation({
    mutationFn: async (analysisType: string) => {
      return apiRequest('/api/ai/trigger-analysis', {
        method: 'POST',
        body: { type: analysisType, config: aiConfig }
      });
    },
    onMutate: () => setIsProcessing(true),
    onSettled: () => setIsProcessing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/contextual-insights'] });
    }
  });

  const handleConfigChange = (key: keyof AIConfiguration, value: number | boolean) => {
    const newConfig = { ...aiConfig, [key]: value };
    setAiConfig(newConfig);
    updateConfigMutation.mutate(newConfig);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity': return <Target className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle>Contextual AI Engine</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerAnalysisMutation.mutate('comprehensive')}
                disabled={isProcessing}
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isProcessing ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Badge variant={aiConfig.contextAwareness ? "default" : "secondary"}>
                {aiConfig.contextAwareness ? 'Active' : 'Passive'}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Configure AI behavior and view real-time insights for optimal tender management
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading AI insights...</span>
              </div>
            ) : (
              (insights as AIInsight[] || []).map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-sm">{insight.title}</CardTitle>
                        <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {insight.confidence}% confidence
                        </span>
                        {insight.actionable && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      <Progress value={insight.confidence} className="w-20 h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Parameters</CardTitle>
                <CardDescription>
                  Configure how deeply the AI analyzes your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Analysis Depth</Label>
                    <span className="text-sm text-muted-foreground">{aiConfig.analysisDepth}%</span>
                  </div>
                  <Slider
                    value={[aiConfig.analysisDepth]}
                    onValueChange={([value]) => handleConfigChange('analysisDepth', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Risk Tolerance</Label>
                    <span className="text-sm text-muted-foreground">{aiConfig.riskTolerance}%</span>
                  </div>
                  <Slider
                    value={[aiConfig.riskTolerance]}
                    onValueChange={([value]) => handleConfigChange('riskTolerance', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Innovation Level</Label>
                    <span className="text-sm text-muted-foreground">{aiConfig.innovationLevel}%</span>
                  </div>
                  <Slider
                    value={[aiConfig.innovationLevel]}
                    onValueChange={([value]) => handleConfigChange('innovationLevel', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Configuration</CardTitle>
                <CardDescription>
                  Control AI system behavior and response patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Automation Level</Label>
                    <span className="text-sm text-muted-foreground">{aiConfig.automationLevel}%</span>
                  </div>
                  <Slider
                    value={[aiConfig.automationLevel]}
                    onValueChange={([value]) => handleConfigChange('automationLevel', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Response Time Priority</Label>
                    <span className="text-sm text-muted-foreground">{aiConfig.responseTime}%</span>
                  </div>
                  <Slider
                    value={[aiConfig.responseTime]}
                    onValueChange={([value]) => handleConfigChange('responseTime', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="context-awareness">Context Awareness</Label>
                  <Switch
                    id="context-awareness"
                    checked={aiConfig.contextAwareness}
                    onCheckedChange={(checked) => handleConfigChange('contextAwareness', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="predictive-analysis">Predictive Analysis</Label>
                  <Switch
                    id="predictive-analysis"
                    checked={aiConfig.predictiveAnalysis}
                    onCheckedChange={(checked) => handleConfigChange('predictiveAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time-updates">Real-time Updates</Label>
                  <Switch
                    id="real-time-updates"
                    checked={aiConfig.realTimeUpdates}
                    onCheckedChange={(checked) => handleConfigChange('realTimeUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="multi-model-fusion">Multi-Model Fusion</Label>
                  <Switch
                    id="multi-model-fusion"
                    checked={aiConfig.multiModelFusion}
                    onCheckedChange={(checked) => handleConfigChange('multiModelFusion', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Confidence</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-xs text-muted-foreground">
                  High confidence predictions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>
                  Monitor AI system health and resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Load</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span>91%</span>
                  </div>
                  <Progress value={91} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Individual AI model performance statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Claude Sonnet 4.0</h4>
                      <p className="text-sm text-muted-foreground">Document Analysis</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">96.3%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">GPT-4o</h4>
                      <p className="text-sm text-muted-foreground">Strategy Optimization</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">94.1%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Gemini Pro</h4>
                      <p className="text-sm text-muted-foreground">Risk Assessment</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">92.7%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}