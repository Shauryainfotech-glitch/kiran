import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Clock, DollarSign, Trophy } from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import RecentTenders from "@/components/dashboard/recent-tenders";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import CreateTenderModal from "@/components/tenders/create-tender-modal";
import { Tender } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  activeTenders: number;
  dueThisWeek: number;
  totalValue: number;
  successRate: number;
}

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: tenders = [], isLoading: tendersLoading } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"],
  });

  if (statsLoading || tendersLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg"></div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-48 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Tenders"
            value={stats?.activeTenders?.toString() || "0"}
            icon={FolderOpen}
            change="12%"
            changeType="positive"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Due This Week"
            value={stats?.dueThisWeek?.toString() || "0"}
            icon={Clock}
            change="3 urgent"
            changeType="neutral"
            iconBgColor="bg-orange-100"
          />
          <StatsCard
            title="Total Value"
            value={formatCurrency(stats?.totalValue || 0)}
            icon={DollarSign}
            change="8%"
            changeType="positive"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Success Rate"
            value={`${stats?.successRate || 0}%`}
            icon={Trophy}
            change="5%"
            changeType="positive"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentTenders tenders={tenders} />
          
          <div className="space-y-6">
            <QuickActions onCreateTender={() => setIsCreateModalOpen(true)} />
            <UpcomingDeadlines tenders={tenders} />
          </div>
        </div>
      </div>

      <CreateTenderModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
