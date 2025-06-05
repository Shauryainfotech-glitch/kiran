import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Users, MessageSquare, Highlighter, Edit3, FileText, 
  Clock, CheckCircle, AlertCircle, Share2, Eye,
  Palette, Type, MousePointer, Layers, Camera,
  Download, Upload, Settings, Bell, Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'highlight' | 'comment' | 'drawing' | 'stamp' | 'note';
  content: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    page?: number;
  };
  color: string;
  timestamp: string;
  resolved: boolean;
  replies: AnnotationReply[];
  mentions: string[];
  tags: string[];
}

interface AnnotationReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  cursor: { x: number; y: number };
  color: string;
  isTyping: boolean;
  lastSeen: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  pages: number;
  lastModified: string;
  collaborators: string[];
}

export default function CollaborativeWorkspace() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<string>('highlight');
  const [annotationColor, setAnnotationColor] = useState('#fbbf24');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState([100]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showCursors, setShowCursors] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentViewerRef = useRef<HTMLDivElement>(null);

  const { data: documents } = useQuery({
    queryKey: ['/api/collaboration/documents'],
    enabled: true
  });

  const { data: annotations } = useQuery({
    queryKey: ['/api/collaboration/annotations', selectedDocument],
    enabled: !!selectedDocument
  });

  const { data: activeUsers } = useQuery({
    queryKey: ['/api/collaboration/active-users', selectedDocument],
    enabled: !!selectedDocument && realTimeMode,
    refetchInterval: 2000
  });

  const createAnnotationMutation = useMutation({
    mutationFn: async (annotation: Partial<Annotation>) => {
      return apiRequest('/api/collaboration/annotations', {
        method: 'POST',
        body: JSON.stringify(annotation)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/annotations'] });
    }
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Annotation> }) => {
      return apiRequest(`/api/collaboration/annotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/annotations'] });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ annotationId, reply }: { annotationId: string; reply: Partial<AnnotationReply> }) => {
      return apiRequest(`/api/collaboration/annotations/${annotationId}/replies`, {
        method: 'POST',
        body: JSON.stringify(reply)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/annotations'] });
    }
  });

  const updateCursorMutation = useMutation({
    mutationFn: async (position: { x: number; y: number }) => {
      return apiRequest('/api/collaboration/cursor', {
        method: 'POST',
        body: JSON.stringify({ documentId: selectedDocument, position })
      });
    }
  });

  const handleDocumentClick = (event: React.MouseEvent) => {
    if (!documentViewerRef.current || activeAnnotationTool === 'cursor') return;

    const rect = documentViewerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (activeAnnotationTool === 'comment') {
      setSelectedAnnotation(null);
      // Open comment dialog at position
    } else if (activeAnnotationTool === 'highlight') {
      // Handle text selection highlighting
    }

    // Update cursor position for other users
    if (realTimeMode) {
      updateCursorMutation.mutate({ x, y });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedDocument) return;

    createAnnotationMutation.mutate({
      documentId: selectedDocument,
      type: 'comment',
      content: newComment,
      position: { x: 100, y: 100, page: currentPage },
      color: annotationColor,
      resolved: false,
      replies: [],
      mentions: [],
      tags: []
    });

    setNewComment('');
  };

  const handleResolveAnnotation = (annotationId: string) => {
    updateAnnotationMutation.mutate({
      id: annotationId,
      updates: { resolved: true }
    });
  };

  const handleAddReply = (annotationId: string, content: string) => {
    addReplyMutation.mutate({
      annotationId,
      reply: { content }
    });
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight': return <Highlighter className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'drawing': return <Edit3 className="w-4 h-4" />;
      case 'stamp': return <CheckCircle className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const annotationTools = [
    { id: 'cursor', name: 'Select', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'highlight', name: 'Highlight', icon: <Highlighter className="w-4 h-4" /> },
    { id: 'comment', name: 'Comment', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'drawing', name: 'Draw', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'stamp', name: 'Stamp', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'note', name: 'Note', icon: <FileText className="w-4 h-4" /> }
  ];

  const colorOptions = [
    '#fbbf24', '#ef4444', '#10b981', '#3b82f6', 
    '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Collaborative Workspace
          </h1>
          
          <Select value={selectedDocument || ""} onValueChange={setSelectedDocument}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select document..." />
            </SelectTrigger>
            <SelectContent>
              {documents?.map((doc: Document) => (
                <SelectItem key={doc.id} value={doc.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {doc.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {/* Active Users */}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {activeUsers?.slice(0, 5).map((user: ActiveUser) => (
                <Avatar key={user.id} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeUsers?.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Label htmlFor="real-time">Real-time</Label>
            <Switch
              id="real-time"
              checked={realTimeMode}
              onCheckedChange={setRealTimeMode}
            />
          </div>

          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-16 border-r bg-gray-50 p-2 space-y-2">
          {annotationTools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeAnnotationTool === tool.id ? "default" : "ghost"}
              size="sm"
              className="w-full h-12 flex flex-col gap-1"
              onClick={() => setActiveAnnotationTool(tool.id)}
              title={tool.name}
            >
              {tool.icon}
              <span className="text-xs">{tool.name}</span>
            </Button>
          ))}
          
          <Separator />
          
          {/* Color Palette */}
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="grid grid-cols-2 gap-1">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    annotationColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAnnotationColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Document Viewer */}
          <div className="flex-1 relative overflow-auto bg-gray-100">
            {selectedDocument ? (
              <div
                ref={documentViewerRef}
                className="relative min-h-full cursor-crosshair"
                onClick={handleDocumentClick}
                style={{ cursor: activeAnnotationTool === 'cursor' ? 'default' : 'crosshair' }}
              >
                {/* Document content would be rendered here */}
                <div className="bg-white shadow-lg mx-auto my-8 p-8 max-w-4xl min-h-[800px] relative">
                  <div className="text-center text-gray-500 py-20">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Document viewer would be rendered here</p>
                    <p className="text-sm">Click to add annotations</p>
                  </div>

                  {/* Render annotations */}
                  {annotations?.map((annotation: Annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute"
                      style={{
                        left: annotation.position.x,
                        top: annotation.position.y,
                        width: annotation.position.width,
                        height: annotation.position.height
                      }}
                    >
                      {annotation.type === 'highlight' && (
                        <div
                          className="bg-opacity-30 border border-opacity-50 rounded"
                          style={{ 
                            backgroundColor: annotation.color,
                            borderColor: annotation.color
                          }}
                        />
                      )}
                      
                      {annotation.type === 'comment' && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: annotation.color }}
                          onClick={() => setSelectedAnnotation(annotation.id)}
                        >
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Render user cursors */}
                  {showCursors && activeUsers?.map((user: ActiveUser) => (
                    <div
                      key={user.id}
                      className="absolute pointer-events-none z-50"
                      style={{
                        left: user.cursor.x,
                        top: user.cursor.y,
                        transform: 'translate(-2px, -2px)'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className="w-4 h-4 rotate-45 rounded-tl-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <div
                          className="text-xs px-2 py-1 rounded text-white whitespace-nowrap"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Zoom:</span>
                    <Slider
                      value={zoomLevel}
                      onValueChange={setZoomLevel}
                      min={25}
                      max={200}
                      step={25}
                      className="w-24"
                    />
                    <span className="text-sm w-12">{zoomLevel[0]}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a document to start collaborating</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-white">
            <Tabs defaultValue="annotations" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="annotations">Annotations</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="annotations" className="flex-1 overflow-hidden">
                <div className="p-4 space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Annotations</h3>
                    <Badge variant="secondary">
                      {annotations?.length || 0}
                    </Badge>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {annotations?.map((annotation: Annotation) => (
                        <Card
                          key={annotation.id}
                          className={`cursor-pointer transition-colors ${
                            selectedAnnotation === annotation.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedAnnotation(annotation.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-white"
                                style={{ backgroundColor: annotation.color }}
                              >
                                {getAnnotationIcon(annotation.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium truncate">
                                    {annotation.userName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(annotation.timestamp).toLocaleTimeString()}
                                  </span>
                                  {annotation.resolved && (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {annotation.content}
                                </p>
                                {annotation.replies.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {annotation.replies.length} replies
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="space-y-2 border-t pt-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="w-full"
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="flex-1 overflow-hidden">
                <div className="p-4 h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {annotations?.filter(a => a.type === 'comment').map((annotation: Annotation) => (
                        <div key={annotation.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={annotation.userAvatar} />
                              <AvatarFallback>{annotation.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{annotation.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(annotation.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{annotation.content}</p>
                            </div>
                          </div>

                          {annotation.replies.map((reply) => (
                            <div key={reply.id} className="ml-8 flex items-start gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-xs">{reply.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">{reply.userName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 ml-8">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResolveAnnotation(annotation.id)}
                              disabled={annotation.resolved}
                            >
                              {annotation.resolved ? 'Resolved' : 'Resolve'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="flex-1 overflow-hidden">
                <div className="p-4 h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Recent activity</span>
                      </div>
                      
                      {/* Activity feed would be populated here */}
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                          Activity feed will show collaboration events
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}