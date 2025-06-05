import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Filter, Download } from "lucide-react";
import { Tender } from "@shared/schema";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";

interface TenderTableProps {
  tenders: Tender[];
  onEdit?: (tender: Tender) => void;
  onDelete?: (tenderId: number) => void;
  onView?: (tender: Tender) => void;
}

export default function TenderTable({ tenders, onEdit, onDelete, onView }: TenderTableProps) {
  const [selectedTenders, setSelectedTenders] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTenders = tenders.filter((tender) => {
    const matchesStatus = statusFilter === "all" || tender.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || tender.category === categoryFilter;
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tender.category && tender.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(tenders.map(t => t.category).filter(cat => cat && cat.trim() !== "")));
  const statuses = ["draft", "published", "in_progress", "closed", "awarded"];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenders(filteredTenders.map(t => t.id));
    } else {
      setSelectedTenders([]);
    }
  };

  const handleSelectTender = (tenderId: number, checked: boolean) => {
    if (checked) {
      setSelectedTenders([...selectedTenders, tenderId]);
    } else {
      setSelectedTenders(selectedTenders.filter(id => id !== tenderId));
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      {/* Filters and Actions */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
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
            
            <Input
              type="text"
              placeholder="Search tenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTenders.length === filteredTenders.length && filteredTenders.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Tender Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No tenders found
                </TableCell>
              </TableRow>
            ) : (
              filteredTenders.map((tender) => (
                <TableRow key={tender.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedTenders.includes(tender.id)}
                      onCheckedChange={(checked) => handleSelectTender(tender.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{tender.title}</div>
                      <div className="text-sm text-muted-foreground">REF: {tender.reference}</div>
                      <div className="text-sm text-muted-foreground">{tender.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`status-badge status-${tender.status}`}>
                      {getStatusLabel(tender.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {tender.estimatedValue ? formatCurrency(tender.estimatedValue) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatDate(tender.submissionDeadline)}
                  </TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(tender)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(tender)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(tender.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTenders.length} of {tenders.length} results
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
