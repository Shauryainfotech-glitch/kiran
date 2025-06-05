import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

export default function DocumentAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedFirm, setSelectedFirm] = useState<string>("all");

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/document-analytics", selectedPeriod, selectedFirm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      if (selectedFirm !== "all") params.append('firmId', selectedFirm);
      return apiRequest(`/api/document-analytics?${params.toString()}`);
    },
  });

  // Mock data for demonstration
  const mockAnalytics = {
    overview: {
      totalDocuments: 1247,
      activeDocuments: 1089,
      pendingApprovals: 23,
      expiringSoon: 15,
      storageUsed: "2.4 GB",
      averageProcessingTime: "2.3 hours"
    },
    documentsByCategory: [
      { name: "Basic Documents", value: 412, color: "#0088FE" },
      { name: "Advance Document", value: 298, color: "#00C49F" },
      { name: "Empanelment", value: 186, color: "#FFBB28" },
      { name: "Membership", value: 134, color: "#FF8042" },
      { name: "Gem OEM Panel", value: 127, color: "#8884D8" },
      { name: "Trade Mark", value: 90, color: "#82CA9D" }
    ],
    documentsByStatus: [
      { name: "Available", value: 1089, color: "#10B981" },
      { name: "Pending", value: 128, color: "#F59E0B" },
      { name: "Expired", value: 30, color: "#EF4444" }
    ],
    uploadTrends: [
      { month: "Jan", uploads: 45, approvals: 42 },
      { month: "Feb", uploads: 52, approvals: 48 },
      { month: "Mar", uploads: 48, approvals: 45 },
      { month: "Apr", uploads: 61, approvals: 58 },
      { month: "May", uploads: 55, approvals: 52 },
      { month: "Jun", uploads: 67, approvals: 61 }
    ],
    firmActivity: [
      { name: "AVF Creative Brand Consultancy", documents: 412, recent: 23 },
      { name: "Tech Solutions Pvt Ltd", documents: 298, recent: 18 },
      { name: "Global Marketing Inc", documents: 267, recent: 15 },
      { name: "Innovation Systems", documents: 186, recent: 12 },
      { name: "Digital Ventures", documents: 84, recent: 8 }
    ],
    complianceStatus: {
      compliant: 1156,
      nonCompliant: 67,
      requiresReview: 24
    },
    versionHistory: [
      { document: "Company Registration", versions: 5, lastUpdated: "2024-06-01" },
      { document: "ISO Certification", versions: 3, lastUpdated: "2024-05-28" },
      { document: "Trade License", versions: 4, lastUpdated: "2024-05-25" },
      { document: "GST Certificate", versions: 2, lastUpdated: "2024-05-20" }
    ]
  };

  const data = analyticsData || mockAnalytics;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and analytics for your document management system
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((data.overview.activeDocuments / data.overview.totalDocuments) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.storageUsed}</div>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageProcessingTime}</div>
            <p className="text-xs text-muted-foreground">
              Per document
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents by Category</CardTitle>
                <CardDescription>Distribution of documents across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.documentsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.documentsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.documentsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload & Approval Trends</CardTitle>
                <CardDescription>Monthly document uploads and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.uploadTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="uploads" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="approvals" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Firm Activity</CardTitle>
                <CardDescription>Document activity by firm</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.firmActivity} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="documents" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Document compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{data.complianceStatus.compliant}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {((data.complianceStatus.compliant / data.overview.totalDocuments) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={(data.complianceStatus.compliant / data.overview.totalDocuments) * 100} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Non-Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{data.complianceStatus.nonCompliant}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {((data.complianceStatus.nonCompliant / data.overview.totalDocuments) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={(data.complianceStatus.nonCompliant / data.overview.totalDocuments) * 100} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span>Requires Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{data.complianceStatus.requiresReview}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {((data.complianceStatus.requiresReview / data.overview.totalDocuments) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={(data.complianceStatus.requiresReview / data.overview.totalDocuments) * 100} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Actions</CardTitle>
                <CardDescription>Recommended actions for compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Critical</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    15 documents expire within 30 days. Immediate renewal required.
                  </p>
                  <Button size="sm" className="mt-2">View Documents</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    23 documents pending approval for over 7 days.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">Review Pending</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Good</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Overall compliance rate is 92.7%. Above industry standard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Version History</CardTitle>
              <CardDescription>Recent document versions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.versionHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.document}</div>
                        <div className="text-sm text-muted-foreground">
                          Last updated: {item.lastUpdated}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {item.versions} version{item.versions !== 1 ? 's' : ''}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest document management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">ISO Certificate approved</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">New document uploaded</div>
                      <div className="text-xs text-muted-foreground">4 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Document version updated</div>
                      <div className="text-xs text-muted-foreground">6 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Document expired</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Most active users this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Admin User</div>
                        <div className="text-sm text-muted-foreground">Document Manager</div>
                      </div>
                    </div>
                    <Badge>245 actions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">John Smith</div>
                        <div className="text-sm text-muted-foreground">Senior Manager</div>
                      </div>
                    </div>
                    <Badge>189 actions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Sarah Johnson</div>
                        <div className="text-sm text-muted-foreground">Compliance Officer</div>
                      </div>
                    </div>
                    <Badge>156 actions</Badge>
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