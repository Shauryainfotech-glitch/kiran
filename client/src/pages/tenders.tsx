import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TenderTable from "@/components/tenders/tender-table";
import CreateTenderModal from "@/components/tenders/create-tender-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tender } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Tenders() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ["/api/tenders"],
  });

  const deleteTenderMutation = useMutation({
    mutationFn: async (tenderId: number) => {
      await apiRequest("DELETE", `/api/tenders/${tenderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Tender deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tender",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (tenderId: number) => {
    if (window.confirm("Are you sure you want to delete this tender?")) {
      deleteTenderMutation.mutate(tenderId);
    }
  };

  const handleView = (tender: Tender) => {
    // TODO: Implement tender view modal or navigate to detail page
    console.log("View tender:", tender);
  };

  const handleEdit = (tender: Tender) => {
    // TODO: Implement tender edit modal
    console.log("Edit tender:", tender);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Tenders</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>

        <TenderTable
          tenders={tenders}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CreateTenderModal 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
