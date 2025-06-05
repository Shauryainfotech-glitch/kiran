import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Building, 
  FileText, 
  Settings, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight,
  Calendar as CalendarIcon,
  Download
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinanceStats {
  emdPayment: { paid: number; refund: number };
  sdPayment: { paid: number; refund: number };
  emdUnderProcess: number;
  emdForfeited: number;
  sdForfeited: number;
  expired: { emd: number; sd: number };
  newRequests: { 
    bankGuarantee: number; 
    securityDeposit: number; 
    fees: number; 
    others: number;
    emd: number;
  };
  usedRequests: { 
    bankGuarantee: number; 
    securityDeposit: number; 
    fees: number; 
    others: number;
    emd: number;
  };
}

interface TodayActivity {
  id: number;
  assignee: string;
  assignBy: string;
  dueDate: string;
  submissionDate: string;
  status: string;
}

export default function FinanceDashboard() {
  // Finance data will be fetched from API in production
  const financeStats: FinanceStats = {
    emdPayment: { paid: 0, refund: 0 },
    sdPayment: { paid: 0, refund: 0 },
    emdUnderProcess: 0,
    emdForfeited: 0,
    sdForfeited: 0,
    expired: { emd: 0, sd: 0 },
    newRequests: { 
      bankGuarantee: 0, 
      securityDeposit: 0, 
      fees: 0, 
      others: 0,
      emd: 0
    },
    usedRequests: { 
      bankGuarantee: 0, 
      securityDeposit: 0, 
      fees: 0, 
      others: 0,
      emd: 0
    }
  };

  const todayActivities: TodayActivity[] = [];

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* EMD & SD Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">EMD Payment & Refund Summary</h3>
            <p className="text-sm text-blue-600 mb-1">Paid EMD: {formatCurrency(financeStats.emdPayment.paid)}</p>
            <p className="text-sm text-blue-600">Refund EMD: {formatCurrency(financeStats.emdPayment.refund)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">SD Payment & Refund Summary</h3>
            <p className="text-sm text-green-600 mb-1">Paid SD: {formatCurrency(financeStats.sdPayment.paid)}</p>
            <p className="text-sm text-green-600">Refund SD: {formatCurrency(financeStats.sdPayment.refund)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">EMD Under Process</h3>
            <p className="text-lg font-bold text-orange-600">
              Under Process EMD: {formatCurrency(financeStats.emdUnderProcess)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">EMD & SD Forfeited</h3>
            <p className="text-sm text-red-600 mb-1">Forfeited EMD: {formatCurrency(financeStats.emdForfeited)}</p>
            <p className="text-sm text-red-600">Forfeited SD: {formatCurrency(financeStats.sdForfeited)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm text-muted-foreground mb-2">Expired EMD & SD</h3>
            <p className="text-sm text-muted-foreground mb-1">Expired EMD: {formatCurrency(financeStats.expired.emd)}</p>
            <p className="text-sm text-muted-foreground">Expired SD: {formatCurrency(financeStats.expired.sd)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Bank Guarantee</h3>
            <p className="text-sm text-muted-foreground mb-1">
              New Request: {financeStats.newRequests.bankGuarantee.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Used B.G: {financeStats.usedRequests.bankGuarantee}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Security Deposit</h3>
            <p className="text-sm text-muted-foreground mb-1">
              New Request: {financeStats.newRequests.securityDeposit}
            </p>
            <p className="text-sm text-muted-foreground">
              Used S.D: {financeStats.usedRequests.securityDeposit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Fees</h3>
            <p className="text-sm text-muted-foreground mb-1">
              New Request: {financeStats.newRequests.fees.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Used Fees: {financeStats.usedRequests.fees}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Others</h3>
            <p className="text-sm text-muted-foreground mb-1">
              New Request: {financeStats.newRequests.others}
            </p>
            <p className="text-sm text-muted-foreground">
              Used Other: {financeStats.usedRequests.others}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* EMD Management */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-4">EMD</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              New Request: {financeStats.newRequests.emd.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Used EMD: {financeStats.usedRequests.emd.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayActivities.map((activity, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium">Tender Assigned to team</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tender ID: {activity.id}</p>
                  <p className="text-xs text-muted-foreground">Assign To: {activity.assignee}</p>
                  <p className="text-xs text-muted-foreground">Assign Date & Time: {activity.dueDate}</p>
                  <p className="text-xs text-muted-foreground">Submission Date: {activity.submissionDate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthName}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 font-medium text-muted-foreground">{day}</div>
              ))}
              {Array.from({length: 30}, (_, i) => (
                <div key={i} className={`p-2 hover:bg-blue-50 cursor-pointer rounded ${
                  i === 8 ? 'bg-green-100 text-green-700' : 
                  i === 15 || i === 17 || i === 25 ? 'bg-orange-100 text-orange-700' : ''
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Finance Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Process EMD Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Finance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Pending Approvals</h3>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-muted-foreground">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Monthly Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Transactions:</span>
                <span className="text-sm font-semibold">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Amount:</span>
                <span className="text-sm font-semibold">{formatCurrency(4318026301)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending:</span>
                <span className="text-sm font-semibold text-orange-600">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}