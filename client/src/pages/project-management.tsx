import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Zap,
  MessageSquare,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Flag,
  Star,
  GitBranch,
  Activity,
  TrendingUp,
  PieChart,
  ListTodo,
  User,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Project Schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  category: z.string().min(1, "Category is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.number().min(0, "Budget must be positive"),
  projectManager: z.string().min(1, "Project manager is required"),
  client: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  objectives: z.string().optional(),
  deliverables: z.string().optional(),
  risks: z.string().optional(),
});

type Project = z.infer<typeof projectSchema>;

// Task Schema
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  projectId: z.number().min(1, "Project selection is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  startDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  estimatedHours: z.number().min(0, "Estimated hours must be positive"),
  actualHours: z.number().min(0, "Actual hours must be positive"),
  category: z.string().min(1, "Category is required"),
  dependencies: z.string().optional(),
  notes: z.string().optional(),
});

type Task = z.infer<typeof taskSchema>;

// Team Member Schema
const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  phone: z.string().optional(),
  skills: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  availability: z.string().min(1, "Availability is required"),
});

type TeamMember = z.infer<typeof teamMemberSchema>;

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "timeline">("list");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockProjects: (Project & { id: number; progress: number; tasksCompleted: number; totalTasks: number })[] = [
    {
      id: 1,
      name: "Enterprise Document Management System",
      description: "Complete overhaul of document management infrastructure",
      status: "In Progress",
      priority: "High",
      category: "Technology",
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      budget: 250000,
      projectManager: "Sarah Johnson",
      client: "Internal",
      department: "IT",
      objectives: "Implement scalable document management with AI capabilities",
      deliverables: "Document platform, user training, migration tools",
      risks: "Data migration complexity, user adoption",
      progress: 78,
      tasksCompleted: 23,
      totalTasks: 31,
    },
    {
      id: 2,
      name: "Tender Management Portal",
      description: "AI-powered tender discovery and submission platform",
      status: "Planning",
      priority: "High",
      category: "Business",
      startDate: "2024-03-01",
      endDate: "2024-09-15",
      budget: 180000,
      projectManager: "Michael Chen",
      client: "Government Relations",
      department: "Business Development",
      objectives: "Automate tender processes and improve success rates",
      deliverables: "Tender portal, AI analysis tools, reporting dashboard",
      risks: "Regulatory compliance, integration challenges",
      progress: 45,
      tasksCompleted: 12,
      totalTasks: 28,
    },
    {
      id: 3,
      name: "Financial Analytics Dashboard",
      description: "Real-time financial reporting and analytics system",
      status: "Completed",
      priority: "Medium",
      category: "Finance",
      startDate: "2023-10-01",
      endDate: "2024-02-29",
      budget: 95000,
      projectManager: "Emma Rodriguez",
      client: "Finance Department",
      department: "Finance",
      objectives: "Provide real-time financial insights and reporting",
      deliverables: "Analytics dashboard, automated reports, KPI tracking",
      risks: "Data accuracy, performance optimization",
      progress: 100,
      tasksCompleted: 18,
      totalTasks: 18,
    },
  ];

  const mockTasks: (Task & { id: number; projectName: string; assigneeName: string })[] = [
    {
      id: 1,
      title: "Database Schema Design",
      description: "Design and implement database schema for document management",
      status: "Completed",
      priority: "High",
      projectId: 1,
      projectName: "Enterprise Document Management System",
      assignedTo: "john.doe@company.com",
      assigneeName: "John Doe",
      startDate: "2024-01-15",
      dueDate: "2024-02-15",
      estimatedHours: 40,
      actualHours: 42,
      category: "Development",
      dependencies: "Requirements gathering",
      notes: "Schema optimized for performance",
    },
    {
      id: 2,
      title: "User Interface Development",
      description: "Develop responsive user interface for document upload and management",
      status: "In Progress",
      priority: "High",
      projectId: 1,
      projectName: "Enterprise Document Management System",
      assignedTo: "jane.smith@company.com",
      assigneeName: "Jane Smith",
      startDate: "2024-02-01",
      dueDate: "2024-04-15",
      estimatedHours: 80,
      actualHours: 56,
      category: "Frontend",
      dependencies: "Database schema, API endpoints",
      notes: "Using React and TypeScript",
    },
    {
      id: 3,
      title: "AI Integration Testing",
      description: "Test and validate AI document analysis capabilities",
      status: "Todo",
      priority: "Medium",
      projectId: 1,
      projectName: "Enterprise Document Management System",
      assignedTo: "alex.brown@company.com",
      assigneeName: "Alex Brown",
      startDate: "2024-04-01",
      dueDate: "2024-05-15",
      estimatedHours: 32,
      actualHours: 0,
      category: "Testing",
      dependencies: "AI model training",
      notes: "Focus on accuracy and performance",
    },
    {
      id: 4,
      title: "Market Research Analysis",
      description: "Analyze tender market trends and opportunities",
      status: "In Progress",
      priority: "High",
      projectId: 2,
      projectName: "Tender Management Portal",
      assignedTo: "lisa.wilson@company.com",
      assigneeName: "Lisa Wilson",
      startDate: "2024-03-01",
      dueDate: "2024-03-30",
      estimatedHours: 24,
      actualHours: 18,
      category: "Research",
      dependencies: "None",
      notes: "Focus on government contracts",
    },
  ];

  const mockTeamMembers: (TeamMember & { id: number; projectsAssigned: number; tasksCompleted: number })[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Senior Developer",
      department: "Engineering",
      phone: "+1-555-0123",
      skills: "React, Node.js, PostgreSQL, AI/ML",
      hourlyRate: 95,
      availability: "Full-time",
      projectsAssigned: 2,
      tasksCompleted: 15,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "UI/UX Designer",
      department: "Design",
      phone: "+1-555-0456",
      skills: "Figma, React, CSS, User Research",
      hourlyRate: 85,
      availability: "Full-time",
      projectsAssigned: 3,
      tasksCompleted: 22,
    },
    {
      id: 3,
      name: "Alex Brown",
      email: "alex.brown@company.com",
      role: "QA Engineer",
      department: "Quality Assurance",
      phone: "+1-555-0789",
      skills: "Test Automation, Selenium, Jest",
      hourlyRate: 75,
      availability: "Part-time",
      projectsAssigned: 2,
      tasksCompleted: 8,
    },
  ];

  // Fetch projects
  const { data: projects = mockProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockProjects;
    },
  });

  // Fetch tasks
  const { data: tasks = mockTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockTasks;
    },
  });

  // Fetch team members
  const { data: teamMembers = mockTeamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ["/api/team-members"],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockTeamMembers;
    },
  });

  // Project form
  const projectForm = useForm<Project>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Planning",
      priority: "Medium",
      category: "Technology",
      startDate: "",
      endDate: "",
      budget: 0,
      projectManager: "",
      client: "",
      department: "",
      objectives: "",
      deliverables: "",
      risks: "",
    },
  });

  // Task form
  const taskForm = useForm<Task>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Todo",
      priority: "Medium",
      projectId: 0,
      assignedTo: "",
      startDate: "",
      dueDate: "",
      estimatedHours: 0,
      actualHours: 0,
      category: "Development",
      dependencies: "",
      notes: "",
    },
  });

  // Team member form
  const teamForm = useForm<TeamMember>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      phone: "",
      skills: "",
      hourlyRate: 0,
      availability: "Full-time",
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: Project) => {
      console.log("Creating project:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      projectForm.reset();
      toast({ title: "Success", description: "Project created successfully" });
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: Task) => {
      console.log("Creating task:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsTaskDialogOpen(false);
      taskForm.reset();
      toast({ title: "Success", description: "Task created successfully" });
    },
  });

  // Create team member mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamMember) => {
      console.log("Creating team member:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsTeamDialogOpen(false);
      teamForm.reset();
      toast({ title: "Success", description: "Team member added successfully" });
    },
  });

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectManager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    const matchesPriority = filterPriority === "all" || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter tasks
  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === "In Progress").length,
    completedProjects: projects.filter(p => p.status === "Completed").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "Completed").length,
    overdueTasks: tasks.filter(t => t.status !== "Completed" && new Date(t.dueDate) < new Date()).length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    teamMembers: teamMembers.length,
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Planning": "outline",
      "In Progress": "default",
      "On Hold": "secondary",
      "Completed": "default",
      "Cancelled": "destructive",
      "Todo": "outline",
      "Done": "default",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      "Low": "bg-green-100 text-green-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "High": "bg-red-100 text-red-800",
      "Critical": "bg-purple-100 text-purple-800",
    } as const;
    return <Badge className={colors[priority as keyof typeof colors] || ""}>{priority}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <FolderKanban className="h-8 w-8 mr-3" />
            Project Management
          </h1>
          <p className="text-muted-foreground">
            Manage projects, tasks, and team collaboration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.completedProjects / stats.totalProjects) * 100).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              On-time delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Resource utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Portfolio</CardTitle>
                  <CardDescription>Manage and track all project initiatives</CardDescription>
                </div>
                <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Set up a new project with timeline, budget, and objectives
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={projectForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter project name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
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
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Planning">Planning</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="projectManager"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Project Manager</FormLabel>
                                <FormControl>
                                  <Input placeholder="Project manager name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <Input placeholder="Department" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Budget ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="client"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Client</FormLabel>
                                <FormControl>
                                  <Input placeholder="Client name (optional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={projectForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Project description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="objectives"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Objectives</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Project objectives and goals" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="deliverables"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deliverables</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Expected deliverables" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="risks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Risks</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Identified risks and mitigation strategies" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsProjectDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createProjectMutation.isPending}>
                            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.projectManager} • {project.department}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {project.description}
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {project.tasksCompleted} of {project.totalTasks} tasks completed
                        </div>
                      </div>

                      {/* Timeline and Budget */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Timeline</div>
                          <div className="font-medium">
                            {format(new Date(project.startDate), "MMM dd")} - {format(new Date(project.endDate), "MMM dd")}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Budget</div>
                          <div className="font-medium">{formatCurrency(project.budget)}</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedProject(project.id);
                            setActiveTab("tasks");
                          }}
                        >
                          <ListTodo className="h-4 w-4 mr-1" />
                          Tasks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Management</CardTitle>
                  <CardDescription>
                    {selectedProject 
                      ? `Tasks for ${projects.find(p => p.id === selectedProject)?.name}`
                      : "Manage tasks across all projects"
                    }
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedProject && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProject(null)}
                    >
                      Show All Tasks
                    </Button>
                  )}
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                          Add a new task to track work progress
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...taskForm}>
                        <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={taskForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Task Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter task title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="projectId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                          {project.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Todo">Todo</SelectItem>
                                      <SelectItem value="In Progress">In Progress</SelectItem>
                                      <SelectItem value="Review">Review</SelectItem>
                                      <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Low">Low</SelectItem>
                                      <SelectItem value="Medium">Medium</SelectItem>
                                      <SelectItem value="High">High</SelectItem>
                                      <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="assignedTo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assigned To</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select assignee" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {teamMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.email}>
                                          {member.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Development">Development</SelectItem>
                                      <SelectItem value="Design">Design</SelectItem>
                                      <SelectItem value="Testing">Testing</SelectItem>
                                      <SelectItem value="Research">Research</SelectItem>
                                      <SelectItem value="Documentation">Documentation</SelectItem>
                                      <SelectItem value="Meeting">Meeting</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Due Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="estimatedHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estimated Hours</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={taskForm.control}
                              name="actualHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Actual Hours</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={taskForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Task description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={taskForm.control}
                            name="dependencies"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dependencies</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tasks this depends on" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={taskForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional notes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsTaskDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createTaskMutation.isPending}>
                              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tasks Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">{task.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>{task.projectName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assigneeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{task.assigneeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>
                          <div className={cn(
                            "text-sm",
                            new Date(task.dueDate) < new Date() && task.status !== "Completed" && "text-red-600"
                          )}>
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              {task.actualHours}h / {task.estimatedHours}h
                            </div>
                            <Progress 
                              value={(task.actualHours / task.estimatedHours) * 100} 
                              className="w-16 h-2" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage team members and their assignments</CardDescription>
                </div>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new team member to the project portfolio
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...teamForm}>
                      <form onSubmit={teamForm.handleSubmit((data) => createTeamMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={teamForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="email@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                  <Input placeholder="Job title/role" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <Input placeholder="Department" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1-555-0123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="availability"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Availability</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Consultant">Consultant</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name="hourlyRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hourly Rate ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={teamForm.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Key skills and technologies" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsTeamDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createTeamMutation.isPending}>
                            {createTeamMutation.isPending ? "Adding..." : "Add Member"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                        </div>
                        <Badge variant="outline">{member.availability}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{member.department}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-1">Skills</div>
                        <div className="text-sm">{member.skills}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Projects</div>
                          <div className="font-medium">{member.projectsAssigned}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Tasks Done</div>
                          <div className="font-medium">{member.tasksCompleted}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Hourly Rate</div>
                          <div className="font-medium">${member.hourlyRate}/hr</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Utilization</div>
                          <div className="font-medium">85%</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Current status of all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Planning", "In Progress", "On Hold", "Completed", "Cancelled"].map((status) => {
                    const count = projects.filter(p => p.status === status).length;
                    const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} projects ({percentage.toFixed(1)}%)</span>
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
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Team workload and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-muted-foreground">Average Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-muted-foreground">On-time Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">2.1</div>
                    <div className="text-sm text-muted-foreground">Avg Projects/Person</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-muted-foreground">Tasks This Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
              <CardDescription>Project budget allocation and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Allocated</div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
                  <div className="text-sm text-green-600">↑ 12% from last quarter</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Amount Spent</div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget * 0.68)}</div>
                  <div className="text-sm text-muted-foreground">68% of total budget</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget * 0.32)}</div>
                  <div className="text-sm text-muted-foreground">32% remaining</div>
                </div>
              </div>
              <div className="mt-6">
                <Progress value={68} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Budget Utilization</span>
                  <span>68%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest project and task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { activity: "Task completed", project: "Enterprise Document Management", user: "John Doe", time: "2 hours ago", type: "success" },
                  { activity: "New project created", project: "Tender Management Portal", user: "Michael Chen", time: "4 hours ago", type: "info" },
                  { activity: "Milestone achieved", project: "Financial Analytics Dashboard", user: "Emma Rodriguez", time: "1 day ago", type: "success" },
                  { activity: "Task overdue", project: "Enterprise Document Management", user: "Jane Smith", time: "2 days ago", type: "warning" },
                  { activity: "Budget updated", project: "Tender Management Portal", user: "Michael Chen", time: "3 days ago", type: "info" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "success" && "bg-green-500",
                      activity.type === "info" && "bg-blue-500",
                      activity.type === "warning" && "bg-yellow-500"
                    )} />
                    <div className="flex-1">
                      <div className="font-medium">{activity.activity}</div>
                      <div className="text-sm text-muted-foreground">{activity.project} • {activity.user}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}