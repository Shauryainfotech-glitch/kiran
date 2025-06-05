import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DynamicField } from './dynamic-field';
import { Settings, Plus, Save, Eye, Grid, List } from 'lucide-react';
import { GEM_BID_FIELD_CONFIGS, FIELD_CATEGORIES, type FieldConfiguration } from '@shared/field-types';

interface FieldConfigurationManagerProps {
  onSave?: (fields: FieldConfiguration[]) => void;
  initialFields?: FieldConfiguration[];
  mode?: 'create' | 'edit' | 'preview';
}

export function FieldConfigurationManager({ 
  onSave, 
  initialFields = [], 
  mode = 'create' 
}: FieldConfigurationManagerProps) {
  const [selectedFields, setSelectedFields] = useState<FieldConfiguration[]>(initialFields);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const availableFields = Object.values(GEM_BID_FIELD_CONFIGS);
  
  const filteredFields = availableFields.filter(field => {
    const matchesCategory = activeCategory === 'all' || field.category === activeCategory;
    const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedByCategory = selectedFields.reduce((acc, field) => {
    const category = field.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, FieldConfiguration[]>);

  const handleFieldSelect = (field: FieldConfiguration) => {
    if (!selectedFields.find(f => f.name === field.name)) {
      setSelectedFields(prev => [...prev, field]);
    }
  };

  const handleFieldRemove = (fieldName: string) => {
    setSelectedFields(prev => prev.filter(f => f.name !== fieldName));
  };

  const handlePreviewDataChange = (fieldName: string, value: any) => {
    setPreviewData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = () => {
    onSave?.(selectedFields);
  };

  if (mode === 'preview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Form Preview</h3>
          <Badge variant="outline">{selectedFields.length} fields</Badge>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([category, fields]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {FIELD_CATEGORIES[category] || category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map(field => (
                    <DynamicField
                      key={field.name}
                      config={field}
                      value={previewData[field.name]}
                      onChange={(value) => handlePreviewDataChange(field.name, value)}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Field Library */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Field Library
            </CardTitle>
            <div className="space-y-3">
              <Input
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(FIELD_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] p-4">
              <div className={viewMode === 'grid' ? 'space-y-2' : 'space-y-1'}>
                {filteredFields.map(field => (
                  <div
                    key={field.name}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedFields.find(f => f.name === field.name) ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleFieldSelect(field)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{field.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{field.type}</div>
                        {viewMode === 'grid' && field.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {field.description}
                          </div>
                        )}
                      </div>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Fields Configuration */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selected Fields ({selectedFields.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-3 w-3 mr-1" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[650px] p-4">
              {selectedFields.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No fields selected</p>
                  <p className="text-sm">Choose fields from the library to get started</p>
                </div>
              ) : (
                <Tabs defaultValue="by-category">
                  <TabsList className="mb-4">
                    <TabsTrigger value="by-category">By Category</TabsTrigger>
                    <TabsTrigger value="all-fields">All Fields</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="by-category" className="space-y-4">
                    {Object.entries(groupedByCategory).map(([category, fields]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {FIELD_CATEGORIES[category] || category}
                            </CardTitle>
                            <Badge variant="secondary">{fields.length}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {fields.map(field => (
                            <div key={field.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{field.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{field.type}</div>
                                {field.required && (
                                  <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFieldRemove(field.name)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="all-fields" className="space-y-3">
                    {selectedFields.map((field, index) => (
                      <div key={field.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{field.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{field.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {FIELD_CATEGORIES[field.category || 'other']}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFieldRemove(field.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}