import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, CheckCircle, Clock, Play, Pause, Settings, Plus, Eye, GitBranch, Users, Bell, Zap, Archive, RefreshCw, Filter, Search, Calendar, BarChart3, FileText, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional(),
  trigger: z.string().min(1, "Trigger type is required"),
  conditions: z.string().optional(),
  actions: z.string().min(1, "At least one action is required"),
  approvers: z.string().optional(),
  isActive: z.boolean().default(true),
  priority: z.string().default("medium"),
  category: z.string().min(1, "Category is required"),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

export default function DocumentWorkflows() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      trigger: "",
      conditions: "",
      actions: "",
      approvers: "",
      isActive: true,
      priority: "medium",
      category: "",
    },
  });

  // Mock data for workflows - in production, this would come from the API
  const workflowsData = [
    {
      id: "wf-001",
      name: "Contract Review Process",
      description: "Automated contract review and approval workflow",
      status: "active",
      trigger: "document_upload",
      category: "legal",
      priority: "high",
      completionRate: 85,
      avgProcessingTime: "2.5 days",
      totalExecutions: 156,
      activeInstances: 8,
      lastRun: "2025-06-05T08:30:00Z",
      createdBy: "Legal Team",
      steps: [
        { id: 1, name: "Document Upload", status: "completed", assignee: "System" },
        { id: 2, name: "Legal Review", status: "in_progress", assignee: "John Doe" },
        { id: 3, name: "Manager Approval", status: "pending", assignee: "Jane Smith" },
        { id: 4, name: "Final Archive", status: "pending", assignee: "System" }
      ]
    },
    {
      id: "wf-002",
      name: "Invoice Processing",
      description: "Automated invoice validation and approval",
      status: "active",
      trigger: "document_type_invoice",
      category: "finance",
      priority: "medium",
      completionRate: 92,
      avgProcessingTime: "1.2 days",
      totalExecutions: 234,
      activeInstances: 12,
      lastRun: "2025-06-05T09:15:00Z",
      createdBy: "Finance Team",
      steps: [
        { id: 1, name: "Invoice Validation", status: "completed", assignee: "AI System" },
        { id: 2, name: "Budget Check", status: "completed", assignee: "System" },
        { id: 3, name: "Approval", status: "in_progress", assignee: "CFO" },
        { id: 4, name: "Payment Processing", status: "pending", assignee: "Accounts" }
      ]
    },
    {
      id: "wf-003",
      name: "Compliance Audit",
      description: "Quarterly compliance document audit workflow",
      status: "paused",
      trigger: "scheduled",
      category: "compliance",
      priority: "high",
      completionRate: 78,
      avgProcessingTime: "5.0 days",
      totalExecutions: 45,
      activeInstances: 0,
      lastRun: "2025-06-01T00:00:00Z",
      createdBy: "Compliance Team",
      steps: [
        { id: 1, name: "Document Collection", status: "pending", assignee: "System" },
        { id: 2, name: "Audit Review", status: "pending", assignee: "Auditor" },
        { id: 3, name: "Report Generation", status: "pending", assignee: "System" },
        { id: 4, name: "Management Review", status: "pending", assignee: "Management" }
      ]
    }
  ];

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["/api/workflows"],
    queryFn: () => Promise.resolve(workflowsData),
  });

  const { data: workflowInstances = [] } = useQuery({
    queryKey: ["/api/workflow-instances"],
    queryFn: () => Promise.resolve([
      { id: "inst-001", workflowId: "wf-001", documentId: "doc-123", status: "in_progress", progress: 60, startedAt: "2025-06-05T08:00:00Z" },
      { id: "inst-002", workflowId: "wf-002", documentId: "doc-124", status: "completed", progress: 100, startedAt: "2025-06-05T07:30:00Z" },
      { id: "inst-003", workflowId: "wf-001", documentId: "doc-125", status: "blocked", progress: 40, startedAt: "2025-06-04T14:20:00Z" },
    ]),
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: WorkflowFormData) => {
      return await apiRequest("/api/workflows", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "pause" | "resume" }) => {
      return await apiRequest(`/api/workflows/${id}/${action}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Success",
        description: "Workflow status updated successfully",
      });
    },
  });

  const onSubmit = (data: WorkflowFormData) => {
    createWorkflowMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "blocked": return "bg-red-500";
      case "in_progress": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Workflows</h1>
          <p className="text-muted-foreground">
            Automate document processing with intelligent workflows and approval chains
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Design an automated workflow for document processing and approvals
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter workflow name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="compliance">Compliance</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the workflow purpose and process" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trigger"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select trigger" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="document_upload">Document Upload</SelectItem>
                              <SelectItem value="document_type">Document Type</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="api_call">API Call</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="actions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actions</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Define workflow actions (e.g., review, approve, notify)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="approvers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approvers</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter approver IDs or roles" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable this workflow to start processing documents
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createWorkflowMutation.isPending}>
                      {createWorkflowMutation.isPending ? "Creating..." : "Create Workflow"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="instances">Active Instances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workflows.filter(w => w.status === 'active').length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Instances</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workflows.reduce((sum, w) => sum + w.activeInstances, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(workflows.reduce((sum, w) => sum + w.completionRate, 0) / workflows.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all workflows
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.2 days</div>
                <p className="text-xs text-muted-foreground">
                  Across all workflows
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest workflow executions and completions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflowInstances.slice(0, 5).map(instance => (
                  <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(instance.status)}`}></div>
                      <div>
                        <div className="font-medium">Document {instance.documentId}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflows.find(w => w.id === instance.workflowId)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Progress value={instance.progress} className="w-20 h-2" />
                      <div className="text-xs text-muted-foreground mt-1">{instance.progress}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
                <CardDescription>Execution metrics and success rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflows.slice(0, 3).map(workflow => (
                  <div key={workflow.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{workflow.name}</div>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Completion Rate</span>
                      <span>{workflow.completionRate}%</span>
                    </div>
                    <Progress value={workflow.completionRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map(workflow => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`}></div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(workflow.priority)}>
                        {workflow.priority}
                      </Badge>
                      <Badge variant="outline">{workflow.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Executions</div>
                      <div className="font-medium">{workflow.totalExecutions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active</div>
                      <div className="font-medium">{workflow.activeInstances}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-medium">{workflow.completionRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Time</div>
                      <div className="font-medium">{workflow.avgProcessingTime}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Workflow Steps</div>
                    <div className="space-y-1">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`}></div>
                          <span className="flex-1">{step.name}</span>
                          <span className="text-muted-foreground">{step.assignee}</span>
                          {index < workflow.steps.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Created by {workflow.createdBy}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWorkflowMutation.mutate({
                          id: workflow.id,
                          action: workflow.status === 'active' ? 'pause' : 'resume'
                        })}
                      >
                        {workflow.status === 'active' ? 
                          <Pause className="h-3 w-3" /> : 
                          <Play className="h-3 w-3" />
                        }
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflow Instances</CardTitle>
              <CardDescription>Currently running workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowInstances.map(instance => {
                  const workflow = workflows.find(w => w.id === instance.workflowId);
                  return (
                    <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`}></div>
                        <div>
                          <div className="font-medium">Document {instance.documentId}</div>
                          <div className="text-sm text-muted-foreground">
                            {workflow?.name} • Started {new Date(instance.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Progress value={instance.progress} className="w-32 h-2" />
                          <div className="text-xs text-muted-foreground mt-1">{instance.progress}% complete</div>
                        </div>
                        <Badge variant={instance.status === 'blocked' ? 'destructive' : 'default'}>
                          {instance.status.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Categories</CardTitle>
                <CardDescription>Distribution of workflows by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['legal', 'finance', 'compliance', 'hr', 'operations'].map(category => {
                    const count = workflows.filter(w => w.category === category).length;
                    const percentage = workflows.length > 0 ? (count / workflows.length) * 100 : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span>{count} workflows</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Times</CardTitle>
                <CardDescription>Average time by workflow category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map(workflow => (
                    <div key={workflow.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{workflow.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{workflow.avgProcessingTime}</div>
                        <div className="text-sm text-muted-foreground">{workflow.completionRate}% success</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}