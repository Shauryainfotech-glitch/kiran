import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Calendar, DollarSign, Users } from "lucide-react";
import type { TenderWithSubmissions } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TenderCardProps {
  tender: TenderWithSubmissions;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "draft":
      return "status-draft";
    case "published":
      return "status-published";
    case "in_progress":
      return "status-in_progress";
    case "closed":
      return "status-closed";
    case "awarded":
      return "status-awarded";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function TenderCard({ tender, onView, onEdit, onDelete }: TenderCardProps) {
  const deadline = new Date(tender.submissionDeadline);
  const isOverdue = deadline < new Date() && !["closed", "awarded"].includes(tender.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{tender.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{tender.reference}</p>
            <p className="text-sm text-muted-foreground">{tender.category}</p>
          </div>
          <Badge className={cn("ml-4", getStatusBadgeClass(tender.status))}>
            {formatStatus(tender.status)}
          </Badge>
        </div>

        {tender.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {tender.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {tender.estimatedValue 
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(tender.estimatedValue))
                : 'Not specified'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {tender.submissionCount} submissions
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className={cn(
              "text-sm",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              Due: {deadline.toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(tender.id)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(tender.id)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(tender.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
