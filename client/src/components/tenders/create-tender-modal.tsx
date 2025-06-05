import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TenderForm from "./tender-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertTender } from "@shared/schema";

interface CreateTenderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTenderModal({ open, onOpenChange }: CreateTenderModalProps) {
  const [isDraft, setIsDraft] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTenderMutation = useMutation({
    mutationFn: async (data: InsertTender) => {
      const response = await apiRequest("POST", "/api/tenders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      toast({
        title: "Success",
        description: `Tender ${isDraft ? 'saved as draft' : 'published'} successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tender",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertTender, asDraft: boolean) => {
    setIsDraft(asDraft);
    const tenderData = {
      ...data,
      status: asDraft ? "draft" : "published",
      createdBy: 1, // Default user for now
    };
    createTenderMutation.mutate(tenderData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tender</DialogTitle>
        </DialogHeader>
        <TenderForm 
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createTenderMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
