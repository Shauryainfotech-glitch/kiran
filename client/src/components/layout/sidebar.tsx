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
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Sales Dashboard", icon: BarChart3 },
  { href: "/ai-suite", label: "TenderAI Pro Suite", icon: Brain },
  { href: "/blockchain", label: "Blockchain Verification", icon: Shield },
  { href: "/finance-dashboard", label: "Finance Dashboard", icon: File },
  { href: "/tenders", label: "Smart Tenders", icon: FolderOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/vendors", label: "Vendor Management", icon: Building },
  { href: "/tasks", label: "Task Management", icon: Users },
  { href: "/reports", label: "Reports & Analytics", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <File className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">TenderFlow</h1>
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">JS</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">John Smith</p>
            <p className="text-xs text-muted-foreground">Tender Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
