import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, Star, Target, Zap, Award, Medal, Crown,
  TrendingUp, Users, Calendar, CheckCircle, Gift,
  Flame, Sparkles, ChevronUp, ArrowRight, Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  requirements: string[];
}

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  currentLevelPoints: number;
  maxLevelPoints: number;
  rank: number;
  totalUsers: number;
  streak: number;
  badges: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  points: number;
  progress: number;
  maxProgress: number;
  expiresAt: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  tier: string;
  weeklyPoints: number;
  monthlyPoints: number;
}

export default function GamificationCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("all-time");
  const [showAchievementDetail, setShowAchievementDetail] = useState<string | null>(null);

  const { data: userProfile } = useQuery({
    queryKey: ['/api/gamification/profile'],
    enabled: true
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/gamification/achievements'],
    enabled: true
  });

  const { data: challenges } = useQuery({
    queryKey: ['/api/gamification/challenges'],
    enabled: true
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/gamification/leaderboard', selectedPeriod],
    enabled: true
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/gamification/activity'],
    enabled: true
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      return apiRequest(`/api/gamification/achievements/${achievementId}/claim`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification'] });
    }
  });

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest(`/api/gamification/challenges/${challengeId}/start`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return "bg-gray-100 text-gray-800 border-gray-300";
      case 'rare': return "bg-blue-100 text-blue-800 border-blue-300";
      case 'epic': return "bg-purple-100 text-purple-800 border-purple-300";
      case 'legendary': return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return "text-amber-600";
      case 'silver': return "text-gray-500";
      case 'gold': return "text-yellow-500";
      case 'platinum': return "text-blue-400";
      case 'diamond': return "text-cyan-400";
      default: return "text-gray-500";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return "bg-green-100 text-green-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'hard': return "bg-orange-100 text-orange-800";
      case 'expert': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Gamification Center
          </h1>
          <p className="text-gray-600 mt-2">Track your progress and compete with others</p>
        </div>
        
        {userProfile && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{userProfile.name}</h3>
                    <Badge className={`${getTierColor(userProfile.tier)} bg-white`}>
                      Level {userProfile.level}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">
                    {userProfile.totalPoints.toLocaleString()} points • Rank #{userProfile.rank}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm">{userProfile.streak} day streak</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">Level {userProfile.level}</span>
                      <Badge variant="outline">
                        {userProfile.pointsToNextLevel} to go
                      </Badge>
                    </div>
                    <Progress 
                      value={(userProfile.currentLevelPoints / userProfile.maxLevelPoints) * 100}
                      className="h-3"
                    />
                    <p className="text-sm text-gray-600">
                      {userProfile.currentLevelPoints} / {userProfile.maxLevelPoints} XP
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements?.filter((a: Achievement) => a.unlocked)
                      .slice(0, 3)
                      .map((achievement: Achievement) => (
                      <div key={achievement.id} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{achievement.title}</p>
                          <p className="text-xs text-gray-600">+{achievement.points} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Challenges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {challenges?.filter((c: Challenge) => !c.completed)
                      .slice(0, 3)
                      .map((challenge: Challenge) => (
                      <div key={challenge.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{challenge.title}</p>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.maxProgress) * 100}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{challenge.progress}/{challenge.maxProgress}</span>
                          <span>{formatTimeLeft(challenge.expiresAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentActivity?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Star className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-600">{activity.timestamp}</p>
                      </div>
                      <Badge variant="secondary">+{activity.points}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Achievements</h2>
              <p className="text-gray-600">Unlock rewards by completing various tasks</p>
            </div>
            <div className="flex gap-2">
              {['all', 'unlocked', 'locked'].map((filter) => (
                <Button key={filter} variant="outline" size="sm">
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements?.map((achievement: Achievement) => (
              <Card 
                key={achievement.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  achievement.unlocked ? 'border-green-200 bg-green-50' : ''
                }`}
                onClick={() => setShowAchievementDetail(achievement.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getRarityColor(achievement.rarity)}`}>
                      {achievement.unlocked ? (
                        <Trophy className="w-6 h-6" />
                      ) : (
                        <Trophy className="w-6 h-6 opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${achievement.unlocked ? '' : 'opacity-50'}`}>
                          {achievement.title}
                        </h3>
                        {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className={`text-sm text-gray-600 ${achievement.unlocked ? '' : 'opacity-50'}`}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <span className="text-sm font-medium text-blue-600">
                          {achievement.points} pts
                        </span>
                      </div>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {type} Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenges?.filter((c: Challenge) => c.type === type)
                    .map((challenge: Challenge) => (
                    <div key={challenge.id} className="p-3 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{challenge.title}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.maxProgress}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {formatTimeLeft(challenge.expiresAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{challenge.points} pts</span>
                        </div>
                      </div>
                      
                      {challenge.completed ? (
                        <Button disabled className="w-full">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => startChallengeMutation.mutate(challenge.id)}
                          className="w-full"
                          variant="outline"
                        >
                          Continue Challenge
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <div className="flex gap-2">
              {['all-time', 'monthly', 'weekly'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 3 Podium */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaderboard?.slice(0, 3).map((entry: LeaderboardEntry, index: number) => (
                  <div key={entry.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-gray-600">
                        Level {entry.level} • {entry.points.toLocaleString()} pts
                      </p>
                    </div>
                    {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Full Leaderboard */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Full Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {leaderboard?.map((entry: LeaderboardEntry) => (
                      <div 
                        key={entry.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.rank <= 3 ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 text-center font-medium">
                          #{entry.rank}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.name}</span>
                            <Badge variant="outline" className={getTierColor(entry.tier)}>
                              {entry.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{entry.points.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">total points</p>
                        </div>
                        {entry.rank <= 3 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <ChevronUp className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Reward Store</h2>
            <p className="text-gray-600">Redeem your points for exclusive rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Premium Badge", cost: 500, type: "cosmetic", icon: <Medal className="w-8 h-8" /> },
              { name: "Priority Support", cost: 1000, type: "service", icon: <Sparkles className="w-8 h-8" /> },
              { name: "Custom Avatar Frame", cost: 750, type: "cosmetic", icon: <Crown className="w-8 h-8" /> },
              { name: "Advanced Analytics", cost: 2000, type: "feature", icon: <TrendingUp className="w-8 h-8" /> },
              { name: "Team Collaboration", cost: 1500, type: "feature", icon: <Users className="w-8 h-8" /> },
              { name: "Gift Card $50", cost: 5000, type: "monetary", icon: <Gift className="w-8 h-8" /> }
            ].map((reward, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {reward.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{reward.name}</h3>
                  <Badge variant="outline" className="mb-4">
                    {reward.type}
                  </Badge>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-lg font-bold">{reward.cost}</span>
                    <span className="text-gray-600">points</span>
                  </div>
                  <Button 
                    className="w-full"
                    disabled={!userProfile || userProfile.totalPoints < reward.cost}
                  >
                    {userProfile && userProfile.totalPoints >= reward.cost ? 'Redeem' : 'Insufficient Points'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!showAchievementDetail} onOpenChange={() => setShowAchievementDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
            <DialogDescription>
              View detailed information about this achievement
            </DialogDescription>
          </DialogHeader>
          {showAchievementDetail && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-4 ${getRarityColor('epic')}`}>
                  <Trophy className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mt-4">Achievement Title</h3>
                <p className="text-gray-600">Detailed achievement description goes here</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Complete 10 tender submissions</li>
                  <li>• Achieve 80% success rate</li>
                  <li>• Use AI recommendations 5 times</li>
                </ul>
              </div>
              <Button className="w-full">
                <Gift className="w-4 h-4 mr-2" />
                Claim Reward
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}