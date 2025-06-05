import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin,
  Shield,
  Award,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  Download,
  FileText
} from "lucide-react";
import type { TenderWithSubmissions } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TenderCardProps {
  tender: TenderWithSubmissions & {
    tenderOpeningDate?: string;
    emdAmount?: string;
    emdReturnDate?: string;
    securityDeposit?: string;
    technicalBidRequirements?: string[];
    commercialBidQuote?: {
      basicRate: string;
      exciseDuty: string;
      salesTax: string;
      totalAmount: string;
    };
    l1Details?: { vendor: string; amount: string; status: string };
    l2Details?: { vendor: string; amount: string; status: string };
    l3Details?: { vendor: string; amount: string; status: string };
    quotationManagement?: {
      completionDate: string;
      paymentTerms: string;
      zoneLocation: string;
      projectDescription: string;
      clientDetails: string;
    };
    documents?: string[];
    priority?: string;
    tags?: string[];
    currentStage?: number;
  };
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onDownloadDocument?: (document: string) => void;
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

export default function TenderCard({ tender, onView, onEdit, onDelete, onDownloadDocument }: TenderCardProps) {
  const deadline = new Date(tender.submissionDeadline);
  const isOverdue = deadline < new Date() && !["closed", "awarded"].includes(tender.status);
  
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stageProgress = tender.currentStage ? (tender.currentStage / 14) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 mb-2">
              {tender.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {tender.category}
              </Badge>
              <Badge className={cn("text-xs text-white", getStatusBadgeClass(tender.status))}>
                {formatStatus(tender.status)}
              </Badge>
              {tender.priority && (
                <Badge variant="outline" className={`text-xs ${getPriorityColor(tender.priority)}`}>
                  {tender.priority.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Estimated Value</div>
            <div className="text-xl font-bold text-green-600">
              {tender.estimatedValue 
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(tender.estimatedValue))
                : 'Not specified'
              }
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tender.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tender.description}
          </p>
        )}

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{tender.location || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className={cn(
              "text-gray-600",
              isOverdue ? "text-destructive font-medium" : ""
            )}>
              Due: {deadline.toLocaleDateString()}
            </span>
          </div>
          {tender.tenderOpeningDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Opening: {tender.tenderOpeningDate}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{tender.submissionCount} submissions</span>
          </div>
        </div>

        <Separator />

        {/* EMD and Security Details */}
        {tender.emdAmount && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Financial Requirements
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-700 font-medium">EMD Amount:</span>
                <div className="text-blue-900 font-semibold">{tender.emdAmount}</div>
              </div>
              {tender.securityDeposit && (
                <div>
                  <span className="text-blue-700 font-medium">Security Deposit:</span>
                  <div className="text-blue-900 font-semibold">{tender.securityDeposit}</div>
                </div>
              )}
              {tender.emdReturnDate && (
                <div className="col-span-2">
                  <span className="text-blue-700 font-medium">EMD Return Date:</span>
                  <div className="text-blue-900">{tender.emdReturnDate}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commercial Bid Quote */}
        {tender.commercialBidQuote && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-green-900 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Commercial Bid Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-green-700">Basic Rate:</span>
                <div className="font-semibold">{tender.commercialBidQuote.basicRate}</div>
              </div>
              <div>
                <span className="text-green-700">Excise Duty:</span>
                <div className="font-semibold">{tender.commercialBidQuote.exciseDuty}</div>
              </div>
              <div>
                <span className="text-green-700">Sales Tax:</span>
                <div className="font-semibold">{tender.commercialBidQuote.salesTax}</div>
              </div>
              <div className="bg-green-100 p-2 rounded">
                <span className="text-green-700">Total Amount:</span>
                <div className="font-bold text-green-900">{tender.commercialBidQuote.totalAmount}</div>
              </div>
            </div>
          </div>
        )}

        {/* L1, L2, L3 Details */}
        {tender.l1Details && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-yellow-900 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Bidder Rankings
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100">L1</Badge>
                  <span className="font-medium">{tender.l1Details.vendor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{tender.l1Details.amount}</span>
                  {tender.l1Details.status === 'approved' ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> : 
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  }
                </div>
              </div>
              {tender.l2Details && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-100">L2</Badge>
                    <span className="font-medium">{tender.l2Details.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tender.l2Details.amount}</span>
                    {tender.l2Details.status === 'approved' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> : 
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    }
                  </div>
                </div>
              )}
              {tender.l3Details && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-gray-100">L3</Badge>
                    <span className="font-medium">{tender.l3Details.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tender.l3Details.amount}</span>
                    {tender.l3Details.status === 'approved' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> : 
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotation Management */}
        {tender.quotationManagement && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-purple-900 mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Project Management
            </h4>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-purple-700 font-medium">Completion Date:</span>
                <span className="ml-2">{tender.quotationManagement.completionDate}</span>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Payment Terms:</span>
                <span className="ml-2">{tender.quotationManagement.paymentTerms}</span>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Zone/Location:</span>
                <span className="ml-2">{tender.quotationManagement.zoneLocation}</span>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Client:</span>
                <span className="ml-2">{tender.quotationManagement.clientDetails}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Progress */}
        {tender.currentStage && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Stage Progress</span>
              <span className="text-gray-600">{tender.currentStage}/14</span>
            </div>
            <Progress value={stageProgress} className="h-2" />
          </div>
        )}

        {/* Technical Requirements */}
        {tender.technicalBidRequirements && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Technical Requirements</h4>
            <div className="flex flex-wrap gap-1">
              {tender.technicalBidRequirements.slice(0, 3).map((req: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {tender.technicalBidRequirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tender.technicalBidRequirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {tender.documents && tender.documents.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents ({tender.documents.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {tender.documents.slice(0, 2).map((doc: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onDownloadDocument?.(doc)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  {doc}
                </Button>
              ))}
              {tender.documents.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tender.documents.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {tender.tags && (
          <div className="flex flex-wrap gap-1">
            {tender.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button 
              onClick={() => onView(tender.id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              onClick={() => onEdit(tender.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              onClick={() => onDelete(tender.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
