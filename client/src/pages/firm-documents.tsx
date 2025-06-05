import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFirmSchema, insertDocumentCategorySchema, insertFirmDocumentSchema } from "@shared/schema";
import type { Firm, DocumentCategory, FirmDocument } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

// Form schemas
const firmFormSchema = insertFirmSchema.extend({
  name: z.string().min(1, "Firm name is required"),
});

const categoryFormSchema = insertDocumentCategorySchema.extend({
  name: z.string().min(1, "Category name is required"),
});

const documentFormSchema = insertFirmDocumentSchema.extend({
  title: z.string().min(1, "Document title is required"),
  firmId: z.number().min(1, "Please select a firm"),
});

export default function FirmDocuments() {
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedFirm, setSelectedFirm] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch firms
  const { data: firms = [], isLoading: firmsLoading } = useQuery({
    queryKey: ["/api/firms"],
  });

  // Fetch document categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/document-categories"],
  });

  // Fetch firm documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/firm-documents", selectedFirm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFirm) params.append('firmId', selectedFirm.toString());
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      const response = await apiRequest(`/api/firm-documents?${params.toString()}`);
      return response.json();
    },
  });

  // Create firm mutation
  const createFirmMutation = useMutation({
    mutationFn: (data: z.infer<typeof firmFormSchema>) => 
      apiRequest("/api/firms", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firms"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Firm created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create firm", variant: "destructive" });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof categoryFormSchema>) => 
      apiRequest("/api/document-categories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-categories"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest("/api/firm-documents", {
        method: "POST",
        body: formData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firm-documents"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Document created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create document", variant: "destructive" });
    },
  });

  // Delete mutations
  const deleteFirmMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/firms/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firms"] });
      toast({ title: "Success", description: "Firm deleted successfully" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/document-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/firm-documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/firm-documents"] });
      toast({ title: "Success", description: "Document deleted successfully" });
    },
  });

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc: FirmDocument) =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Expired": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Available": return "default";
      case "Pending": return "secondary";
      case "Expired": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Firm Document Management</h1>
          <p className="text-muted-foreground">
            Manage multiple firms and their document categories with organized file storage
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="firms" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Firms
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFirm?.toString() || "all"} onValueChange={(value) => setSelectedFirm(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by firm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Firms</SelectItem>
                {firms.map((firm: Firm) => (
                  <SelectItem key={firm.id} value={firm.id.toString()}>
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory?.toString() || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: DocumentCategory) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DocumentDialog 
              firms={firms} 
              categories={categories}
              mutation={createDocumentMutation}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              }
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {documentsLoading ? (
                <div className="p-8 text-center">Loading documents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Firm</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((document: FirmDocument) => {
                        const firm = firms.find((f: Firm) => f.id === document.firmId);
                        const category = categories.find((c: DocumentCategory) => c.id === document.categoryId);
                        
                        return (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{document.title}</div>
                                  {document.fileName && (
                                    <div className="text-sm text-muted-foreground">{document.fileName}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{firm?.name || 'Unknown'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{category?.name || 'Uncategorized'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(document.status || 'Unknown')}
                                <Badge variant={getStatusVariant(document.status || 'Unknown')}>
                                  {document.status || 'Unknown'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {document.validity ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {new Date(document.validity).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {new Date(document.uploadedAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteDocumentMutation.mutate(document.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firms Tab */}
        <TabsContent value="firms" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Manage Firms</h2>
            <FirmDialog 
              mutation={createFirmMutation}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Firm
                </Button>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firmsLoading ? (
              <div className="col-span-full text-center py-8">Loading firms...</div>
            ) : (
              firms.map((firm: Firm) => (
                <Card key={firm.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Building2 className="h-6 w-6 text-primary" />
                      <Badge variant={firm.isActive ? "default" : "secondary"}>
                        {firm.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{firm.name}</CardTitle>
                    <CardDescription>{firm.registrationNumber}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {firm.contactPerson && (
                        <div><strong>Contact:</strong> {firm.contactPerson}</div>
                      )}
                      {firm.phone && (
                        <div><strong>Phone:</strong> {firm.phone}</div>
                      )}
                      {firm.email && (
                        <div><strong>Email:</strong> {firm.email}</div>
                      )}
                      {firm.address && (
                        <div><strong>Address:</strong> {firm.address}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteFirmMutation.mutate(firm.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Document Categories</h2>
            <CategoryDialog 
              mutation={createCategoryMutation}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-8">Loading categories...</div>
            ) : (
              categories.map((category: DocumentCategory) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Filter className="h-6 w-6 text-primary" />
                      <Badge variant={category.isRequired ? "default" : "secondary"}>
                        {category.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sort Order: {category.sortOrder}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Dialog Components
function FirmDialog({ mutation, trigger }: { mutation: any; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof firmFormSchema>>({
    resolver: zodResolver(firmFormSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
      website: "",
      isActive: true,
    },
  });

  const onSubmit = (data: z.infer<typeof firmFormSchema>) => {
    mutation.mutate(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Firm</DialogTitle>
          <DialogDescription>
            Create a new firm to organize documents by company.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter firm name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter registration number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Firm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialog({ mutation, trigger }: { mutation: any; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isRequired: false,
      sortOrder: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    mutation.mutate(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Document Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize documents by type.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={form.watch("isRequired")}
                  onChange={(e) => form.setValue("isRequired", e.target.checked)}
                />
                <label htmlFor="isRequired" className="text-sm font-medium">
                  Required Category
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentDialog({ firms, categories, mutation, trigger }: { 
  firms: Firm[], 
  categories: DocumentCategory[], 
  mutation: any, 
  trigger: React.ReactNode 
}) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      firmId: 0,
      categoryId: null,
      documentNumber: "",
      status: "Available",
      description: "",
      responsible: "",
      charges: "",
      duration: "",
      challenges: "",
      timeline: "",
    },
  });

  const onSubmit = (data: z.infer<typeof documentFormSchema>) => {
    const formData = new FormData();
    formData.append('documentData', JSON.stringify(data));
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    mutation.mutate(formData);
    form.reset();
    setSelectedFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
          <DialogDescription>
            Upload and organize documents for your firms.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a firm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {firms.map((firm) => (
                          <SelectItem key={firm.id} value={firm.id.toString()}>
                            {firm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX, JPG, PNG up to 50MB
                  </div>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter document description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter responsible person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Document"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}