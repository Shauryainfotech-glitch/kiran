import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateTenderModal from "@/components/tenders/create-tender-modal";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tenders": "All Tenders",
  "/calendar": "Calendar",
  "/vendors": "Vendors",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [location] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const pageTitle = pageTitles[location] || "Dashboard";

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-foreground">{pageTitle}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-80 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
            </div>

            {/* Add Tender Button */}
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Tender</span>
            </Button>
          </div>
        </div>
      </header>

      <CreateTenderModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
