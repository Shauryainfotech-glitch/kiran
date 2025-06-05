import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Filter,
  Download
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TenderResult {
  id: number;
  tenderTitle: string;
  tenderNumber: string;
  category: string;
  estimatedValue: number;
  finalValue: number;
  status: 'awarded' | 'cancelled' | 'under_evaluation' | 'rejected' | 'completed';
  awardedVendor: string;
  awardDate: string;
  completionDate?: string;
  submissionCount: number;
  evaluationScore: number;
  contractDuration: string;
  performanceRating?: number;
}

interface TenderAnalytics {
  totalTenders: number;
  awardedTenders: number;
  completedTenders: number;
  averageCompletionTime: string;
  totalValueAwarded: number;
  averageBidCount: number;
  successRate: number;
}

export default function TenderResult() {
  const [activeTab, setActiveTab] = useState("results");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data - replace with API calls
  const tenderResults: TenderResult[] = [
    {
      id: 1,
      tenderTitle: "Infrastructure Development Project - Phase 2",
      tenderNumber: "TND-2024-001",
      category: "Infrastructure",
      estimatedValue: 2500000,
      finalValue: 2350000,
      status: "awarded",
      awardedVendor: "ABC Construction Ltd.",
      awardDate: "2024-01-15",
      submissionCount: 8,
      evaluationScore: 92,
      contractDuration: "18 months",
      performanceRating: 4.5
    },
    {
      id: 2,
      tenderTitle: "IT Equipment Procurement",
      tenderNumber: "TND-2024-002",
      category: "Technology",
      estimatedValue: 850000,
      finalValue: 780000,
      status: "completed",
      awardedVendor: "TechSoft Solutions",
      awardDate: "2024-02-10",
      completionDate: "2024-06-15",
      submissionCount: 12,
      evaluationScore: 88,
      contractDuration: "6 months",
      performanceRating: 4.8
    },
    {
      id: 3,
      tenderTitle: "Office Renovation Services",
      tenderNumber: "TND-2024-003",
      category: "Services",
      estimatedValue: 450000,
      finalValue: 425000,
      status: "under_evaluation",
      awardedVendor: "Under Review",
      awardDate: "",
      submissionCount: 6,
      evaluationScore: 0,
      contractDuration: "4 months"
    }
  ];

  const analytics: TenderAnalytics = {
    totalTenders: 15,
    awardedTenders: 12,
    completedTenders: 8,
    averageCompletionTime: "5.2 months",
    totalValueAwarded: 8750000,
    averageBidCount: 7.8,
    successRate: 80
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'under_evaluation': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'awarded': return <Award className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'under_evaluation': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredResults = tenderResults.filter(result => {
    if (statusFilter !== "all" && result.status !== statusFilter) return false;
    if (categoryFilter !== "all" && result.category.toLowerCase() !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            Tender Results
          </h1>
          <p className="text-muted-foreground mt-2">
            Track tender outcomes, performance metrics, and contract awards
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Tender Results</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="awards">Contract Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tenders</p>
                    <p className="text-2xl font-bold">{analytics.totalTenders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Awarded</p>
                    <p className="text-2xl font-bold">{analytics.awardedTenders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalValueAwarded)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{analytics.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="under_evaluation">Under Evaluation</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Input type="date" placeholder="From date" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tender Results Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tender Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Awarded To</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.tenderTitle}</p>
                          <p className="text-sm text-muted-foreground">{result.tenderNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(result.finalValue)}</p>
                          <p className="text-sm text-muted-foreground">
                            Est: {formatCurrency(result.estimatedValue)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(result.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(result.status)}
                            <span className="capitalize">{result.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.awardedVendor}</p>
                          {result.awardDate && (
                            <p className="text-sm text-muted-foreground">
                              {formatDate(result.awardDate)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">Score: {result.evaluationScore}%</p>
                          {result.performanceRating && (
                            <p className="text-sm text-muted-foreground">
                              Rating: {result.performanceRating}/5
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Average Completion Time</span>
                    <span className="font-semibold">{analytics.averageCompletionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Bid Count</span>
                    <span className="font-semibold">{analytics.averageBidCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-semibold">
                      {Math.round((analytics.completedTenders / analytics.awardedTenders) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost Efficiency</span>
                    <span className="font-semibold text-green-600">+6.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">ABC Construction Ltd.</p>
                      <p className="text-sm text-muted-foreground">3 contracts</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">4.5/5</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">TechSoft Solutions</p>
                      <p className="text-sm text-muted-foreground">2 contracts</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">4.8/5</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Global Services Inc.</p>
                      <p className="text-sm text-muted-foreground">1 contract</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">4.2/5</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="awards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contract Awards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenderResults.filter(r => r.status === 'awarded' || r.status === 'completed').map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{result.tenderTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Awarded to {result.awardedVendor} on {formatDate(result.awardDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(result.finalValue)}</p>
                      <p className="text-sm text-muted-foreground">{result.contractDuration}</p>
                    </div>
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