import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  PieChart,
  LineChart,
  BarChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("tenders");

  // Mock analytics data - in production this would fetch from API
  const mockAnalytics = {
    overview: {
      totalTenders: 156,
      totalValue: 12500000,
      successRate: 68.5,
      avgBidTime: 14.2,
      activeBids: 23,
      wonBids: 107,
      lostBids: 26,
      pendingDecision: 23
    },
    trends: {
      monthly: [
        { month: "Jan", tenders: 12, value: 850000, success: 75 },
        { month: "Feb", tenders: 18, value: 1200000, success: 72 },
        { month: "Mar", tenders: 15, value: 980000, success: 67 },
        { month: "Apr", tenders: 22, value: 1650000, success: 73 },
        { month: "May", tenders: 19, value: 1320000, success: 68 },
        { month: "Jun", tenders: 24, value: 1890000, success: 71 }
      ],
      weekly: [
        { week: "Week 1", tenders: 6, value: 420000, success: 83 },
        { week: "Week 2", tenders: 8, value: 650000, success: 75 },
        { week: "Week 3", tenders: 5, value: 380000, success: 60 },
        { week: "Week 4", tenders: 7, value: 520000, success: 71 }
      ]
    },
    categories: [
      { name: "Technology", count: 45, value: 3200000, success: 72 },
      { name: "Infrastructure", count: 38, value: 4800000, success: 65 },
      { name: "Consulting", count: 32, value: 2100000, success: 78 },
      { name: "Equipment", count: 25, value: 1650000, success: 60 },
      { name: "Services", count: 16, value: 750000, success: 75 }
    ],
    departments: [
      { name: "IT", tenders: 42, value: 2800000, success: 74 },
      { name: "Operations", tenders: 35, value: 2200000, success: 69 },
      { name: "Engineering", tenders: 28, value: 3100000, success: 64 },
      { name: "Procurement", tenders: 24, value: 1800000, success: 71 },
      { name: "Finance", tenders: 18, value: 1200000, success: 78 },
      { name: "HR", tenders: 9, value: 400000, success: 67 }
    ],
    performance: {
      avgResponseTime: 4.8,
      complianceScore: 94.2,
      documentAccuracy: 97.1,
      timeToSubmission: 6.2,
      clientSatisfaction: 4.6,
      teamEfficiency: 89.3
    },
    alerts: [
      { type: "warning", message: "3 tender deadlines approaching within 48 hours", count: 3 },
      { type: "error", message: "2 submissions require urgent attention", count: 2 },
      { type: "info", message: "5 new tender opportunities available", count: 5 },
      { type: "success", message: "12 bids won this month", count: 12 }
    ]
  };

  const { data: analytics = mockAnalytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockAnalytics;
    },
  });

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return { icon: ArrowUp, color: "text-green-600", value: `+${change.toFixed(1)}%` };
    } else if (change < 0) {
      return { icon: ArrowDown, color: "text-red-600", value: `${change.toFixed(1)}%` };
    } else {
      return { icon: Minus, color: "text-gray-600", value: "0%" };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalTenders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +8.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.successRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              -2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Bid Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.avgBidTime} days</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              -1.2 days improved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and action items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.count} items require attention
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid Status</CardTitle>
            <CardDescription>Current bid distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Bids</span>
                <span className="font-medium">{analytics.overview.activeBids}</span>
              </div>
              <Progress value={(analytics.overview.activeBids / analytics.overview.totalTenders) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Won Bids</span>
                <span className="font-medium">{analytics.overview.wonBids}</span>
              </div>
              <Progress value={(analytics.overview.wonBids / analytics.overview.totalTenders) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lost Bids</span>
                <span className="font-medium">{analytics.overview.lostBids}</span>
              </div>
              <Progress value={(analytics.overview.lostBids / analytics.overview.totalTenders) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending Decision</span>
                <span className="font-medium">{analytics.overview.pendingDecision}</span>
              </div>
              <Progress value={(analytics.overview.pendingDecision / analytics.overview.totalTenders) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Tender volume and value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.monthly.map((month, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center">
                      <div className="font-medium">{month.month}</div>
                      <div className="text-sm">
                        <div>{month.tenders} tenders</div>
                        <div className="text-muted-foreground">{formatCurrency(month.value)}</div>
                      </div>
                      <div className="text-center">
                        <Badge variant={month.success >= 70 ? "default" : "secondary"}>
                          {month.success}%
                        </Badge>
                      </div>
                      <div className="w-full">
                        <Progress value={month.success} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Recent weekly activity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.weekly.map((week, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center">
                      <div className="font-medium">{week.week}</div>
                      <div className="text-sm">
                        <div>{week.tenders} tenders</div>
                        <div className="text-muted-foreground">{formatCurrency(week.value)}</div>
                      </div>
                      <div className="text-center">
                        <Badge variant={week.success >= 70 ? "default" : "secondary"}>
                          {week.success}%
                        </Badge>
                      </div>
                      <div className="w-full">
                        <Progress value={week.success} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>Tender distribution and success rates across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg border">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{category.count}</div>
                      <div className="text-xs text-muted-foreground">tenders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(category.value)}</div>
                      <div className="text-xs text-muted-foreground">total value</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={category.success >= 70 ? "default" : "secondary"}>
                        {category.success}%
                      </Badge>
                    </div>
                    <div className="w-full">
                      <Progress value={category.success} className="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Tender activity and success rates by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.departments.map((dept, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg border">
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{dept.tenders}</div>
                      <div className="text-xs text-muted-foreground">tenders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(dept.value)}</div>
                      <div className="text-xs text-muted-foreground">total value</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={dept.success >= 70 ? "default" : "secondary"}>
                        {dept.success}%
                      </Badge>
                    </div>
                    <div className="w-full">
                      <Progress value={dept.success} className="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.avgResponseTime} days</div>
                <Progress value={75} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 5 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.complianceScore}%</div>
                <Progress value={analytics.performance.complianceScore} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 95%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Document Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.documentAccuracy}%</div>
                <Progress value={analytics.performance.documentAccuracy} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 98%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Time to Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.timeToSubmission} days</div>
                <Progress value={70} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 4 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Client Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.clientSatisfaction}/5.0</div>
                <Progress value={(analytics.performance.clientSatisfaction / 5) * 100} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 4.5/5.0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Team Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performance.teamEfficiency}%</div>
                <Progress value={analytics.performance.teamEfficiency} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">Target: 85%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}