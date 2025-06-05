import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Activity,
  Calendar as CalendarIcon,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ShoppingCart,
  Package
} from "lucide-react";
import { format } from "date-fns";

interface SalesMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}

interface Activity {
  id: string;
  type: 'tender_won' | 'tender_lost' | 'proposal_submitted' | 'meeting_scheduled' | 'payment_received';
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface FinanceItem {
  id: string;
  type: 'invoice' | 'payment' | 'expense' | 'refund';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  date: string;
  client?: string;
  category: string;
}

interface TenderAnalysis {
  stage: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignee: string;
  createdAt: string;
  dueDate: string;
}

interface RatePurchase {
  id: string;
  item: string;
  category: string;
  vendor: string;
  currentRate: number;
  previousRate: number;
  quantity: number;
  totalValue: number;
  lastUpdated: string;
  status: 'active' | 'expired' | 'pending';
}

export default function SalesDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const salesMetrics: SalesMetric[] = [
    {
      id: '1',
      title: 'Total Revenue',
      value: '₹12,45,678',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign
    },
    {
      id: '2',
      title: 'Active Tenders',
      value: '23',
      change: '+8.1%',
      trend: 'up',
      icon: Target
    },
    {
      id: '3',
      title: 'Win Rate',
      value: '68.5%',
      change: '-2.3%',
      trend: 'down',
      icon: TrendingUp
    },
    {
      id: '4',
      title: 'Active Clients',
      value: '156',
      change: '+12.4%',
      trend: 'up',
      icon: Users
    }
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'tender_won',
      title: 'Tender Won: IT Infrastructure Project',
      description: 'Successfully won the government IT infrastructure tender worth ₹5,00,000',
      amount: '₹5,00,000',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'proposal_submitted',
      title: 'Proposal Submitted',
      description: 'Submitted proposal for healthcare equipment procurement',
      timestamp: '4 hours ago',
      status: 'info'
    },
    {
      id: '3',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Payment of ₹2,50,000 received from previous tender completion',
      amount: '₹2,50,000',
      timestamp: '1 day ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'meeting_scheduled',
      title: 'Client Meeting Scheduled',
      description: 'Pre-bid meeting scheduled for construction project tender',
      timestamp: '2 days ago',
      status: 'info'
    },
    {
      id: '5',
      type: 'tender_lost',
      title: 'Tender Lost: Software Development',
      description: 'Did not win the software development tender due to pricing',
      timestamp: '3 days ago',
      status: 'warning'
    }
  ];

  const financeItems: FinanceItem[] = [
    {
      id: '1',
      type: 'invoice',
      description: 'IT Infrastructure Project - Phase 1',
      amount: 500000,
      status: 'approved',
      date: '2024-06-05',
      client: 'Government Agency',
      category: 'IT Services'
    },
    {
      id: '2',
      type: 'payment',
      description: 'Healthcare Equipment Payment',
      amount: 250000,
      status: 'pending',
      date: '2024-06-04',
      client: 'Medical Center',
      category: 'Healthcare'
    },
    {
      id: '3',
      type: 'expense',
      description: 'Travel expenses for tender submission',
      amount: 15000,
      status: 'approved',
      date: '2024-06-03',
      category: 'Travel'
    },
    {
      id: '4',
      type: 'invoice',
      description: 'Construction Material Supply',
      amount: 750000,
      status: 'paid',
      date: '2024-06-02',
      client: 'Construction Corp',
      category: 'Construction'
    }
  ];

  const tenderAnalysis: TenderAnalysis[] = [
    { stage: 'Lead Generation', count: 45, value: 2500000, percentage: 25, color: 'bg-blue-500' },
    { stage: 'Proposal Preparation', count: 28, value: 1800000, percentage: 35, color: 'bg-yellow-500' },
    { stage: 'Bid Submission', count: 18, value: 1200000, percentage: 60, color: 'bg-purple-500' },
    { stage: 'Evaluation', count: 12, value: 800000, percentage: 75, color: 'bg-orange-500' },
    { stage: 'Negotiation', count: 8, value: 600000, percentage: 85, color: 'bg-green-500' },
    { stage: 'Award', count: 5, value: 400000, percentage: 95, color: 'bg-emerald-500' }
  ];

  const incidents: Incident[] = [
    {
      id: '1',
      title: 'Server Downtime During Bid Submission',
      description: 'Technical issue prevented bid submission for 2 hours',
      priority: 'high',
      status: 'resolved',
      assignee: 'IT Team',
      createdAt: '2024-06-05T10:00:00Z',
      dueDate: '2024-06-05T18:00:00Z'
    },
    {
      id: '2',
      title: 'Document Verification Delay',
      description: 'Client requested additional documentation causing project delay',
      priority: 'medium',
      status: 'in_progress',
      assignee: 'Documentation Team',
      createdAt: '2024-06-04T14:30:00Z',
      dueDate: '2024-06-06T17:00:00Z'
    },
    {
      id: '3',
      title: 'Payment Processing Issue',
      description: 'Bank transfer failed due to technical glitch',
      priority: 'critical',
      status: 'open',
      assignee: 'Finance Team',
      createdAt: '2024-06-03T09:15:00Z',
      dueDate: '2024-06-05T12:00:00Z'
    }
  ];

  const ratePurchases: RatePurchase[] = [
    {
      id: '1',
      item: 'Steel Rods (Per Ton)',
      category: 'Construction Materials',
      vendor: 'Steel Corp Ltd',
      currentRate: 65000,
      previousRate: 62000,
      quantity: 50,
      totalValue: 3250000,
      lastUpdated: '2024-06-05',
      status: 'active'
    },
    {
      id: '2',
      item: 'Cement (Per Bag)',
      category: 'Construction Materials',
      vendor: 'Cement Industries',
      currentRate: 450,
      previousRate: 420,
      quantity: 1000,
      totalValue: 450000,
      lastUpdated: '2024-06-04',
      status: 'active'
    },
    {
      id: '3',
      item: 'Computer Systems',
      category: 'IT Equipment',
      vendor: 'Tech Solutions',
      currentRate: 45000,
      previousRate: 48000,
      quantity: 25,
      totalValue: 1125000,
      lastUpdated: '2024-06-03',
      status: 'expired'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'tender_won': return CheckCircle;
      case 'tender_lost': return AlertTriangle;
      case 'proposal_submitted': return FileText;
      case 'meeting_scheduled': return Clock;
      case 'payment_received': return DollarSign;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'paid': return 'text-emerald-600 bg-emerald-100';
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categories = ['all', 'IT Services', 'Construction', 'Healthcare', 'Professional Services', 'Equipment'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">Monitor sales performance and business activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {salesMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="tenders">Tenders</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
        </TabsList>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-sm font-medium text-green-600 mt-1">{activity.amount}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Finance Management
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financeItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                        <h4 className="font-semibold">{item.description}</h4>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{item.date}</span>
                        {item.client && <span>• {item.client}</span>}
                        <span>• {item.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {item.status === 'pending' && (
                          <Button size="sm" variant="default">
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenders Tab */}
        <TabsContent value="tenders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Tender Management
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.slice(1).map((category) => (
                  <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{category}</h4>
                        <Badge variant="secondary">
                          {Math.floor(Math.random() * 10) + 5} Active
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">₹{(Math.random() * 5000000 + 1000000).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate:</span>
                          <span className="font-medium">{(Math.random() * 30 + 60).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg. Value:</span>
                          <span className="font-medium">₹{(Math.random() * 500000 + 100000).toFixed(0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Sales Pipeline Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenderAnalysis.map((stage) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">{stage.count} tenders</span>
                          <p className="font-semibold">{formatCurrency(stage.value)}</p>
                        </div>
                      </div>
                      <Progress value={stage.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{stage.percentage}% conversion rate</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(1).map((category) => {
                    const percentage = Math.random() * 30 + 10;
                    const revenue = Math.random() * 2000000 + 500000;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-primary opacity-80"></div>
                          <span className="font-medium">{category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(revenue)}</p>
                          <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Incident & Notice Management
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Incident
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{incident.title}</h4>
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Assigned to: {incident.assignee}</span>
                          <span>Created: {format(new Date(incident.createdAt), "MMM dd, yyyy")}</span>
                          <span>Due: {format(new Date(incident.dueDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Rate & Purchase Management
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ratePurchases.map((item) => {
                  const rateChange = ((item.currentRate - item.previousRate) / item.previousRate) * 100;
                  const isIncrease = rateChange > 0;
                  
                  return (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold">{item.item}</h4>
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Vendor: {item.vendor}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Rate</p>
                              <p className="font-semibold">{formatCurrency(item.currentRate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Previous Rate</p>
                              <p className="font-medium">{formatCurrency(item.previousRate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{item.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Value</p>
                              <p className="font-semibold">{formatCurrency(item.totalValue)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              {isIncrease ? (
                                <TrendingUp className="h-4 w-4 text-red-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-green-500" />
                              )}
                              <span className={`text-sm ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                                {Math.abs(rateChange).toFixed(1)}%
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Updated: {format(new Date(item.lastUpdated), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}