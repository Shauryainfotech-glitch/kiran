import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DynamicField } from '@/components/forms/dynamic-field';
import { GEM_BID_FIELD_CONFIGS, FIELD_CATEGORIES, type FieldConfiguration } from '@shared/field-types';
import { CheckCircle, Clock, AlertTriangle, Save, Upload, FileText, Star, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StageFormProps {
  stageNumber: number;
  stageName: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  onSave: (data: any) => void;
  onStatusChange: (status: string) => void;
  initialData?: any;
}

// Stage-specific field mappings based on CSV data
const STAGE_FIELD_MAPPINGS: Record<number, string[]> = {
  1: ['keyword', 'category', 'buyerName', 'location', 'bidType', 'bidStatus', 'bidNo'],
  2: ['boqFile', 'eligibilityCriteria', 'emd', 'deliveryTerms', 'consigneeDetails'],
  3: ['queryText', 'attachment', 'submissionTime'],
  4: ['techSpecs', 'authorizationLetter', 'pan', 'gst', 'experienceProof', 'iso', 'brochures'],
  5: ['boqCompliance', 'specificationMatch', 'uploads', 'termsAcceptance', 'dsc'],
  6: ['unitRate', 'gstRate', 'boqFormatUpload', 'priceBreakup'],
  7: ['evaluationStatus', 'clarificationRequest', 'responseTime'],
  8: ['raWindowTime', 'startingPrice', 'decrementRange'],
  9: ['poNo', 'acceptanceClick', 'commitmentDate', 'acknowledgmentUpload'],
  10: ['deliveryChallan', 'grn', 'transportDetails', 'photoUpload'],
  11: ['inspectionStatus', 'inspectionComments'],
  12: ['invoiceNo', 'taxBreakup', 'poReference', 'invoiceUpload'],
  13: ['paymentStatus', 'utrNo', 'paymentDate'],
  14: ['rating', 'feedbackComments', 'reviewFiling']
};

const getStatusColor = (status: string) => {
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'pending':
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    case 'skipped':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export function StageForm({ 
  stageNumber, 
  stageName, 
  description, 
  status, 
  onSave, 
  onStatusChange,
  initialData = {} 
}: StageFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const stageFields = STAGE_FIELD_MAPPINGS[stageNumber] || [];
  const fieldConfigs = stageFields.map(fieldKey => GEM_BID_FIELD_CONFIGS[fieldKey]).filter(Boolean);

  // Group fields by category
  const groupedFields = fieldConfigs.reduce((acc, field) => {
    const category = field.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, FieldConfiguration[]>);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when field is updated
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fieldConfigs.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.name} is required`;
      }
      
      // Additional validation based on field type
      if (field.validation && formData[field.name]) {
        field.validation.forEach(rule => {
          if (rule.type === 'pattern' && rule.value) {
            const regex = new RegExp(rule.value);
            if (!regex.test(formData[field.name])) {
              newErrors[field.name] = rule.message || `Invalid ${field.name} format`;
            }
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast({
        title: "Stage Saved",
        description: `${stageName} data has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save stage data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    toast({
      title: "Status Updated",
      description: `Stage status changed to ${newStatus}`,
    });
  };

  const getCompletionPercentage = () => {
    const totalFields = fieldConfigs.length;
    const filledFields = fieldConfigs.filter(field => formData[field.name]).length;
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
              {stageNumber}
            </div>
            <div>
              <CardTitle className="text-lg">{stageName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(status)}>
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Completion Progress</span>
            <span>{Math.round(getCompletionPercentage())}%</span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Update Status:</span>
          <Button
            variant={status === 'in_progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('in_progress')}
          >
            Start
          </Button>
          <Button
            variant={status === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('completed')}
            disabled={getCompletionPercentage() < 100}
          >
            Complete
          </Button>
          <Button
            variant={status === 'skipped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('skipped')}
          >
            Skip
          </Button>
        </div>

        <Separator />

        {/* Dynamic Fields */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {Object.keys(groupedFields).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No fields configured for this stage</p>
              </div>
            ) : (
              Object.entries(groupedFields).map(([category, fields]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {FIELD_CATEGORIES[category] || category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map(field => (
                      <DynamicField
                        key={field.name}
                        config={field}
                        value={formData[field.name]}
                        onChange={(value) => handleFieldChange(field.name, value)}
                        error={errors[field.name]}
                        disabled={status === 'completed'}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {fieldConfigs.length} fields • {Object.keys(groupedFields).length} categories
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFormData(initialData)}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || status === 'completed'}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}