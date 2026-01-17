import { motion } from "framer-motion";
import { Trophy, Star, Target, Calendar, TrendingUp, Plus, LogOut, Volume2, VolumeX, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { stories } from "@/data/stories";
import { useState } from "react";
import AddChildModal from "./AddChildModal";
import DailyChallengesPanel from "./DailyChallengesPanel";

interface ParentDashboardProps {
  onClose: () => void;
}

const ParentDashboard = ({ onClose }: ParentDashboardProps) => {
  const { user, signOut } = useAuth();
  const { isMuted, toggleMute } = useSoundEffects();
  const {
    children,
    selectedChild,
    setSelectedChild,
    questProgress,
    earnedBadges,
    allBadges,
    totalXp,
    loading,
  } = useQuestProgress();
  const [showAddChild, setShowAddChild] = useState(false);
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
  
  const { getCompletedCount, getChallengesWithProgress } = useDailyChallenges(selectedChild?.id);

  const completedQuests = questProgress.length;
  const totalQuests = stories.length;
  const progressPercent = (completedQuests / totalQuests) * 100;

  // Get recent activity (last 7 days)
  const recentActivity = questProgress.filter((q) => {
    const completedDate = new Date(q.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate > weekAgo;
  });

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-muted-foreground">Track your child's dental adventure</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="rounded-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
            <Button onClick={onClose} className="rounded-full">
              Back to Home
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        <div className="bg-card rounded-3xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Children</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddChild(true)}
              className="rounded-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No children added yet</p>
              <Button onClick={() => setShowAddChild(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    selectedChild?.id === child.id
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <span className="text-3xl">{child.avatar_emoji}</span>
                  <span className="font-medium">{child.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedChild && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-3xl p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-8 h-8" />
                  <span className="text-4xl font-display font-bold">{totalXp}</span>
                </div>
                <p className="text-primary-foreground/80">Total XP Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-3xl p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-8 h-8" />
                  <span className="text-4xl font-display font-bold">{completedQuests}</span>
                </div>
                <p className="text-accent-foreground/80">Quests Completed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-3xl p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-8 h-8" />
                  <span className="text-4xl font-display font-bold">{earnedBadges.length}</span>
                </div>
                <p className="text-secondary-foreground/80">Badges Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-star to-star/80 text-foreground rounded-3xl p-6 shadow-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowDailyChallenges(true)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="w-8 h-8" />
                  <span className="text-4xl font-display font-bold">
                    {getCompletedCount()}/{getChallengesWithProgress().length}
                  </span>
                </div>
                <p className="text-foreground/80">Daily Challenges</p>
              </motion.div>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-3xl shadow-card p-6"
              >
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Quest Progress
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {completedQuests} of {totalQuests} quests
                    </span>
                    <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-4 rounded-full" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalQuests - completedQuests} more quests to become a Quest Legend!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-card rounded-3xl shadow-card p-6"
              >
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-accent" />
                  Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activity this week</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentActivity.slice(0, 5).map((activity) => {
                      const story = stories.find((s) => s.id === activity.quest_id);
                      return (
                        <div
                          key={activity.quest_id}
                          className="flex items-center justify-between p-3 bg-muted rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{story?.emoji || "📚"}</span>
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {story?.title || "Unknown Quest"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            +{activity.xp_earned} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Badges Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-card rounded-3xl shadow-card p-6"
            >
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-star" />
                Badge Collection
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                {allBadges.map((badge) => {
                  const isEarned = earnedBadges.some((eb) => eb.badge_id === badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`text-center p-4 rounded-2xl transition-all ${
                        isEarned
                          ? "bg-gradient-to-br from-star/20 to-primary/20 ring-2 ring-star"
                          : "bg-muted opacity-50 grayscale"
                      }`}
                    >
                      <span className="text-4xl block mb-2">{badge.emoji}</span>
                      <span className="text-xs font-medium block">{badge.name}</span>
                      {!isEarned && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          {badge.quest_count_required > 0
                            ? `${badge.quest_count_required} quests`
                            : `${badge.xp_required} XP`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>

      <AddChildModal isOpen={showAddChild} onClose={() => setShowAddChild(false)} />
      <DailyChallengesPanel 
        isOpen={showDailyChallenges} 
        onClose={() => setShowDailyChallenges(false)} 
        childId={selectedChild?.id}
      />
    </motion.div>
  );
};

export default ParentDashboard;
