import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  Upload, 
  FileText, 
  Calendar, 
  DollarSign, 
  Building, 
  Tag, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Star,
  MessageSquare,
  MoreHorizontal,
  Expand,
  Grid,
  List,
  ArrowUpDown,
  History,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter as FilterIcon,
  SortAsc,
  Settings,
  Bookmark,
  Bell,
  X,
  ChevronDown,
  ChevronUp
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import GemBidStages from '@/components/gem-bid/gem-bid-stages';

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
  currentStage?: number;
}

// Zod schema for form validation
const gemBidSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  organization: z.string().min(1, 'Organization is required'),
  category: z.string().min(1, 'Category is required'),
  estimatedValue: z.coerce.number().min(0, 'Value must be positive'),
  deadline: z.string().min(1, 'Deadline is required'),
  location: z.string().min(1, 'Location is required'),
  requirements: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).default([])
});

type GemBidFormData = z.infer<typeof gemBidSchema>;

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-purple-100 text-purple-800',
  closed: 'bg-red-100 text-red-800',
  awarded: 'bg-green-100 text-green-800'
};

export default function GemBid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'compact'>('card');
  const [sortBy, setSortBy] = useState<'title' | 'deadline' | 'value' | 'priority'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBids, setSelectedBids] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState<GemBid | null>(null);
  const [editingBid, setEditingBid] = useState<GemBid | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  const [stageViewMode, setStageViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban');

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      requirements: [],
      documents: [],
      priority: 'medium',
      tags: []
    }
  });

  // Fetch GEM bids
  const { data: gemBids = [], isLoading } = useQuery({
    queryKey: ['/api/gem-bids'],
    select: (data: any) => data || []
  });

  // Create GEM bid mutation
  const createGemBidMutation = useMutation({
    mutationFn: async (data: GemBidFormData) => {
      return await apiRequest('/api/gem-bids', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gem-bids'] });
      setShowCreateDialog(false);
      form.reset();
      toast({ title: 'Success', description: 'GEM bid created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create GEM bid', variant: 'destructive' });
    }
  });

  // OCR processing mutation
  const processOCRMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      return await apiRequest('/api/gem-bids/extract', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (data: any) => {
      if (data.extracted) {
        form.reset(data.extracted);
        setShowUploadDialog(false);
        setShowCreateDialog(true);
        toast({ title: 'Success', description: 'Document processed successfully' });
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to process document', variant: 'destructive' });
    }
  });

  const handleCreateGemBid = (formData: GemBidFormData) => {
    const finalData = {
      ...formData,
      requirements: requirements.filter(req => req.trim() !== ''),
      tags: tags.filter(tag => tag.trim() !== '')
    };
    createGemBidMutation.mutate(finalData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessDocument = () => {
    if (uploadedFile) {
      processOCRMutation.mutate(uploadedFile);
    }
  };

  const handleViewDetails = (bid: GemBid) => {
    setSelectedBid(bid);
    setShowDetailsDialog(true);
  };

  const handleEditBid = (bid: GemBid) => {
    setEditingBid(bid);
    form.reset(bid);
    setRequirements(bid.requirements || ['']);
    setTags(bid.tags || ['']);
    setShowCreateDialog(true);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleBidSelection = (bidId: number) => {
    setSelectedBids(prev => 
      prev.includes(bidId) 
        ? prev.filter(id => id !== bidId)
        : [...prev, bidId]
    );
  };

  const handleBulkAction = (action: string) => {
    toast({ title: 'Info', description: `Bulk ${action} action triggered for ${selectedBids.length} items` });
    setSelectedBids([]);
  };

  // Filter and sort logic
  const filteredAndSortedBids = React.useMemo(() => {
    let filtered = gemBids.filter((bid: GemBid) => {
      const matchesSearch = bid.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bid.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bid.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || bid.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || bid.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || bid.priority === selectedPriority;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });

    // Sort the filtered results
    filtered.sort((a: GemBid, b: GemBid) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'value':
          comparison = a.estimatedValue - b.estimatedValue;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [gemBids, searchTerm, selectedCategory, selectedStatus, selectedPriority, sortBy, sortOrder]);

  const renderBidCard = (bid: GemBid) => (
    <Card key={bid.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedBids.includes(bid.id)}
              onCheckedChange={() => toggleBidSelection(bid.id)}
            />
            <div>
              <CardTitle className="text-lg">{bid.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{bid.organization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[bid.priority]}>
              {bid.priority}
            </Badge>
            <Badge className={statusColors[bid.status]}>
              {bid.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(bid)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditBid(bid)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  Bookmark
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {bid.description}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>₹{bid.estimatedValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{new Date(bid.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-purple-600" />
            <span>{bid.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            <span>{bid.submissionCount} submissions</span>
          </div>
        </div>
        {bid.tags && bid.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {bid.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {bid.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{bid.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTableView = () => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">
              <Checkbox
                checked={selectedBids.length === filteredAndSortedBids.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBids(filteredAndSortedBids.map((bid: GemBid) => bid.id));
                  } else {
                    setSelectedBids([]);
                  }
                }}
              />
            </th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Organization</th>
            <th className="p-3 text-left">Value</th>
            <th className="p-3 text-left">Deadline</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Priority</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedBids.map((bid: GemBid) => (
            <tr key={bid.id} className="border-t hover:bg-muted/50">
              <td className="p-3">
                <Checkbox
                  checked={selectedBids.includes(bid.id)}
                  onCheckedChange={() => toggleBidSelection(bid.id)}
                />
              </td>
              <td className="p-3 font-medium">{bid.title}</td>
              <td className="p-3">{bid.organization}</td>
              <td className="p-3">₹{bid.estimatedValue.toLocaleString()}</td>
              <td className="p-3">{new Date(bid.deadline).toLocaleDateString()}</td>
              <td className="p-3">
                <Badge className={statusColors[bid.status]}>
                  {bid.status}
                </Badge>
              </td>
              <td className="p-3">
                <Badge className={priorityColors[bid.priority]}>
                  {bid.priority}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(bid)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditBid(bid)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GEM Bid Management</h1>
          <p className="text-muted-foreground">
            Manage and track Government e-Marketplace bids with 14-stage lifecycle
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Tender Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
                {uploadedFile && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{uploadedFile.name}</span>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleProcessDocument}
                  disabled={!uploadedFile || processOCRMutation.isPending}
                  className="w-full"
                >
                  {processOCRMutation.isPending ? 'Processing...' : 'Process Document'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Bid
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBid ? 'Edit GEM Bid' : 'Create New GEM Bid'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateGemBid)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
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
                          <Textarea 
                            placeholder="Enter bid description"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
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
                              <SelectItem value="construction">Construction</SelectItem>
                              <SelectItem value="it">IT Services</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="supplies">Supplies</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            />
                          </FormControl>
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
                  </div>

                  {/* Requirements Section */}
                  <div className="space-y-3">
                    <FormLabel>Requirements</FormLabel>
                    <div className="space-y-2">
                      {requirements.map((req: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={req}
                            onChange={(e) => {
                              const newReqs = [...requirements];
                              newReqs[index] = e.target.value;
                              setRequirements(newReqs);
                            }}
                            placeholder="Enter requirement"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          placeholder="Add new requirement"
                        />
                        <Button type="button" variant="outline" onClick={addRequirement}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-3">
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{tag}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => removeTag(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add new tag"
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateDialog(false);
                        setEditingBid(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createGemBidMutation.isPending}>
                      {createGemBidMutation.isPending ? 'Saving...' : (editingBid ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* GeM Bid Stages Demo */}
      <Card>
        <CardHeader>
          <CardTitle>14-Stage GeM Bid Lifecycle Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Experience the comprehensive bid management system with kanban, list, and timeline views
          </p>
        </CardHeader>
        <CardContent>
          <GemBidStages 
            gemBidId={1} 
            currentStage={3} 
            viewMode={stageViewMode} 
            onViewModeChange={setStageViewMode} 
          />
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bids..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedBids.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedBids.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                  >
                    Archive
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent className="space-y-4">
              <Separator />
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="it">IT Services</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedBids.length} of {gemBids.length} bids
          </p>
        </div>

        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedBids.map((bid: GemBid) => renderBidCard(bid))}
          </div>
        )}

        {viewMode === 'table' && renderTableView()}

        {filteredAndSortedBids.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No bids found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Create your first GEM bid to get started'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bid Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedBid.title}</div>
                    <div><strong>Organization:</strong> {selectedBid.organization}</div>
                    <div><strong>Category:</strong> {selectedBid.category}</div>
                    <div><strong>Location:</strong> {selectedBid.location}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Financial & Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Estimated Value:</strong> ₹{selectedBid.estimatedValue.toLocaleString()}</div>
                    <div><strong>Deadline:</strong> {new Date(selectedBid.deadline).toLocaleDateString()}</div>
                    <div><strong>Submissions:</strong> {selectedBid.submissionCount}</div>
                    <div><strong>Created:</strong> {new Date(selectedBid.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedBid.description}</p>
              </div>
              
              {selectedBid.requirements && selectedBid.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedBid.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedBid.documents && selectedBid.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedBid.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBid.tags && selectedBid.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBid.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}