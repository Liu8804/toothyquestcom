import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import toothyLogo from "@/assets/toothyquest-logo.jpeg";

interface DailyChallengesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId?: string;
}

const DailyChallengesPanel = ({ isOpen, onClose, childId }: DailyChallengesPanelProps) => {
  const { 
    getChallengesWithProgress, 
    getCompletedCount, 
    getTotalXpEarned,
    loading 
  } = useDailyChallenges(childId);

  const challengesWithProgress = getChallengesWithProgress();
  const completedCount = getCompletedCount();
  const totalXp = getTotalXpEarned();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-background rounded-3xl shadow-float overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Flame className="w-8 h-8 text-star" />
                  </motion.div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Daily Challenges</h2>
                    <p className="text-white/80 text-sm">Complete to earn bonus XP!</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress summary */}
              <div className="bg-white/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Today's Progress</span>
                  <span className="font-bold">
                    {completedCount}/{challengesWithProgress.length}
                  </span>
                </div>
                <Progress 
                  value={challengesWithProgress.length > 0 
                    ? (completedCount / challengesWithProgress.length) * 100 
                    : 0
                  } 
                  className="h-3 bg-white/30"
                />
                {totalXp > 0 && (
                  <p className="text-sm mt-2 text-white/90">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {totalXp} XP earned today!
                  </p>
                )}
              </div>
            </div>

            {/* Challenges list */}
            <div className="p-6 max-h-[50vh] overflow-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading challenges...
                </div>
              ) : challengesWithProgress.length === 0 ? (
                <div className="text-center py-8">
                  <img
                    src={toothyLogo}
                    alt="ToothyQuest"
                    className="w-16 h-16 mx-auto rounded-full mb-4"
                  />
                  <p className="text-muted-foreground">
                    No challenges available today. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {challengesWithProgress.map((challenge, index) => {
                    const isCompleted = challenge.progress?.completed || false;
                    const currentCount = challenge.progress?.current_count || 0;
                    const progressPercent = (currentCount / challenge.target_count) * 100;

                    return (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          isCompleted
                            ? "bg-gradient-to-r from-primary/10 to-mint-fresh/10 border-primary"
                            : "bg-card border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{challenge.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground truncate">
                                {challenge.title}
                              </h3>
                              {isCompleted ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", delay: 0.2 }}
                                >
                                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                </motion.div>
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {challenge.description}
                            </p>
                            
                            {/* Progress bar for multi-target challenges */}
                            {challenge.target_count > 1 && !isCompleted && (
                              <div className="mt-2">
                                <Progress value={progressPercent} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {currentCount}/{challenge.target_count}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-star/20 text-star"
                          }`}>
                            +{challenge.xp_reward} XP
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-center text-sm text-muted-foreground">
                🔄 Challenges reset daily at midnight
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyChallengesPanel;
