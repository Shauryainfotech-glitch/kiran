import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Tenders from "@/pages/tenders";
import Calendar from "@/pages/calendar";
import Vendors from "@/pages/vendors";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import FinanceDashboard from "@/pages/finance-dashboard";
import TaskManagement from "@/pages/task-management";
import AISuite from "@/pages/ai-suite";
import BlockchainVerification from "@/pages/blockchain-verification";
import AdminSettings from "@/pages/admin-settings";
import OEMManagement from "@/pages/oem-management";
import TenderCreation from "@/pages/tender-creation";
import TenderResult from "@/pages/tender-result";
import AIAssistant from "@/pages/ai-assistant";
import SalesDashboard from "@/pages/sales-dashboard";
import FirmDocuments from "@/pages/firm-documents";
import DocumentAnalytics from "@/pages/document-analytics";
import BulkOperations from "@/pages/bulk-operations";
import DocumentIntegrations from "@/pages/document-integrations";
import DocumentWorkflows from "@/pages/document-workflows";
import ProjectManagement from "@/pages/project-management";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import SmartRecommendations from "@/pages/smart-recommendations";
import CollaborativeWorkspace from "@/pages/collaborative-workspace";
import GamificationCenter from "@/pages/gamification-center";
import AIConfiguration from "@/pages/ai-configuration";
import GemBid from "@/pages/gem-bid";
import TenderProcessing from "@/pages/tender-processing";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/finance-dashboard" component={FinanceDashboard} />
      <Route path="/sales-dashboard" component={SalesDashboard} />
      <Route path="/tenders" component={Tenders} />
      <Route path="/tender-result" component={TenderResult} />
      <Route path="/analytics" component={Reports} />
      <Route path="/tasks" component={TaskManagement} />
      <Route path="/finance" component={FinanceDashboard} />
      <Route path="/mis" component={Reports} />
      <Route path="/documents" component={FirmDocuments} />
      <Route path="/firm-documents" component={FirmDocuments} />
      <Route path="/document-analytics" component={DocumentAnalytics} />
      <Route path="/bulk-operations" component={BulkOperations} />
      <Route path="/document-integrations" component={DocumentIntegrations} />
      <Route path="/document-workflows" component={DocumentWorkflows} />
      <Route path="/task" component={TaskManagement} />
      <Route path="/approvals" component={TaskManagement} />
      <Route path="/project-management" component={ProjectManagement} />
      <Route path="/projects" component={ProjectManagement} />
      <Route path="/analytics-dashboard" component={AnalyticsDashboard} />
      <Route path="/advanced-analytics" component={AnalyticsDashboard} />
      <Route path="/smart-recommendations" component={SmartRecommendations} />
      <Route path="/collaborative-workspace" component={CollaborativeWorkspace} />
      <Route path="/gamification" component={GamificationCenter} />
      <Route path="/achievements" component={GamificationCenter} />
      <Route path="/ai-configuration" component={AIConfiguration} />
      <Route path="/gem-bid" component={GemBid} />
      <Route path="/tender-processing" component={TenderProcessing} />
      <Route path="/settings" component={Settings} />
      <Route path="/oem" component={OEMManagement} />
      <Route path="/utility" component={Settings} />
      <Route path="/user-management" component={Vendors} />
      <Route path="/ai-suite" component={AISuite} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/tender-add" component={TenderCreation} />
      <Route path="/tender-creation" component={TenderCreation} />
      <Route path="/admin-settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
