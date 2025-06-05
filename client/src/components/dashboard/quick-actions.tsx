import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText } from "lucide-react";

interface QuickActionsProps {
  onCreateTender: () => void;
}

export default function QuickActions({ onCreateTender }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onCreateTender}
        >
          <Plus className="h-4 w-4 mr-3" />
          Create New Tender
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Upload className="h-4 w-4 mr-3" />
          Upload Documents
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <FileText className="h-4 w-4 mr-3" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}
