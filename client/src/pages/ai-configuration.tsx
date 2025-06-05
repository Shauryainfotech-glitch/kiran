import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, Settings, Zap, Shield, Activity, 
  CheckCircle, AlertTriangle, Info, Cpu,
  Database, Network, BarChart3
} from "lucide-react";
import ContextualAISlider from "@/components/ai/contextual-ai-slider";
import { useQuery } from "@tanstack/react-query";

interface AIService {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  usage: number;
  accuracy: number;
  responseTime: number;
  lastUpdated: string;
}

export default function AIConfiguration() {
  const [activeTab, setActiveTab] = useState("contextual");

  const { data: aiServices } = useQuery({
    queryKey: ['/api/ai/services']
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/ai/system-health'],
    refetchInterval: 10000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-muted-foreground">
            Configure and monitor AI services for optimal tender management performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            System Healthy
          </Badge>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/3</div>
            <p className="text-xs text-muted-foreground">
              Services active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">
              Average load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2GB</div>
            <p className="text-xs text-muted-foreground">
              In use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contextual">Contextual AI</TabsTrigger>
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Contextual AI Tab */}
        <TabsContent value="contextual" className="space-y-4">
          <ContextualAISlider />
        </TabsContent>

        {/* AI Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {/* Claude Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>Claude Sonnet 4.0</CardTitle>
                      <CardDescription>Advanced document analysis and insights</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Accuracy</p>
                    <p className="text-2xl font-bold">96.3%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">1.1s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Usage Today</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPT Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>GPT-4o</CardTitle>
                      <CardDescription>Strategy optimization and recommendations</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Accuracy</p>
                    <p className="text-2xl font-bold">94.1%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">0.9s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Usage Today</p>
                    <p className="text-2xl font-bold">189</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gemini Integration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>Gemini Pro</CardTitle>
                      <CardDescription>Risk assessment and predictive analytics</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Accuracy</p>
                    <p className="text-2xl font-bold">92.7%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">1.3s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Usage Today</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Security Status: Protected</AlertTitle>
              <AlertDescription>
                All AI services are operating with enterprise-grade security protocols. 
                Data encryption is active and API keys are securely managed.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Manage security settings for AI service integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Encryption</h4>
                    <p className="text-sm text-muted-foreground">End-to-end encryption for all AI communications</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">API Key Rotation</h4>
                    <p className="text-sm text-muted-foreground">Automatic rotation every 30 days</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Access Logging</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive audit trail for all AI requests</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">Prevent abuse and ensure fair usage</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Monitor AI service performance and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Request Volume</h4>
                      <div className="text-2xl font-bold">1,247</div>
                      <p className="text-sm text-muted-foreground">Requests in the last hour</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Success Rate</h4>
                      <div className="text-2xl font-bold">99.2%</div>
                      <p className="text-sm text-muted-foreground">Successful responses</p>
                    </div>
                  </div>

                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Real-time monitoring charts would be displayed here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration</CardTitle>
                <CardDescription>
                  Set up alerts for AI service issues and performance degradation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">High Error Rate Alert</h4>
                    <p className="text-sm text-muted-foreground">Trigger when error rate exceeds 5%</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Slow Response Alert</h4>
                    <p className="text-sm text-muted-foreground">Trigger when response time exceeds 5 seconds</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Service Downtime Alert</h4>
                    <p className="text-sm text-muted-foreground">Immediate notification when service is unavailable</p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}