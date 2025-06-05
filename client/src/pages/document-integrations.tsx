import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Zap, 
  Shield, 
  Globe, 
  Database, 
  Bell, 
  Mail, 
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  Lock,
  Smartphone,
  Webhook
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'configuring';
  icon: any;
  config: Record<string, any>;
}

export default function DocumentIntegrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configData, setConfigData] = useState<Record<string, any>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  // Mock integrations data
  const mockIntegrations: Integration[] = [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Sync documents with Google Drive for cloud storage and collaboration",
      category: "Cloud Storage",
      status: "inactive",
      icon: Cloud,
      config: {
        clientId: "",
        clientSecret: "",
        refreshToken: "",
        syncEnabled: false,
        autoUpload: true
      }
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Backup and sync documents with Dropbox Business",
      category: "Cloud Storage", 
      status: "inactive",
      icon: Database,
      config: {
        accessToken: "",
        teamId: "",
        syncEnabled: false
      }
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send document notifications and alerts to Slack channels",
      category: "Communication",
      status: "inactive",
      icon: MessageSquare,
      config: {
        webhookUrl: "",
        channel: "#documents",
        notifyOnUpload: true,
        notifyOnApproval: true,
        notifyOnExpiry: true
      }
    },
    {
      id: "email-notifications",
      name: "Email Notifications",
      description: "Automated email alerts for document events and deadlines",
      category: "Communication",
      status: "active",
      icon: Mail,
      config: {
        smtpHost: "",
        smtpPort: 587,
        username: "",
        password: "",
        fromEmail: "",
        enableSsl: true
      }
    },
    {
      id: "webhook",
      name: "Webhook Integration",
      description: "Send real-time document events to external systems",
      category: "API",
      status: "inactive",
      icon: Webhook,
      config: {
        endpointUrl: "",
        secretKey: "",
        events: ["document.created", "document.approved", "document.expired"],
        retryAttempts: 3
      }
    },
    {
      id: "ai-analysis",
      name: "AI Document Analysis",
      description: "Automated document content analysis and insights using AI",
      category: "AI & Analytics",
      status: "configuring",
      icon: Zap,
      config: {
        provider: "anthropic",
        apiKey: "",
        enableAutoClassification: true,
        enableContentExtraction: true,
        enableComplianceCheck: true
      }
    },
    {
      id: "blockchain-verification",
      name: "Blockchain Verification",
      description: "Document integrity verification using blockchain technology",
      category: "Security",
      status: "inactive", 
      icon: Shield,
      config: {
        network: "ethereum",
        contractAddress: "",
        privateKey: "",
        gasLimit: 21000
      }
    },
    {
      id: "sms-alerts",
      name: "SMS Alerts",
      description: "Critical document alerts via SMS using Twilio",
      category: "Communication",
      status: "inactive",
      icon: Smartphone,
      config: {
        accountSid: "",
        authToken: "",
        fromNumber: "",
        enableUrgentAlerts: true
      }
    }
  ];

  const data = integrations || mockIntegrations;

  // Configure integration mutation
  const configureIntegration = useMutation({
    mutationFn: async ({ integrationId, config }: { integrationId: string; config: any }) => {
      return apiRequest(`/api/integrations/${integrationId}/configure`, {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Integration Configured",
        description: "Integration settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setSelectedIntegration(null);
      setConfigData({});
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure integration",
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      return apiRequest(`/api/integrations/${integrationId}/test`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Integration is working correctly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Integration test failed",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = async (integrationId: string) => {
    await configureIntegration.mutateAsync({
      integrationId,
      config: configData[integrationId] || {}
    });
  };

  const handleTestIntegration = async (integrationId: string) => {
    await testIntegration.mutateAsync(integrationId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "configuring": return "bg-yellow-500";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "configuring": return "Configuring";
      case "inactive": return "Inactive";
      default: return "Unknown";
    }
  };

  const categories = [...new Set(data.map(integration => integration.category))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Integrations</h1>
          <p className="text-muted-foreground">
            Connect your document management system with external services and APIs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Integration Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.filter(i => i.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Configuring</CardTitle>
                <Settings className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.filter(i => i.status === 'configuring').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Setup in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Integration Categories */}
          {categories.map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {category === "Cloud Storage" && "Backup and sync documents with cloud providers"}
                  {category === "Communication" && "Automated notifications and alerts"}
                  {category === "AI & Analytics" && "Intelligent document processing and insights"}
                  {category === "Security" && "Advanced security and verification services"}
                  {category === "API" && "External system integrations and webhooks"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.filter(integration => integration.category === category).map(integration => {
                    const Icon = integration.icon;
                    return (
                      <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {Icon && <Icon className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="font-medium">{integration.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`}></div>
                                <span className="text-sm text-muted-foreground">
                                  {getStatusText(integration.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedIntegration(integration.id)}
                          >
                            Configure
                          </Button>
                          {integration.status === "active" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTestIntegration(integration.id)}
                              disabled={testIntegration.isPending}
                            >
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          {selectedIntegration ? (
            (() => {
              const integration = data.find(i => i.id === selectedIntegration);
              if (!integration) return null;
              
              const Icon = integration.icon;
              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>Configure {integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Configuration form based on integration type */}
                    {integration.id === "ai-analysis" && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription>
                          This integration requires an API key from Anthropic or OpenAI. The API key will be used to analyze document content, extract insights, and perform compliance checks.
                        </AlertDescription>
                      </Alert>
                    )}

                    {integration.id === "slack" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
                          <Input
                            id="webhookUrl"
                            placeholder="https://hooks.slack.com/services/..."
                            value={configData[integration.id]?.webhookUrl || ""}
                            onChange={(e) => setConfigData({
                              ...configData,
                              [integration.id]: {
                                ...configData[integration.id],
                                webhookUrl: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="channel">Channel</Label>
                          <Input
                            id="channel"
                            placeholder="#documents"
                            value={configData[integration.id]?.channel || ""}
                            onChange={(e) => setConfigData({
                              ...configData,
                              [integration.id]: {
                                ...configData[integration.id],
                                channel: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>Notification Types</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={configData[integration.id]?.notifyOnUpload || false}
                                onCheckedChange={(checked) => setConfigData({
                                  ...configData,
                                  [integration.id]: {
                                    ...configData[integration.id],
                                    notifyOnUpload: checked
                                  }
                                })}
                              />
                              <Label>Document uploads</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={configData[integration.id]?.notifyOnApproval || false}
                                onCheckedChange={(checked) => setConfigData({
                                  ...configData,
                                  [integration.id]: {
                                    ...configData[integration.id],
                                    notifyOnApproval: checked
                                  }
                                })}
                              />
                              <Label>Document approvals</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={configData[integration.id]?.notifyOnExpiry || false}
                                onCheckedChange={(checked) => setConfigData({
                                  ...configData,
                                  [integration.id]: {
                                    ...configData[integration.id],
                                    notifyOnExpiry: checked
                                  }
                                })}
                              />
                              <Label>Document expiry alerts</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {integration.id === "google-drive" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="clientId">Google Client ID</Label>
                          <Input
                            id="clientId"
                            placeholder="Your Google OAuth Client ID"
                            value={configData[integration.id]?.clientId || ""}
                            onChange={(e) => setConfigData({
                              ...configData,
                              [integration.id]: {
                                ...configData[integration.id],
                                clientId: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientSecret">Client Secret</Label>
                          <Input
                            id="clientSecret"
                            type="password"
                            placeholder="Your Google OAuth Client Secret"
                            value={configData[integration.id]?.clientSecret || ""}
                            onChange={(e) => setConfigData({
                              ...configData,
                              [integration.id]: {
                                ...configData[integration.id],
                                clientSecret: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={configData[integration.id]?.autoUpload || false}
                            onCheckedChange={(checked) => setConfigData({
                              ...configData,
                              [integration.id]: {
                                ...configData[integration.id],
                                autoUpload: checked
                              }
                            })}
                          />
                          <Label>Automatically upload new documents</Label>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleSaveConfig(integration.id)}
                        disabled={configureIntegration.isPending}
                      >
                        {configureIntegration.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedIntegration(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Integration</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Choose an integration from the Overview tab to configure its settings and establish connections.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>Real-time status of all active integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.filter(i => i.status === 'active').map(integration => {
                  const Icon = integration.icon;
                  return (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5" />}
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">Last check: 2 minutes ago</div>
                        </div>
                      </div>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest integration events and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Document synced to Google Drive</div>
                      <div className="text-sm text-muted-foreground">Company Registration.pdf - 5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Slack notification sent</div>
                      <div className="text-sm text-muted-foreground">Document approval alert - 12 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">AI analysis completed</div>
                      <div className="text-sm text-muted-foreground">ISO Certificate processed - 18 minutes ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security policies for integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Require API key rotation</div>
                    <div className="text-sm text-muted-foreground">Automatically rotate API keys every 90 days</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable webhook signature verification</div>
                    <div className="text-sm text-muted-foreground">Verify incoming webhook signatures</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Log all integration activities</div>
                    <div className="text-sm text-muted-foreground">Maintain detailed audit logs</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Permissions</CardTitle>
                <CardDescription>Manage integration access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Document Read Access</div>
                        <div className="text-sm text-muted-foreground">All active integrations</div>
                      </div>
                    </div>
                    <Badge variant="default">Granted</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Document Write Access</div>
                        <div className="text-sm text-muted-foreground">Cloud storage only</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Limited</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Analytics Data Access</div>
                        <div className="text-sm text-muted-foreground">AI and reporting services</div>
                      </div>
                    </div>
                    <Badge variant="default">Granted</Badge>
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