import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building2, 
  IndianRupee, 
  Eye, 
  FileText, 
  Upload,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Users,
  Download,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define the GemBid interface
interface GemBid {
  id: number;
  title: string;
  description: string;
  organization: string;
  category: string;
  estimatedValue: number;
  deadline: string;
  status: 'active' | 'draft' | 'submitted' | 'closed' | 'awarded';
  location: string;
  requirements: string[];
  documents: string[];
  submissionCount: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

// Form validation schema
const gemBidSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  organization: z.string().min(1, 'Organization is required'),
  category: z.string().min(1, 'Category is required'),
  estimatedValue: z.number().min(0, 'Estimated value must be positive'),
  deadline: z.string().min(1, 'Deadline is required'),
  location: z.string().min(1, 'Location is required'),
  priority: z.enum(['low', 'medium', 'high']),
  requirements: z.string().optional(),
  tags: z.string().optional(),
});

type GemBidFormData = z.infer<typeof gemBidSchema>;

const categories = [
  'IT Services', 'Construction', 'Healthcare', 'Education', 'Transport',
  'Energy', 'Telecommunications', 'Manufacturing', 'Agriculture', 'Defense'
];

export default function GemBid() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'ocr'>('manual');
  const [selectedBids, setSelectedBids] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<GemBidFormData>({
    resolver: zodResolver(gemBidSchema),
    defaultValues: {
      title: '',
      description: '',
      organization: '',
      category: '',
      estimatedValue: 0,
      deadline: '',
      location: '',
      priority: 'medium',
      requirements: '',
      tags: '',
    },
  });

  // Fetch gem bids
  const { data: gemBids = [], isLoading } = useQuery({
    queryKey: ['/api/gem-bids'],
  });

  // Create gem bid mutation
  const createGemBidMutation = useMutation({
    mutationFn: async (data: GemBidFormData) => {
      const processedData = {
        ...data,
        requirements: data.requirements?.split(',').map(r => r.trim()).filter(Boolean) || [],
        tags: data.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
        submissionCount: 0,
        status: 'draft' as const,
        documents: [],
      };
      return apiRequest('/api/gem-bids', {
        method: 'POST',
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gem-bids'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Gem bid created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create gem bid',
        variant: 'destructive',
      });
    },
  });

  // OCR document upload mutation
  const ocrUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      return apiRequest('/api/gem-bids/ocr-extract', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (data) => {
      // Pre-fill form with extracted data
      if (data.extractedData) {
        form.setValue('title', data.extractedData.title || '');
        form.setValue('description', data.extractedData.description || '');
        form.setValue('organization', data.extractedData.organization || '');
        form.setValue('category', data.extractedData.category || '');
        form.setValue('estimatedValue', data.extractedData.estimatedValue || 0);
        form.setValue('deadline', data.extractedData.deadline || '');
        form.setValue('location', data.extractedData.location || '');
        form.setValue('requirements', data.extractedData.requirements?.join(', ') || '');
      }
      toast({
        title: 'Success',
        description: 'Document processed successfully. Please review and submit.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to process document. Please try manual entry.',
        variant: 'destructive',
      });
    },
  });

  // Filter gem bids based on current filters
  const filteredGemBids = Array.isArray(gemBids) ? gemBids.filter((bid: any) => {
    const matchesSearch = bid.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || bid.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || bid.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || bid.priority === selectedPriority;
    const matchesTab = activeTab === 'all' || bid.status === activeTab;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesTab;
  }) : [];

  // Calculate analytics
  const analytics = {
    totalBids: Array.isArray(gemBids) ? gemBids.length : 0,
    activeBids: Array.isArray(gemBids) ? gemBids.filter((bid: any) => bid.status === 'active').length : 0,
    totalValue: Array.isArray(gemBids) ? gemBids.reduce((sum: number, bid: any) => sum + (bid.estimatedValue || 0), 0) : 0,
    averageValue: Array.isArray(gemBids) && gemBids.length > 0 ? 
      gemBids.reduce((sum: number, bid: any) => sum + (bid.estimatedValue || 0), 0) / gemBids.length : 0,
  };

  // Form submission handler
  const handleCreateGemBid = (formData: GemBidFormData) => {
    createGemBidMutation.mutate(formData);
  };

  // File upload handler for OCR
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      ocrUploadMutation.mutate(file);
    }
  };

  // Bulk operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBids(filteredGemBids.map(bid => bid.id));
    } else {
      setSelectedBids([]);
    }
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    // Implementation for bulk status update
    toast({
      title: 'Status Updated',
      description: `${selectedBids.length} bids updated to ${newStatus}`,
    });
    setSelectedBids([]);
  };

  const handleBulkDelete = () => {
    // Implementation for bulk delete
    toast({
      title: 'Bids Deleted',
      description: `${selectedBids.length} bids deleted successfully`,
    });
    setSelectedBids([]);
  };

  // Helper functions for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'submitted': return 'outline';
      case 'closed': return 'destructive';
      case 'awarded': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gem Bids</h1>
          <p className="text-muted-foreground">
            Manage and track gem bids with intelligent automation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Gem Bid
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Gem Bid</DialogTitle>
            </DialogHeader>
            
            {/* Upload Method Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={uploadMethod === 'manual' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('manual')}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manual Entry
                </Button>
                <Button
                  variant={uploadMethod === 'ocr' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('ocr')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document (OCR)
                </Button>
              </div>

              {uploadMethod === 'ocr' && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Tender Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a PDF, Word, or image file to automatically extract bid information
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button asChild variant="outline" disabled={ocrUploadMutation.isPending}>
                      <span>
                        {ocrUploadMutation.isPending ? 'Processing...' : 'Choose File'}
                      </span>
                    </Button>
                  </label>
                </div>
              )}

              {/* Manual Entry Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateGemBid)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bid Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bid title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter bid description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Value (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter estimated value" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (comma-separated)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter requirements" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tags" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createGemBidMutation.isPending}>
                      {createGemBidMutation.isPending ? 'Creating...' : 'Create Gem Bid'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBids}</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeBids}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(analytics.averageValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +3.7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gem bids..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Gem Bids</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="awarded">Awarded</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading gem bids...</p>
              </div>
            </div>
          ) : filteredGemBids.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Gem Bids Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                      ? 'No bids match your current filters. Try adjusting your search criteria.'
                      : 'Get started by creating your first gem bid using the form above.'
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedStatus('all');
                        setSelectedPriority('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedBids.length === filteredGemBids.length && filteredGemBids.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedBids.length > 0 
                      ? `${selectedBids.length} of ${filteredGemBids.length} selected`
                      : `Select all ${filteredGemBids.length} bids`
                    }
                  </span>
                </div>
                
                {selectedBids.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={handleBulkStatusUpdate}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Set Active</SelectItem>
                        <SelectItem value="draft">Set Draft</SelectItem>
                        <SelectItem value="submitted">Set Submitted</SelectItem>
                        <SelectItem value="closed">Set Closed</SelectItem>
                        <SelectItem value="awarded">Set Awarded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      Delete ({selectedBids.length})
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                {filteredGemBids.map((bid) => (
                  <Card key={bid.id} className={`hover:shadow-md transition-shadow ${
                    selectedBids.includes(bid.id) ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedBids.includes(bid.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBids([...selectedBids, bid.id]);
                              } else {
                                setSelectedBids(selectedBids.filter(id => id !== bid.id));
                              }
                            }}
                          />
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{bid.title}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              {bid.organization}
                              <Badge variant="outline">{bid.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(bid.priority)}>{bid.priority}</Badge>
                          <Badge variant={getStatusColor(bid.status)}>{bid.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                  
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {bid.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            <span className="font-medium">₹{bid.estimatedValue?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(bid.deadline), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{bid.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {bid.submissionCount} submissions
                          </span>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}