import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Scan, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TenderForm {
  title: string;
  description: string;
  category: string;
  estimatedValue: string;
  submissionDeadline: string;
  technicalRequirements: string;
  eligibilityCriteria: string;
  contactEmail: string;
  location: string;
  duration: string;
}

interface OCRResult {
  extractedData: Partial<TenderForm>;
  confidence: number;
  documentType: string;
  processing: boolean;
  completed: boolean;
}

export default function TenderCreation() {
  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState<TenderForm>({
    title: "",
    description: "",
    category: "",
    estimatedValue: "",
    submissionDeadline: "",
    technicalRequirements: "",
    eligibilityCriteria: "",
    contactEmail: "",
    location: "",
    duration: ""
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult>({
    extractedData: {},
    confidence: 0,
    documentType: "",
    processing: false,
    completed: false
  });

  const handleInputChange = (field: keyof TenderForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setOcrResult({
      extractedData: {},
      confidence: 0,
      documentType: "",
      processing: true,
      completed: false
    });

    // Simulate OCR processing
    setTimeout(() => {
      const mockExtractedData: Partial<TenderForm> = {
        title: "Infrastructure Development Project - Phase 2",
        description: "Comprehensive infrastructure development including road construction, utility installation, and landscaping for the new commercial district.",
        category: "infrastructure",
        estimatedValue: "2500000",
        submissionDeadline: "2024-08-15",
        technicalRequirements: "Must have experience in large-scale infrastructure projects, minimum 5 years in construction industry, certified equipment and materials.",
        eligibilityCriteria: "Registered construction company with minimum annual turnover of ₹1 crore, valid contractor license, experience certificates.",
        contactEmail: "procurement@citydev.gov.in",
        location: "Mumbai, Maharashtra",
        duration: "18 months"
      };

      setOcrResult({
        extractedData: mockExtractedData,
        confidence: 92,
        documentType: "Tender Notice",
        processing: false,
        completed: true
      });

      // Auto-fill form with extracted data
      setFormData(prev => ({ ...prev, ...mockExtractedData }));
    }, 3000);
  };

  const applyExtractedData = () => {
    setFormData(prev => ({ ...prev, ...ocrResult.extractedData }));
  };

  const submitTender = async () => {
    try {
      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Tender created successfully!');
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          estimatedValue: "",
          submissionDeadline: "",
          technicalRequirements: "",
          eligibilityCriteria: "",
          contactEmail: "",
          location: "",
          duration: ""
        });
      }
    } catch (error) {
      alert('Failed to create tender');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Plus className="h-8 w-8 mr-3" />
            Create New Tender
          </h1>
          <p className="text-muted-foreground mt-2">
            Create tenders manually or use OCR to extract data from documents
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center space-x-2">
            <Scan className="h-4 w-4" />
            <span>OCR Document Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Tender Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tender Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter tender title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                    placeholder="Enter estimated value"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                  <Input
                    id="submissionDeadline"
                    type="date"
                    value={formData.submissionDeadline}
                    onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter project location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Project Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 12 months"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter detailed tender description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalRequirements">Technical Requirements</Label>
                <Textarea
                  id="technicalRequirements"
                  value={formData.technicalRequirements}
                  onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                  placeholder="Enter technical requirements and specifications"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
                  placeholder="Enter eligibility criteria for bidders"
                  rows={3}
                />
              </div>

              <Button onClick={submitTender} className="w-full">
                Create Tender
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OCR Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Upload Tender Document</p>
                    <p className="text-muted-foreground">
                      Upload a PDF, image, or document file to extract tender information automatically
                    </p>
                  </div>
                  <div className="mt-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Select File
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {ocrResult.processing && <Badge variant="secondary">Processing...</Badge>}
                    {ocrResult.completed && <Badge variant="default">Completed</Badge>}
                  </div>

                  {ocrResult.processing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing document...</span>
                        <span>Extracting data</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                  )}

                  {ocrResult.completed && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Document processed successfully! Confidence: {ocrResult.confidence}%
                          <br />
                          Document Type: {ocrResult.documentType}
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Extracted Data Preview</h3>
                          <Button onClick={applyExtractedData} variant="outline">
                            Apply All Data
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          {Object.entries(ocrResult.extractedData).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground uppercase">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              <p className="text-sm font-medium truncate" title={String(value)}>
                                {String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form fields (same as manual tab) */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ocr-title">Tender Title</Label>
                    <Input
                      id="ocr-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter tender title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ocr-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-estimatedValue">Estimated Value (₹)</Label>
                    <Input
                      id="ocr-estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                      placeholder="Enter estimated value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-submissionDeadline">Submission Deadline</Label>
                    <Input
                      id="ocr-submissionDeadline"
                      type="date"
                      value={formData.submissionDeadline}
                      onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-location">Location</Label>
                    <Input
                      id="ocr-location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter project location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-duration">Project Duration</Label>
                    <Input
                      id="ocr-duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 12 months"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-contactEmail">Contact Email</Label>
                    <Input
                      id="ocr-contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="Enter contact email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocr-description">Description</Label>
                  <Textarea
                    id="ocr-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed tender description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocr-technicalRequirements">Technical Requirements</Label>
                  <Textarea
                    id="ocr-technicalRequirements"
                    value={formData.technicalRequirements}
                    onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                    placeholder="Enter technical requirements and specifications"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocr-eligibilityCriteria">Eligibility Criteria</Label>
                  <Textarea
                    id="ocr-eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
                    placeholder="Enter eligibility criteria for bidders"
                    rows={3}
                  />
                </div>

                <Button onClick={submitTender} className="w-full">
                  Create Tender
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}