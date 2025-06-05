import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Users, 
  FileText, 
  TrendingUp,
  DollarSign,
  Calendar,
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  Target
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// OEM Partner Schema
const oemPartnerSchema = z.object({
  name: z.string().min(1, "Partner name is required"),
  type: z.string().min(1, "Partner type is required"),
  status: z.string().min(1, "Status is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  website: z.string().optional(),
  description: z.string().optional(),
  specialization: z.string().optional(),
  certifications: z.string().optional(),
  tierLevel: z.string().min(1, "Tier level is required"),
  contractValue: z.number().min(0, "Contract value must be positive"),
  contractStartDate: z.string().min(1, "Contract start date is required"),
  contractEndDate: z.string().min(1, "Contract end date is required"),
});

type OEMPartner = z.infer<typeof oemPartnerSchema>;

// Product Schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  partnerId: z.number().min(1, "Partner selection is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  specifications: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  availability: z.string().min(1, "Availability status is required"),
  minOrderQuantity: z.number().min(1, "Minimum order quantity is required"),
  leadTime: z.string().min(1, "Lead time is required"),
  warranty: z.string().optional(),
  certifications: z.string().optional(),
});

type Product = z.infer<typeof productSchema>;

export default function OEMManagement() {
  const [activeTab, setActiveTab] = useState("partners");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<OEMPartner | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockPartners: OEMPartner[] = [
    {
      name: "TechnoSolutions Ltd",
      type: "Technology Partner",
      status: "Active",
      contactPerson: "John Smith",
      email: "john@technosolutions.com",
      phone: "+1-555-0123",
      address: "123 Tech Park, Silicon Valley, CA",
      website: "https://technosolutions.com",
      description: "Leading provider of enterprise software solutions",
      specialization: "Cloud Infrastructure, AI/ML Solutions",
      certifications: "ISO 9001, SOC 2 Type II",
      tierLevel: "Tier 1",
      contractValue: 2500000,
      contractStartDate: "2024-01-01",
      contractEndDate: "2026-12-31",
    },
    {
      name: "GlobalManufacturing Corp",
      type: "Manufacturing Partner",
      status: "Active",
      contactPerson: "Sarah Johnson",
      email: "sarah@globalmanuf.com",
      phone: "+1-555-0456",
      address: "456 Industrial Blvd, Detroit, MI",
      website: "https://globalmanuf.com",
      description: "Industrial manufacturing and assembly services",
      specialization: "Precision Manufacturing, Quality Control",
      certifications: "ISO 14001, AS9100",
      tierLevel: "Tier 2",
      contractValue: 1800000,
      contractStartDate: "2024-03-01",
      contractEndDate: "2025-02-28",
    },
    {
      name: "LogisticsPro Services",
      type: "Logistics Partner",
      status: "Under Review",
      contactPerson: "Mike Chen",
      email: "mike@logisticspro.com",
      phone: "+1-555-0789",
      address: "789 Warehouse District, Houston, TX",
      website: "https://logisticspro.com",
      description: "Comprehensive logistics and supply chain management",
      specialization: "Global Shipping, Warehouse Management",
      certifications: "C-TPAT, IATA",
      tierLevel: "Tier 3",
      contractValue: 950000,
      contractStartDate: "2024-06-01",
      contractEndDate: "2025-05-31",
    },
  ];

  const mockProducts: Product[] = [
    {
      name: "Enterprise Cloud Platform",
      category: "Software",
      partnerId: 1,
      sku: "ECP-2024-001",
      description: "Scalable cloud infrastructure platform",
      specifications: "Multi-region deployment, 99.9% uptime SLA",
      price: 15000,
      availability: "Available",
      minOrderQuantity: 1,
      leadTime: "2-4 weeks",
      warranty: "3 years",
      certifications: "FedRAMP, SOC 2",
    },
    {
      name: "Industrial Control Module",
      category: "Hardware",
      partnerId: 2,
      sku: "ICM-2024-002",
      description: "Advanced industrial automation controller",
      specifications: "24V DC, IP65 rated, modular design",
      price: 850,
      availability: "Limited Stock",
      minOrderQuantity: 10,
      leadTime: "6-8 weeks",
      warranty: "2 years",
      certifications: "UL Listed, CE Marked",
    },
    {
      name: "Global Shipping Service",
      category: "Service",
      partnerId: 3,
      sku: "GSS-2024-003",
      description: "International freight and logistics service",
      specifications: "Door-to-door delivery, real-time tracking",
      price: 2500,
      availability: "Available",
      minOrderQuantity: 1,
      leadTime: "1-2 weeks",
      warranty: "Service guarantee",
      certifications: "ISO 28000",
    },
  ];

  // Fetch OEM partners
  const { data: partners = mockPartners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/oem-partners"],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockPartners;
    },
  });

  // Fetch products
  const { data: products = mockProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/oem-products"],
    queryFn: async () => {
      // Return mock data for now - in production this would fetch from API
      return mockProducts;
    },
  });

  // Partner form
  const partnerForm = useForm<OEMPartner>({
    resolver: zodResolver(oemPartnerSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "Active",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      description: "",
      specialization: "",
      certifications: "",
      tierLevel: "Tier 3",
      contractValue: 0,
      contractStartDate: "",
      contractEndDate: "",
    },
  });

  // Product form
  const productForm = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      partnerId: 0,
      sku: "",
      description: "",
      specifications: "",
      price: 0,
      availability: "Available",
      minOrderQuantity: 1,
      leadTime: "",
      warranty: "",
      certifications: "",
    },
  });

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: OEMPartner) => {
      // In production, this would make an API call
      console.log("Creating partner:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oem-partners"] });
      setIsPartnerDialogOpen(false);
      partnerForm.reset();
      toast({ title: "Success", description: "Partner created successfully" });
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: Product) => {
      // In production, this would make an API call
      console.log("Creating product:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oem-products"] });
      setIsProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Success", description: "Product created successfully" });
    },
  });

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || partner.status === filterStatus;
    const matchesTier = filterTier === "all" || partner.tierLevel === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  // Calculate statistics
  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === "Active").length,
    totalProducts: products.length,
    totalContractValue: partners.reduce((sum, p) => sum + p.contractValue, 0),
    avgContractValue: partners.length > 0 ? partners.reduce((sum, p) => sum + p.contractValue, 0) / partners.length : 0,
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Active": "default",
      "Under Review": "secondary",
      "Inactive": "destructive",
      "Pending": "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      "Tier 1": "bg-yellow-100 text-yellow-800",
      "Tier 2": "bg-blue-100 text-blue-800", 
      "Tier 3": "bg-green-100 text-green-800",
    } as const;
    return <Badge className={colors[tier as keyof typeof colors] || ""}>{tier}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Building2 className="h-8 w-8 mr-3" />
            OEM Management
          </h1>
          <p className="text-muted-foreground">
            Manage OEM partners, products, and supplier relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePartners} active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across all partner categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalContractValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total active contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Contract</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgContractValue)}</div>
            <p className="text-xs text-muted-foreground">
              Average per partner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>OEM Partners</CardTitle>
                  <CardDescription>Manage your OEM partnership network</CardDescription>
                </div>
                <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Partner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPartner ? "Edit Partner" : "Add New Partner"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPartner ? "Update partner information" : "Create a new OEM partnership"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...partnerForm}>
                      <form onSubmit={partnerForm.handleSubmit((data) => createPartnerMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={partnerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Partner Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter partner name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Partner Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select partner type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Technology Partner">Technology Partner</SelectItem>
                                    <SelectItem value="Manufacturing Partner">Manufacturing Partner</SelectItem>
                                    <SelectItem value="Logistics Partner">Logistics Partner</SelectItem>
                                    <SelectItem value="Service Provider">Service Provider</SelectItem>
                                    <SelectItem value="Reseller">Reseller</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="contactPerson"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Person</FormLabel>
                                <FormControl>
                                  <Input placeholder="Primary contact name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="contact@partner.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1-555-0123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://partner.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={partnerForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Full business address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={partnerForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="tierLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tier Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Tier 1">Tier 1 - Strategic</SelectItem>
                                    <SelectItem value="Tier 2">Tier 2 - Preferred</SelectItem>
                                    <SelectItem value="Tier 3">Tier 3 - Standard</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="contractValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contract Value ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={partnerForm.control}
                            name="contractStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contract Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={partnerForm.control}
                            name="contractEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contract End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={partnerForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Partner description and capabilities" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialization</FormLabel>
                              <FormControl>
                                <Input placeholder="Key areas of expertise" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={partnerForm.control}
                          name="certifications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certifications</FormLabel>
                              <FormControl>
                                <Input placeholder="ISO, industry certifications" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsPartnerDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createPartnerMutation.isPending}>
                            {createPartnerMutation.isPending ? "Creating..." : "Create Partner"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Partners Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Contract Value</TableHead>
                      <TableHead>Contract Period</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{partner.name}</div>
                            <div className="text-sm text-muted-foreground">{partner.specialization}</div>
                          </div>
                        </TableCell>
                        <TableCell>{partner.type}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.contactPerson}</div>
                            <div className="text-sm text-muted-foreground">{partner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(partner.status)}</TableCell>
                        <TableCell>{getTierBadge(partner.tierLevel)}</TableCell>
                        <TableCell>{formatCurrency(partner.contractValue)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(partner.contractStartDate), "MMM dd, yyyy")}</div>
                            <div className="text-muted-foreground">to {format(new Date(partner.contractEndDate), "MMM dd, yyyy")}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Partner Products</CardTitle>
                  <CardDescription>Manage products and services from OEM partners</CardDescription>
                </div>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Add a product or service from your OEM partners
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit((data) => createProductMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input placeholder="Product SKU/Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Software">Software</SelectItem>
                                    <SelectItem value="Hardware">Hardware</SelectItem>
                                    <SelectItem value="Service">Service</SelectItem>
                                    <SelectItem value="Component">Component</SelectItem>
                                    <SelectItem value="Solution">Solution</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="partnerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Partner</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select partner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {partners.map((partner, index) => (
                                      <SelectItem key={index} value={(index + 1).toString()}>
                                        {partner.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="availability"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Availability</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Limited Stock">Limited Stock</SelectItem>
                                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="minOrderQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Order Qty</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="1" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="leadTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lead Time</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2-4 weeks" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Product description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="specifications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specifications</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Technical specifications" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="warranty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warranty</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2 years" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="certifications"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certifications</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., CE, FCC, ISO" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsProductDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createProductMutation.isPending}>
                            {createProductMutation.isPending ? "Creating..." : "Create Product"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {partners.find((p, i) => i + 1 === product.partnerId)?.name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {product.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </div>
                        <Badge 
                          variant={product.availability === "Available" ? "default" : 
                                   product.availability === "Limited Stock" ? "secondary" : "destructive"}
                        >
                          {product.availability}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">SKU</div>
                          <div className="font-medium">{product.sku}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Lead Time</div>
                          <div className="font-medium">{product.leadTime}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Min Qty</div>
                          <div className="font-medium">{product.minOrderQuantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Warranty</div>
                          <div className="font-medium">{product.warranty}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
              <CardDescription>Monitor and manage partner contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Partner</TableHead>
                          <TableHead>Contract Value</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners.map((partner, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{formatCurrency(partner.contractValue)}</TableCell>
                            <TableCell>{format(new Date(partner.contractStartDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>{format(new Date(partner.contractEndDate), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant={new Date(partner.contractEndDate) < new Date() ? "destructive" : "default"}>
                                {new Date(partner.contractEndDate) < new Date() ? "Expired" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Contract Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>3 contracts expiring in 90 days</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>12 contracts up to date</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>2 contracts under review</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Review
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Contracts
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Distribution</CardTitle>
                <CardDescription>Partners by type and tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Technology Partner", "Manufacturing Partner", "Logistics Partner"].map((type) => {
                    const count = partners.filter(p => p.type === type).length;
                    const percentage = (count / partners.length) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span>{count} partners</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-muted-foreground">On-time Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4.8</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-muted-foreground">Active Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <div className="text-sm text-muted-foreground">New Products</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest partner and product updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New partner onboarded", partner: "TechnoSolutions Ltd", time: "2 hours ago", type: "success" },
                  { action: "Contract renewed", partner: "GlobalManufacturing Corp", time: "1 day ago", type: "info" },
                  { action: "Product catalog updated", partner: "LogisticsPro Services", time: "3 days ago", type: "warning" },
                  { action: "Performance review completed", partner: "TechnoSolutions Ltd", time: "1 week ago", type: "success" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "success" && "bg-green-500",
                      activity.type === "info" && "bg-blue-500",
                      activity.type === "warning" && "bg-yellow-500"
                    )} />
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">{activity.partner}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}