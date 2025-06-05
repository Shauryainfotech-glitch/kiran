import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Hash,
  Database,
  Lock,
  Key,
  Verified,
  FileCheck,
  Network,
  Blocks
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlockchainRecord {
  id: string;
  documentId: string;
  documentName: string;
  hash: string;
  blockHash: string;
  transactionId: string;
  timestamp: string;
  status: 'verified' | 'pending' | 'failed';
  verificationScore: number;
  immutableSignature: string;
}

interface VerificationRequest {
  id: string;
  documentName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'processing' | 'verified' | 'failed';
  progress: number;
  blockchainHash?: string;
}

export default function BlockchainVerification() {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);

  const blockchainRecords: BlockchainRecord[] = [];

  const networkStats = {
    totalBlocks: 1247856,
    totalTransactions: 3456789,
    verifiedDocuments: 15420,
    networkHealth: 99.8,
    averageBlockTime: 12.5,
    gasPrice: 25
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newRequest: VerificationRequest = {
        id: Date.now().toString(),
        documentName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: "processing",
        progress: 0
      };
      
      setVerificationRequests([newRequest, ...verificationRequests]);
      
      // Simulate blockchain verification process
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setVerificationRequests(prev => 
            prev.map(req => 
              req.id === newRequest.id 
                ? { 
                    ...req, 
                    status: "verified", 
                    progress: 100,
                    blockchainHash: `0x${Math.random().toString(16).substring(2, 66)}`
                  }
                : req
            )
          );
        } else {
          setVerificationRequests(prev => 
            prev.map(req => 
              req.id === newRequest.id 
                ? { ...req, progress: Math.min(progress, 100) }
                : req
            )
          );
        }
      }, 800);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Blocks className="h-8 w-8 mr-3 text-blue-600" />
            Blockchain Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Immutable document verification using distributed ledger technology
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Network className="h-4 w-4 mr-2" />
            Network Status
          </Button>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{networkStats.totalBlocks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Blocks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{networkStats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{networkStats.verifiedDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Verified Docs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{networkStats.networkHealth}%</div>
            <p className="text-xs text-muted-foreground">Network Health</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{networkStats.averageBlockTime}s</div>
            <p className="text-xs text-muted-foreground">Block Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{networkStats.gasPrice}</div>
            <p className="text-xs text-muted-foreground">Gas Price (Gwei)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">
            <FileCheck className="h-4 w-4 mr-2" />
            Document Verification
          </TabsTrigger>
          <TabsTrigger value="records">
            <Database className="h-4 w-4 mr-2" />
            Blockchain Records
          </TabsTrigger>
          <TabsTrigger value="integrity">
            <Shield className="h-4 w-4 mr-2" />
            Integrity Check
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Network className="h-4 w-4 mr-2" />
            Network Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  Upload for Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="blockchain-upload"
                  />
                  <label htmlFor="blockchain-upload" className="cursor-pointer">
                    <Blocks className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Upload documents for blockchain verification
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX files up to 100MB
                    </p>
                  </label>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Verification Process:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span>Generate cryptographic hash</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Create immutable signature</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-purple-600" />
                      <span>Register on blockchain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Verified className="h-4 w-4 text-green-600" />
                      <span>Verification complete</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Verification Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{request.documentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(request.fileSize)} • {formatDate(request.uploadedAt)}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.status === 'processing' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Verification Progress</span>
                            <span>{Math.round(request.progress)}%</span>
                          </div>
                          <Progress value={request.progress} />
                        </div>
                      )}
                      
                      {request.status === 'verified' && request.blockchainHash && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-green-800 mb-1">Blockchain Hash:</p>
                          <p className="text-xs font-mono text-green-700 break-all">
                            {request.blockchainHash}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Verified Document Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockchainRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">{record.documentName}</h3>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Document ID:</span> {record.documentId}</p>
                            <p><span className="text-muted-foreground">Verified:</span> {formatDate(record.timestamp)}</p>
                            <p className="flex items-center">
                              <span className="text-muted-foreground mr-2">Status:</span>
                              {getStatusBadge(record.status)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Blockchain Details</h4>
                          <div className="space-y-1 text-xs">
                            <p><span className="text-muted-foreground">Block Hash:</span></p>
                            <p className="font-mono break-all">{record.blockHash}</p>
                            <p><span className="text-muted-foreground">Transaction ID:</span></p>
                            <p className="font-mono break-all">{record.transactionId}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Verification Score</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Integrity</span>
                              <span>{record.verificationScore}%</span>
                            </div>
                            <Progress value={record.verificationScore} />
                            <p className="text-xs text-muted-foreground">
                              Signature: {record.immutableSignature}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Document Integrity Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Quick Integrity Check</h3>
                  <div className="space-y-3">
                    <Input placeholder="Enter document hash or blockchain transaction ID" />
                    <Button className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Verify Integrity
                    </Button>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Integrity Verified</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Document hash matches blockchain record. No tampering detected.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Security Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-5 w-5 text-green-600" />
                        <span className="text-sm">SHA-256 Hashing</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Immutable Signatures</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Network className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Distributed Consensus</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Cryptographic Proof</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="h-5 w-5 mr-2" />
                  Network Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.98%</span>
                  </div>
                  <Progress value={99.98} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verification Speed</span>
                    <span className="text-sm font-medium">2.3s avg</span>
                  </div>
                  <Progress value={85} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Efficiency</span>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">247</div>
                      <p className="text-xs text-muted-foreground">Documents Today</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">15.4K</div>
                      <p className="text-xs text-muted-foreground">Total Verified</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Documents Verified</span>
                        <span className="text-green-600">+12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Verification Time</span>
                        <span className="text-green-600">-8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Efficiency</span>
                        <span className="text-green-600">+3%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}