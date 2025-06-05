import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Tender, Vendor } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function Reports() {
  const { data: tenders = [] } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"],
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  // Calculate report data
  const statusCounts = tenders.reduce((acc, tender) => {
    acc[tender.status] = (acc[tender.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = tenders.reduce((acc, tender) => {
    acc[tender.category] = (acc[tender.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = tenders.reduce((sum, tender) => 
    sum + parseFloat(tender.estimatedValue || '0'), 0
  );

  const avgValue = tenders.length > 0 ? totalValue / tenders.length : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTenders = tenders.filter(tender => {
    const tenderDate = new Date(tender.createdAt);
    return tenderDate.getMonth() === currentMonth && tenderDate.getFullYear() === currentYear;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenders.length}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyTenders.length} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(avgValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenders.length > 0 ? 
                Math.round((statusCounts.awarded || 0) / tenders.length * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Awarded tenders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tender Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tender Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(count / tenders.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ 
                          width: `${(count / tenders.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">New Tenders</p>
              <p className="text-2xl font-bold text-green-600">
                {monthlyTenders.length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Published</p>
              <p className="text-2xl font-bold text-blue-600">
                {monthlyTenders.filter(t => t.status === 'published').length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Closed</p>
              <p className="text-2xl font-bold text-gray-600">
                {monthlyTenders.filter(t => t.status === 'closed' || t.status === 'awarded').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
