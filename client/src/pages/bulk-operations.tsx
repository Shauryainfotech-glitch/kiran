import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  Download, 
  Settings, 
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Tag,
  Search,
  Filter,
  RotateCcw
} from "lucide-react";

interface BulkOperation {
  id: number;
  operationType: string;
  documentIds: number[];
  parameters: any;
  status: string;
  initiatedBy: number;
  initiatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  affectedCount: number;
}

interface Document {
  id: number;
  documentName: string;
  firmId: number;
  categoryId: number;
  status: string;
  uploadedAt: string;
  fileSize: number;
}

export default function BulkOperations() {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [operationType, setOperationType] = useState<string>("");
  const [bulkParameters, setBulkParameters] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFirm, setSelectedFirm] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents for bulk operations
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/firm-documents"],
  });

  // Fetch firms for filtering
  const { data: firms } = useQuery({
    queryKey: ["/api/firms"],
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["/api/document-categories"],
  });

  // Fetch bulk operations history
  const { data: operations, isLoading: operationsLoading } = useQuery({
    queryKey: ["/api/bulk-operations"],
  });

  // Create bulk operation mutation
  const createBulkOperation = useMutation({
    mutationFn: async (operationData: any) => {
      return apiRequest("/api/bulk-operations", {
        method: "POST",
        body: JSON.stringify(operationData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Bulk Operation Started",
        description: "Your bulk operation has been initiated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bulk-operations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/firm-documents"] });
      setSelectedDocuments([]);
      setOperationType("");
      setBulkParameters({});
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error.message || "Failed to start bulk operation",
        variant: "destructive",
      });
    },
  });

  const handleDocumentSelection = (documentId: number, checked: boolean) => {
    if (checked) {
      setSelectedDocuments([...selectedDocuments, documentId]);
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && documents) {
      const filteredDocs = (documents as Document[]).filter(doc => {
        const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        const matchesFirm = selectedFirm === "all" || doc.firmId.toString() === selectedFirm;
        return matchesSearch && matchesStatus && matchesFirm;
      });
      setSelectedDocuments(filteredDocs.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const executeBulkOperation = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document.",
        variant: "destructive",
      });
      return;
    }

    if (!operationType) {
      toast({
        title: "No Operation Selected",
        description: "Please select an operation type.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const operationData = {
      operationType,
      documentIds: selectedDocuments,
      parameters: bulkParameters,
    };

    try {
      await createBulkOperation.mutateAsync(operationData);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case "move": return <FolderOpen className="h-4 w-4" />;
      case "delete": return <Trash2 className="h-4 w-4" />;
      case "update_status": return <Edit3 className="h-4 w-4" />;
      case "bulk_approve": return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredDocuments = documents ? (documents as Document[]).filter(doc => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesFirm = selectedFirm === "all" || doc.firmId.toString() === selectedFirm;
    return matchesSearch && matchesStatus && matchesFirm;
  }) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Operations</h1>
          <p className="text-muted-foreground">
            Perform bulk operations on multiple documents simultaneously
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
          <Button 
            onClick={executeBulkOperation} 
            disabled={selectedDocuments.length === 0 || !operationType || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Execute Operation
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
          <TabsTrigger value="templates">Operation Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Document Selection</CardTitle>
                <CardDescription>
                  Select documents for bulk operations. {selectedDocuments.length} documents selected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Documents</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by document name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Firm</Label>
                    <Select value={selectedFirm} onValueChange={setSelectedFirm}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Firms</SelectItem>
                        {firms && (firms as any[]).map((firm) => (
                          <SelectItem key={firm.id} value={firm.id.toString()}>
                            {firm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Select All Checkbox */}
                <div className="flex items-center space-x-2 border-b pb-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="selectAll" className="font-medium">
                    Select All ({filteredDocuments.length} documents)
                  </Label>
                </div>

                {/* Document List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {documentsLoading ? (
                    <div className="text-center py-8">Loading documents...</div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found matching your criteria
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          checked={selectedDocuments.includes(doc.id)}
                          onCheckedChange={(checked) => handleDocumentSelection(doc.id, checked as boolean)}
                        />
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.documentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.status} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline">{doc.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operation Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Operation Configuration</CardTitle>
                <CardDescription>Configure the bulk operation to perform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="operationType">Operation Type</Label>
                  <Select value={operationType} onValueChange={setOperationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move">Move Documents</SelectItem>
                      <SelectItem value="update_status">Update Status</SelectItem>
                      <SelectItem value="bulk_approve">Bulk Approve</SelectItem>
                      <SelectItem value="delete">Delete Documents</SelectItem>
                      <SelectItem value="export">Export Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Operation-specific parameters */}
                {operationType === "move" && (
                  <div>
                    <Label>Target Category</Label>
                    <Select 
                      value={bulkParameters.targetCategory} 
                      onValueChange={(value) => setBulkParameters({...bulkParameters, targetCategory: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && (categories as any[]).map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {operationType === "update_status" && (
                  <div>
                    <Label>New Status</Label>
                    <Select 
                      value={bulkParameters.newStatus} 
                      onValueChange={(value) => setBulkParameters({...bulkParameters, newStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {operationType === "bulk_approve" && (
                  <div>
                    <Label htmlFor="approvalNotes">Approval Notes</Label>
                    <Textarea
                      id="approvalNotes"
                      placeholder="Add approval notes..."
                      value={bulkParameters.approvalNotes || ""}
                      onChange={(e) => setBulkParameters({...bulkParameters, approvalNotes: e.target.value})}
                    />
                  </div>
                )}

                {operationType === "delete" && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action cannot be undone. Selected documents will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <strong>{selectedDocuments.length}</strong> documents selected for {operationType ? operationType.replace('_', ' ') : 'operation'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
              <CardDescription>View previous bulk operations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operationsLoading ? (
                  <div className="text-center py-8">Loading operations...</div>
                ) : operations && (operations as BulkOperation[]).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bulk operations found
                  </div>
                ) : (
                  (operations as BulkOperation[]).map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getOperationIcon(operation.operationType)}
                          <div>
                            <div className="font-medium">
                              {operation.operationType.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Initiated {new Date(operation.initiatedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          <Badge variant={operation.status === "completed" ? "default" : operation.status === "failed" ? "destructive" : "secondary"}>
                            {operation.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Documents:</span>
                          <div className="font-medium">{operation.documentIds.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Affected:</span>
                          <div className="font-medium">{operation.affectedCount}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">
                            {operation.completedAt 
                              ? `${Math.round((new Date(operation.completedAt).getTime() - new Date(operation.initiatedAt).getTime()) / 1000)}s`
                              : "In progress"
                            }
                          </div>
                        </div>
                      </div>

                      {operation.status === "in_progress" && (
                        <Progress value={65} className="h-2" />
                      )}

                      {operation.errorMessage && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{operation.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation Templates</CardTitle>
              <CardDescription>Save and reuse common bulk operation configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium">Approve All Pending</div>
                        <div className="text-sm text-muted-foreground">Bulk approve all pending documents</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FolderOpen className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">Move to Archive</div>
                        <div className="text-sm text-muted-foreground">Move expired documents to archive</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Edit3 className="h-8 w-8 text-orange-600" />
                      <div>
                        <div className="font-medium">Status Update</div>
                        <div className="text-sm text-muted-foreground">Update status for multiple documents</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium mb-4">Create New Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input id="templateName" placeholder="Enter template name..." />
                  </div>
                  <div>
                    <Label htmlFor="templateOperation">Operation Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="move">Move Documents</SelectItem>
                        <SelectItem value="update_status">Update Status</SelectItem>
                        <SelectItem value="bulk_approve">Bulk Approve</SelectItem>
                        <SelectItem value="delete">Delete Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea id="templateDescription" placeholder="Describe what this template does..." />
                </div>
                <Button className="mt-4">
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}