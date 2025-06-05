import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Upload, Calendar as CalendarIcon, Clock, FileText, Image, Table, Shield, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { FieldConfiguration, FieldType } from '@shared/field-types';

interface DynamicFieldProps {
  config: FieldConfiguration;
  value?: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export function DynamicField({ config, value, onChange, error, disabled }: DynamicFieldProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<Date>();

  const renderField = () => {
    switch (config.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
            rows={4}
          />
        );

      case 'dropdown':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={config.placeholder || `Select ${config.name}`} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'numeric':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={config.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              placeholder={config.placeholder}
              disabled={disabled}
              className={cn('pl-8', error ? 'border-red-500' : '')}
            />
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  error && 'border-red-500'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'datetime':
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !value && 'text-muted-foreground',
                    error && 'border-red-500'
                  )}
                  disabled={disabled}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PPP p') : <span>Pick date and time</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => onChange(date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor={`file-${config.name}`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload {config.name}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {config.description}
                  </span>
                </Label>
                <Input
                  id={`file-${config.name}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file.name);
                      setFiles([file]);
                    }
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
            {value && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                {value}
              </Badge>
            )}
          </div>
        );

      case 'multifile':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor={`multifile-${config.name}`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload Multiple Files
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {config.description}
                  </span>
                </Label>
                <Input
                  id={`multifile-${config.name}`}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const fileList = Array.from(e.target.files || []);
                    if (fileList.length > 0) {
                      onChange(fileList.map(f => f.name));
                      setFiles(fileList);
                    }
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.map((fileName: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {fileName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor={`image-${config.name}`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload Image
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {config.description}
                  </span>
                </Label>
                <Input
                  id={`image-${config.name}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file.name);
                      setFiles([file]);
                    }
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
            {value && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Image className="h-3 w-3" />
                {value}
              </Badge>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${config.name}`}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={`checkbox-${config.name}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {config.description || config.name}
            </Label>
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-6 w-6 cursor-pointer transition-colors',
                  star <= (value || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
                onClick={() => !disabled && onChange(star)}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {value ? `${value}/5` : 'No rating'}
            </span>
          </div>
        );

      case 'autonumber':
        return (
          <Input
            type="text"
            value={value || 'AUTO-GENERATED'}
            disabled={true}
            className="bg-gray-50 text-gray-500"
          />
        );

      case 'verification':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Digital Signature Verification</span>
              </div>
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            {!value && (
              <Button
                onClick={() => onChange(true)}
                disabled={disabled}
                variant="outline"
                size="sm"
              >
                Verify Now
              </Button>
            )}
          </div>
        );

      case 'lookup':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Search ${config.name}...`}
              disabled={disabled}
              className={cn('pl-10', error ? 'border-red-500' : '')}
            />
          </div>
        );

      case 'table':
        return (
          <div className="space-y-2">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Table className="h-4 w-4" />
                <span className="text-sm font-medium">Table Input</span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {config.description}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange('table-data-placeholder')}
                disabled={disabled}
              >
                Open Table Editor
              </Button>
            </div>
          </div>
        );

      case 'structured':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Structured Data Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Name" />
              <Input placeholder="Address Line 1" />
              <Input placeholder="Address Line 2" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City" />
                <Input placeholder="Pincode" />
              </div>
              <Input placeholder="Contact Number" />
              <Input placeholder="Email" />
            </CardContent>
          </Card>
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.start ? format(new Date(value.start), 'PP') : <span>Start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.start ? new Date(value.start) : undefined}
                    onSelect={(date) => onChange({ ...value, start: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs text-gray-500">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.end ? format(new Date(value.end), 'PP') : <span>End date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.end ? new Date(value.end) : undefined}
                    onSelect={(date) => onChange({ ...value, end: date?.toISOString() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={config.name} className="text-sm font-medium">
        {config.name}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {config.description && !['checkbox', 'verification'].includes(config.type) && (
        <p className="text-xs text-gray-500">{config.description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}