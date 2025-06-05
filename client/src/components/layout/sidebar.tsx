import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  FolderOpen, 
  Calendar, 
  Building, 
  FileText, 
  Settings, 
  File,
  Brain,
  Shield,
  Users,
  CheckCircle,
  Plus,
  TrendingUp,
  PieChart,
  DollarSign,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/sales-dashboard", label: "Sales Dashboard", icon: TrendingUp },
  { href: "/finance-dashboard", label: "Finance Dashboard", icon: DollarSign },
  { href: "/tenders", label: "Tender", icon: FolderOpen },
  { href: "/tender-result", label: "Tender Result", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/tasks", label: "Tender Task", icon: CheckCircle },
  { href: "/finance", label: "Finance Management", icon: DollarSign },
  { href: "/mis", label: "MIS", icon: BarChart3 },
  { href: "/documents", label: "Document Management", icon: FileText },
  { href: "/task", label: "Task", icon: Users },
  { href: "/approvals", label: "Approval's", icon: CheckCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/oem", label: "OEM Management", icon: Building },
  { href: "/utility", label: "Utility", icon: Zap },
  { href: "/user-management", label: "User Management", icon: Users },
  { href: "/ai-suite", label: "AI Assistant", icon: Brain },
  { href: "/tender-add", label: "Tender Add / Modify", icon: Plus },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ATP</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">AVGC TENDER PRO</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Made with Claude</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">PS</span>
            </div>
            <span className="text-sm font-medium text-foreground">Palak Shah</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </aside>
  );
}
