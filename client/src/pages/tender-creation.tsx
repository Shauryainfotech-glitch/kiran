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
import { createWorker } from 'tesseract.js';

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
    ownership: "central"
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

  const processDocumentFile = async (file: File) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    let extractedText = '';

    try {
      if (fileType.includes('image') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        // Use Tesseract.js for image OCR
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        extractedText = text;
      } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        // For PDF files, convert to FormData and send to server
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/documents/extract-pdf', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          extractedText = data.text;
        } else {
          throw new Error('PDF extraction failed');
        }
      } else if (fileType.includes('document') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // For Word documents, convert to FormData and send to server
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/documents/extract-word', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          extractedText = data.text;
        } else {
          throw new Error('Word document extraction failed');
        }
      } else {
        // Try reading as text for other file types
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            extractedText = reader.result as string;
            resolve(extractedText);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      // Use extracted text for analysis
      await analyzeExtractedText(extractedText);
      
    } catch (error) {
      console.error('Document processing error:', error);
      // Fallback with basic file info
      setOcrResult({
        extractedData: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          reference: `TND-${Date.now()}`,
          description: "Document uploaded - manual entry required"
        },
        confidence: 25,
        documentType: "Document",
        processing: false,
        completed: true
      });
    }
  };

  const analyzeExtractedText = async (text: string) => {
    try {
      // Try Claude AI analysis first
      const response = await fetch('/api/ai/claude/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: text })
      });

      if (response.ok) {
        const analysis = await response.json();
        
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

        setFormData(prev => ({ ...prev, ...extractedData }));
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      console.error('Document analysis error:', error);
      
      // Basic text analysis fallback
      const basicExtraction = extractBasicInfo(text);
      setOcrResult({
        extractedData: basicExtraction,
        confidence: 60,
        documentType: "Document",
        processing: false,
        completed: true
      });
      
      setFormData(prev => ({ ...prev, ...basicExtraction }));
    }
  };

  const extractBasicInfo = (text: string): Partial<TenderForm> => {
    const lines = text.split('\n').filter(line => line.trim());
    const extraction: Partial<TenderForm> = {
      reference: `TND-${Date.now()}`
    };

    // Basic pattern matching for common tender fields
    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (!extraction.title && (lower.includes('tender') || lower.includes('notice') || lower.includes('invitation'))) {
        extraction.title = line.trim();
      }
      
      if (lower.includes('deadline') || lower.includes('submission')) {
        const dateMatch = line.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/);
        if (dateMatch) {
          extraction.submissionDeadline = dateMatch[0];
        }
      }
      
      if (lower.includes('value') || lower.includes('amount') || lower.includes('cost')) {
        const valueMatch = line.match(/[\d,]+/);
        if (valueMatch) {
          extraction.estimatedValue = valueMatch[0].replace(/,/g, '');
        }
      }
      
      if (lower.includes('location') || lower.includes('place') || lower.includes('address')) {
        extraction.location = line.trim();
      }
    }

    extraction.description = text.substring(0, 500) + (text.length > 500 ? '...' : '');
    
    return extraction;
  };

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
      // Process file based on type
      await processDocumentFile(file);
    } catch (error) {
      console.error('File processing error:', error);
      setOcrResult({
        extractedData: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          reference: `TND-${Date.now()}`,
          description: "Document uploaded - please verify extracted information"
        },
        confidence: 50,
        documentType: "Document",
        processing: false,
        completed: true
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
      // Generate reference if not provided
      const reference = formData.reference || `TND-${Date.now()}`;
      
      // Format data for database
      const tenderData = {
        title: formData.title,
        reference: reference,
        description: formData.description || null,
        category: formData.category,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        submissionDeadline: formData.submissionDeadline ? new Date(formData.submissionDeadline) : new Date(),
        location: formData.location || null,
        department: formData.department || null,
        organizationName: formData.organizationName || null,
        documentFees: formData.documentFees ? parseFloat(formData.documentFees) : null,
        emdValue: formData.emdValue ? parseFloat(formData.emdValue) : null,
        ownership: formData.ownership || null
      };

      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenderData)
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
        setUploadedFile(null);
        setOcrResult({
          extractedData: {},
          confidence: 0,
          documentType: "",
          processing: false,
          completed: false
        });
      } else {
        const errorData = await response.json();
        console.error('Tender creation error:', errorData);
        alert(`Failed to create tender: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Tender submission error:', error);
      alert('Failed to create tender: Network error');
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership">Ownership</Label>
                  <Select value={formData.ownership} onValueChange={(value) => handleInputChange('ownership', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central">Central Government</SelectItem>
                      <SelectItem value="state">State Government</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentFees">Document Fees (₹)</Label>
                  <Input
                    id="documentFees"
                    type="number"
                    value={formData.documentFees}
                    onChange={(e) => handleInputChange('documentFees', e.target.value)}
                    placeholder="Enter document fees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emdValue">EMD Value (₹)</Label>
                  <Input
                    id="emdValue"
                    type="number"
                    value={formData.emdValue}
                    onChange={(e) => handleInputChange('emdValue', e.target.value)}
                    placeholder="Enter EMD value"
                  />
                </div>
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
                    <Label htmlFor="ocr-reference">Reference Number</Label>
                    <Input
                      id="ocr-reference"
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      placeholder="e.g., TND-2024-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-department">Department</Label>
                    <Input
                      id="ocr-department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Enter department name"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ocr-organizationName">Organization Name</Label>
                    <Input
                      id="ocr-organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-ownership">Ownership</Label>
                    <Select value={formData.ownership} onValueChange={(value) => handleInputChange('ownership', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ownership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central">Central Government</SelectItem>
                        <SelectItem value="state">State Government</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-documentFees">Document Fees (₹)</Label>
                    <Input
                      id="ocr-documentFees"
                      type="number"
                      value={formData.documentFees}
                      onChange={(e) => handleInputChange('documentFees', e.target.value)}
                      placeholder="Enter document fees"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ocr-emdValue">EMD Value (₹)</Label>
                    <Input
                      id="ocr-emdValue"
                      type="number"
                      value={formData.emdValue}
                      onChange={(e) => handleInputChange('emdValue', e.target.value)}
                      placeholder="Enter EMD value"
                    />
                  </div>
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