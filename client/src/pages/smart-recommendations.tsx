import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, Target, TrendingUp, Star, Filter, Zap, Users, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SmartRecommendation {
  id: number;
  tenderId: number;
  tenderTitle: string;
  matchScore: number;
  confidenceLevel: number;
  reasoning: string[];
  category: string;
  estimatedValue: number;
  deadline: string;
  riskLevel: 'low' | 'medium' | 'high';
  successProbability: number;
  requiredCapabilities: string[];
  missingCapabilities: string[];
  recommendedActions: string[];
  historicalContext: string;
}

interface UserPreferences {
  industries: string[];
  valueRange: [number, number];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  capabilities: string[];
  geographicPreferences: string[];
  timeHorizon: number;
}

export default function SmartRecommendations() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [preferences, setPreferences] = useState<UserPreferences>({
    industries: [],
    valueRange: [10000, 1000000],
    riskTolerance: 'moderate',
    capabilities: [],
    geographicPreferences: [],
    timeHorizon: 30
  });
  const [contextualAI, setContextualAI] = useState({
    enabled: true,
    aggressiveness: [50],
    learningMode: true,
    personalizedInsights: true
  });

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/recommendations/smart'],
    enabled: true
  });

  const { data: userProfile } = useQuery({
    queryKey: ['/api/recommendations/profile'],
    enabled: true
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      return apiRequest('/api/recommendations/preferences', {
        method: 'POST',
        body: JSON.stringify(newPreferences)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/smart'] });
    }
  });

  const trackInteractionMutation = useMutation({
    mutationFn: async (interaction: { type: string; tenderId: number; action: string }) => {
      return apiRequest('/api/recommendations/track', {
        method: 'POST',
        body: JSON.stringify(interaction)
      });
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest('/api/recommendations/insights', {
        method: 'POST',
        body: JSON.stringify(config)
      });
    }
  });

  const handleRecommendationAction = (tenderId: number, action: string) => {
    trackInteractionMutation.mutate({
      type: 'recommendation_interaction',
      tenderId,
      action
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return "bg-green-100 text-green-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'high': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Smart Tender Recommendations
          </h1>
          <p className="text-gray-600 mt-2">AI-powered recommendations tailored to your business profile</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateInsightsMutation.mutate(contextualAI)}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Contextual AI Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Contextual AI Engine
          </CardTitle>
          <CardDescription>
            Fine-tune AI recommendations based on your preferences and market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>AI Aggressiveness</Label>
                <span className="text-sm text-gray-500">{contextualAI.aggressiveness[0]}%</span>
              </div>
              <Slider
                value={contextualAI.aggressiveness}
                onValueChange={(value) => setContextualAI(prev => ({ ...prev, aggressiveness: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Higher values prioritize high-potential opportunities with increased risk
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="learning-mode">Adaptive Learning</Label>
                <Switch
                  id="learning-mode"
                  checked={contextualAI.learningMode}
                  onCheckedChange={(checked) => setContextualAI(prev => ({ ...prev, learningMode: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="personalized-insights">Personalized Insights</Label>
                <Switch
                  id="personalized-insights"
                  checked={contextualAI.personalizedInsights}
                  onCheckedChange={(checked) => setContextualAI(prev => ({ ...prev, personalizedInsights: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="gamification">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations?.map((rec: SmartRecommendation) => (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rec.tenderTitle}</CardTitle>
                        <CardDescription className="mt-1">
                          {rec.category} • Deadline: {new Date(rec.deadline).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getScoreColor(rec.matchScore)}>
                          {rec.matchScore}% Match
                        </Badge>
                        <Badge className={getRiskBadgeColor(rec.riskLevel)}>
                          {rec.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Success Probability</Label>
                        <Progress value={rec.successProbability} className="mt-1" />
                        <span className="text-xs text-gray-600">{rec.successProbability}%</span>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Confidence Level</Label>
                        <Progress value={rec.confidenceLevel} className="mt-1" />
                        <span className="text-xs text-gray-600">{rec.confidenceLevel}%</span>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Estimated Value</Label>
                        <p className="text-lg font-semibold text-green-600">
                          ${rec.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">AI Reasoning</Label>
                      <ul className="space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {rec.missingCapabilities.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Missing Capabilities</Label>
                        <div className="flex flex-wrap gap-2">
                          {rec.missingCapabilities.map((capability, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Recommended Actions</Label>
                      <ul className="space-y-1">
                        {rec.recommendedActions.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(rec.tenderId, 'view_details')}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec.tenderId, 'save_for_later')}
                      >
                        Save for Later
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRecommendationAction(rec.tenderId, 'not_interested')}
                      >
                        Not Interested
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Preferences</CardTitle>
              <CardDescription>
                Customize your preferences to receive more targeted recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Industries</Label>
                    <Input 
                      placeholder="Enter industries (comma-separated)"
                      value={preferences.industries.join(', ')}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        industries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Risk Tolerance</Label>
                    <Select 
                      value={preferences.riskTolerance}
                      onValueChange={(value: any) => setPreferences(prev => ({ ...prev, riskTolerance: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Value Range</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          placeholder="Min value"
                          value={preferences.valueRange[0]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            valueRange: [parseInt(e.target.value) || 0, prev.valueRange[1]]
                          }))}
                        />
                        <Input 
                          type="number"
                          placeholder="Max value"
                          value={preferences.valueRange[1]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            valueRange: [prev.valueRange[0], parseInt(e.target.value) || 0]
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Time Horizon (days)</Label>
                    <Input 
                      type="number"
                      value={preferences.timeHorizon}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        timeHorizon: parseInt(e.target.value) || 30
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Core Capabilities</Label>
                <Textarea 
                  placeholder="List your organization's core capabilities..."
                  value={preferences.capabilities.join('\n')}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    capabilities: e.target.value.split('\n').filter(Boolean)
                  }))}
                  rows={4}
                />
              </div>

              <Button 
                onClick={() => updatePreferencesMutation.mutate(preferences)}
                disabled={updatePreferencesMutation.isPending}
              >
                {updatePreferencesMutation.isPending ? 'Updating...' : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recommendations Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">64.2%</div>
                <p className="text-xs text-muted-foreground">+5.4% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value Won</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <p className="text-xs text-muted-foreground">+12.3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Performance analytics chart would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h4 className="font-medium">Smart Bidder</h4>
                    <p className="text-sm text-gray-600">Won 5 recommended tenders</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-500" />
                  <div>
                    <h4 className="font-medium">AI Explorer</h4>
                    <p className="text-sm text-gray-600">Used AI recommendations 50 times</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">Precision Master</h4>
                    <p className="text-sm text-gray-600">90%+ accuracy on predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <span className="font-medium">Your Organization</span>
                  </div>
                  <span className="font-bold text-yellow-600">2,450 pts</span>
                </div>

                <div className="space-y-2">
                  {[
                    { rank: 2, name: "TechCorp Solutions", points: 2200 },
                    { rank: 3, name: "Global Innovators", points: 2100 },
                    { rank: 4, name: "Future Builders", points: 1950 },
                    { rank: 5, name: "Smart Systems", points: 1800 }
                  ].map((item) => (
                    <div key={item.rank} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                          {item.rank}
                        </div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}