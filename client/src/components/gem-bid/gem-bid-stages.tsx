import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  SkipForward,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Settings,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// GeM Bid Lifecycle Stages based on CSV data
const GEM_BID_STAGES = [
  {
    stageNumber: 1,
    stageName: "Bid Search",
    description: "Search and identify relevant bids",
    importantFields: ["Keyword", "Category", "Buyer Name", "Location", "Bid Type", "Bid Status"],
    checklist: [
      "Filters saved?",
      "Relevant category selected?", 
      "Active bids only?"
    ],
    gemPortalSection: "GeM > Bids > Search"
  },
  {
    stageNumber: 2,
    stageName: "Bid Analysis",
    description: "Analyze bid requirements and criteria",
    importantFields: ["Bid No.", "Bid Type", "BoQ File", "Eligibility Criteria", "EMD", "Delivery Terms", "Consignee Details"],
    checklist: [
      "Custom/BoQ format verified?",
      "Technical criteria matched?",
      "MSME exemption applicable?"
    ],
    gemPortalSection: "Bid Details Page"
  },
  {
    stageNumber: 3,
    stageName: "Pre-Bid Query (Optional)",
    description: "Submit queries and clarifications",
    importantFields: ["Query Text", "Attachment", "Submission Time"],
    checklist: [
      "Q&A window open?",
      "Question clear and relevant?",
      "Supporting doc attached?"
    ],
    gemPortalSection: "Bid > Q&A Tab"
  },
  {
    stageNumber: 4,
    stageName: "Document Preparation",
    description: "Prepare all required documents",
    importantFields: ["Tech Specs", "Authorization Letter", "PAN", "GST", "Experience Proof", "ISO", "Brochures"],
    checklist: [
      "All docs in PDF?",
      "Authorization updated?",
      "File size as per limit?"
    ],
    gemPortalSection: "Offline"
  },
  {
    stageNumber: 5,
    stageName: "Technical Bid Submission",
    description: "Submit technical bid with specifications",
    importantFields: ["BoQ Compliance", "Specification Match", "Uploads", "Terms Acceptance", "DSC"],
    checklist: [
      "All fields filled?",
      "Terms accepted?",
      "DSC working?"
    ],
    gemPortalSection: "Bid > Participate > Technical"
  },
  {
    stageNumber: 6,
    stageName: "Financial Bid Submission",
    description: "Submit financial bid with pricing",
    importantFields: ["Unit Rate", "GST Rate", "BoQ Format Upload", "Price Breakup"],
    checklist: [
      "GST shown separately?",
      "Correct BoQ used?",
      "All columns filled?"
    ],
    gemPortalSection: "Bid > Participate > Financial"
  },
  {
    stageNumber: 7,
    stageName: "Technical Evaluation (by Buyer)",
    description: "Await technical evaluation results",
    importantFields: ["Evaluation Status", "Clarification Request", "Response Time"],
    checklist: [
      "Clarifications answered?",
      "Auto alerts monitored?"
    ],
    gemPortalSection: "Evaluation Tab"
  },
  {
    stageNumber: 8,
    stageName: "Reverse Auction",
    description: "Participate in reverse auction",
    importantFields: ["RA Window Time", "Starting Price", "Decrement Range"],
    checklist: [
      "System time correct?",
      "Token active?",
      "Internet stable?"
    ],
    gemPortalSection: "RA Tab"
  },
  {
    stageNumber: 9,
    stageName: "PO Acceptance",
    description: "Accept purchase order",
    importantFields: ["PO No.", "Acceptance Click", "Commitment Date", "Acknowledgment Upload"],
    checklist: [
      "Accepted within 10 days?",
      "Terms agreed?"
    ],
    gemPortalSection: "PO Tab > Accept"
  },
  {
    stageNumber: 10,
    stageName: "Dispatch & Delivery",
    description: "Dispatch and deliver goods/services",
    importantFields: ["Delivery Challan", "GRN", "Transport Details", "Photo Upload"],
    checklist: [
      "All items as per specs?",
      "Delivered on time?"
    ],
    gemPortalSection: "Offline + GeM PO Tab"
  },
  {
    stageNumber: 11,
    stageName: "Inspection by Consignee",
    description: "Await consignee inspection",
    importantFields: ["Status: Accepted/Rejected", "Comments"],
    checklist: [
      "Partial/Full rejection managed?",
      "Response submitted?"
    ],
    gemPortalSection: "PO Status"
  },
  {
    stageNumber: 12,
    stageName: "Invoice Upload",
    description: "Upload invoice for payment",
    importantFields: ["Invoice No.", "Tax Breakup", "PO No.", "Upload PDF"],
    checklist: [
      "GSTIN match?",
      "PO No. correct?",
      "Invoice readable?"
    ],
    gemPortalSection: "Invoice Tab"
  },
  {
    stageNumber: 13,
    stageName: "Payment Tracking",
    description: "Track payment status",
    importantFields: ["Payment Status", "UTR No.", "Payment Date"],
    checklist: [
      "Delay >30 days?",
      "PFMS error tracked?"
    ],
    gemPortalSection: "Payment Tab"
  },
  {
    stageNumber: 14,
    stageName: "Feedback & Performance",
    description: "Provide and receive feedback",
    importantFields: ["Rating", "Comments", "Review Filing"],
    checklist: [
      "Rating ≥3 stars?",
      "Feedback fair?"
    ],
    gemPortalSection: "Feedback Tab"
  }
];

interface GemBidStagesProps {
  gemBidId: number;
  currentStage: number;
  viewMode: 'kanban' | 'list' | 'timeline';
  onViewModeChange: (mode: 'kanban' | 'list' | 'timeline') => void;
}

interface StageProgress {
  stageNumber: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  assignedTo?: number;
  checklist?: Record<string, boolean>;
}

const getStageStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'skipped':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStageIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-blue-600" />;
    case 'pending':
      return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    case 'skipped':
      return <SkipForward className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

export default function GemBidStages({ gemBidId, currentStage, viewMode, onViewModeChange }: GemBidStagesProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stage progress
  const { data: stageProgress = [], isLoading } = useQuery({
    queryKey: ['/api/gem-bids', gemBidId, 'stages'],
    select: (data: any) => data || []
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async (data: { stageNumber: number; status: string; notes?: string }) => {
      return await apiRequest(`/api/gem-bids/${gemBidId}/stages/${data.stageNumber}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gem-bids', gemBidId, 'stages'] });
      toast({ title: 'Success', description: 'Stage updated successfully' });
      setShowStageDialog(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update stage', variant: 'destructive' });
    }
  });

  const getStageProgress = (stageNumber: number): StageProgress => {
    const progress = stageProgress.find((p: any) => p.stageNumber === stageNumber);
    return progress || { stageNumber, status: stageNumber <= currentStage ? 'completed' : 'pending' };
  };

  const handleStageUpdate = (stageNumber: number, status: string) => {
    updateStageMutation.mutate({ stageNumber, status, notes: stageNotes });
  };

  const toggleStageExpansion = (stageNumber: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageNumber)) {
      newExpanded.delete(stageNumber);
    } else {
      newExpanded.add(stageNumber);
    }
    setExpandedStages(newExpanded);
  };

  const renderKanbanView = () => {
    const columns = [
      { title: 'Pending', status: 'pending', color: 'border-gray-200' },
      { title: 'In Progress', status: 'in_progress', color: 'border-blue-200' },
      { title: 'Completed', status: 'completed', color: 'border-green-200' },
      { title: 'Skipped', status: 'skipped', color: 'border-yellow-200' }
    ];

    return (
      <div className="grid grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.status} className={`border-2 ${column.color} rounded-lg p-4`}>
            <h3 className="font-semibold mb-4 text-center">{column.title}</h3>
            <div className="space-y-3">
              {GEM_BID_STAGES.filter(stage => {
                const progress = getStageProgress(stage.stageNumber);
                return progress.status === column.status;
              }).map((stage) => {
                const progress = getStageProgress(stage.stageNumber);
                return (
                  <Card key={stage.stageNumber} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Stage {stage.stageNumber}
                        </Badge>
                        {getStageIcon(progress.status)}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{stage.stageName}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {stage.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {stage.gemPortalSection}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedStage(stage.stageNumber);
                              setShowStageDialog(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Stage
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {GEM_BID_STAGES.map((stage) => {
          const progress = getStageProgress(stage.stageNumber);
          const isExpanded = expandedStages.has(stage.stageNumber);
          
          return (
            <Card key={stage.stageNumber}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStageIcon(progress.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">Stage {stage.stageNumber}: {stage.stageName}</h3>
                        <Badge className={getStageStatusColor(progress.status)}>
                          {progress.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStageExpansion(stage.stageNumber)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStage(stage.stageNumber);
                          setShowStageDialog(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update Stage
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Add Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Notes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <Collapsible open={isExpanded} onOpenChange={() => toggleStageExpansion(stage.stageNumber)}>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Important Fields</h4>
                        <div className="space-y-1">
                          {stage.importantFields.map((field, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{field}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Checklist</h4>
                        <div className="space-y-1">
                          {stage.checklist.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">GeM Portal Section: </span>
                          <span className="text-sm font-medium">{stage.gemPortalSection}</span>
                        </div>
                        {progress.notes && (
                          <div className="text-sm text-muted-foreground">
                            Notes: {progress.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-6">
          {GEM_BID_STAGES.map((stage, index) => {
            const progress = getStageProgress(stage.stageNumber);
            const isCompleted = progress.status === 'completed';
            
            return (
              <div key={stage.stageNumber} className="relative flex items-start space-x-4">
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                  isCompleted ? 'bg-green-500 border-green-200' : 'bg-gray-100 border-gray-200'
                }`}>
                  {getStageIcon(progress.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Stage {stage.stageNumber}: {stage.stageName}</h3>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                        <Badge className={getStageStatusColor(progress.status)}>
                          {progress.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Portal Section:</span>
                          <p className="text-muted-foreground">{stage.gemPortalSection}</p>
                        </div>
                        <div>
                          <span className="font-medium">Key Fields:</span>
                          <p className="text-muted-foreground">{stage.importantFields.slice(0, 2).join(', ')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <p className="text-muted-foreground">
                            {progress.startedAt && `Started: ${new Date(progress.startedAt).toLocaleDateString()}`}
                            {progress.completedAt && ` | Completed: ${new Date(progress.completedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      
                      {index < GEM_BID_STAGES.length - 1 && (
                        <div className="mt-4 flex justify-end">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedStages = stageProgress.filter((p: any) => p.status === 'completed').length;
  const progressPercentage = (completedStages / GEM_BID_STAGES.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bid Lifecycle Progress</CardTitle>
              <p className="text-sm text-muted-foreground">
                {completedStages} of {GEM_BID_STAGES.length} stages completed
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Tabs value={viewMode} onValueChange={(value: any) => onViewModeChange(value)}>
                <TabsList>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Current Stage: {currentStage}</span>
              <span>{progressPercentage.toFixed(1)}% Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Views */}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'timeline' && renderTimelineView()}

      {/* Stage Update Dialog */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Stage {selectedStage}
              {selectedStage && `: ${GEM_BID_STAGES.find(s => s.stageNumber === selectedStage)?.stageName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => handleStageUpdate(selectedStage!, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                placeholder="Add notes about this stage..."
                rows={3}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}