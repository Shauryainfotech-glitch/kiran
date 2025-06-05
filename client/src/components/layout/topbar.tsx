import { useLocation } from "wouter";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import CreateTenderModal from "@/components/tenders/create-tender-modal";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/tenders": "All Tenders",
  "/calendar": "Calendar",
  "/vendors": "Vendors",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Topbar() {
  const [location] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pageName = pageNames[location] || "Page";

  return (
    <>
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-foreground">{pageName}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
            </div>

            {/* Add Tender Button */}
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Tender</span>
            </Button>
          </div>
        </div>
      </header>

      <CreateTenderModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </>
  );
}
