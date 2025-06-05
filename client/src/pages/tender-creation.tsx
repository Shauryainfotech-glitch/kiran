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
  reference: string;
  description: string;
  category: string;
  estimatedValue: string;
  submissionDeadline: string;
  location: string;
  department: string;
  organizationName: string;
  documentFees: string;
  emdValue: string;
  ownership: string;
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
    reference: "",
    description: "",
    category: "",
    estimatedValue: "",
    submissionDeadline: "",
    location: "",
    department: "",
    organizationName: "",
    documentFees: "",
    emdValue: "",
    ownership: ""
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

  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setOcrResult({
      extractedData: {},
      confidence: 0,
      documentType: "",
      processing: true,
      completed: false
    });

    try {
      // Convert file to text for Claude analysis
      const reader = new FileReader();
      reader.onload = async (e) => {
        const documentText = e.target?.result as string;
        
        try {
          const response = await fetch('/api/ai/claude/analyze-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentText })
          });

          if (response.ok) {
            const analysis = await response.json();
            
            // Map Claude analysis to form fields
            const extractedData: Partial<TenderForm> = {
              title: analysis.extractedFields?.title || "",
              reference: analysis.extractedFields?.reference || `TND-${Date.now()}`,
              description: analysis.extractedFields?.description || "",
              category: analysis.extractedFields?.category || "",
              estimatedValue: analysis.extractedFields?.estimatedValue || "",
              submissionDeadline: analysis.extractedFields?.deadline || "",
              location: analysis.extractedFields?.location || "",
              department: analysis.extractedFields?.department || "",
              organizationName: analysis.extractedFields?.organizationName || "",
              documentFees: analysis.extractedFields?.documentFees || "",
              emdValue: analysis.extractedFields?.emdValue || "",
              ownership: analysis.extractedFields?.ownership || ""
            };

            setOcrResult({
              extractedData,
              confidence: analysis.complianceScore || 85,
              documentType: analysis.documentType || "Tender Document",
              processing: false,
              completed: true
            });

            // Auto-fill form with extracted data
            setFormData(prev => ({ ...prev, ...extractedData }));
          } else {
            throw new Error('OCR analysis failed');
          }
        } catch (error) {
          console.error('Document analysis error:', error);
          // Fallback to basic file processing
          setOcrResult({
            extractedData: {
              title: file.name.replace(/\.[^/.]+$/, ""),
              reference: `TND-${Date.now()}`,
              description: "Document uploaded successfully - please fill in the details manually"
            },
            confidence: 0,
            documentType: "Unknown",
            processing: false,
            completed: true
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('File processing error:', error);
      setOcrResult({
        extractedData: {},
        confidence: 0,
        documentType: "",
        processing: false,
        completed: false
      });
    }
  };

  const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
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
          reference: "",
          description: "",
          category: "",
          estimatedValue: "",
          submissionDeadline: "",
          location: "",
          department: "",
          organizationName: "",
          documentFees: "",
          emdValue: "",
          ownership: ""
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
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="e.g., TND-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department name"
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
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="space-y-4">
                  <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="text-lg font-medium">
                      {dragActive ? 'Drop file here' : 'Upload Tender Document'}
                    </h3>
                    <p className="text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, DOC, DOCX, JPG, PNG files up to 50MB
                    </p>
                  </div>
                  <div className="mt-4">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleInputFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" className="pointer-events-none">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
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