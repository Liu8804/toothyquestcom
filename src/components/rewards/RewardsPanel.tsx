import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Star, Flame, Gift, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SparkMeter from "./SparkMeter";
import TrophyCase from "./TrophyCase";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { LEVELS } from "@/data/rewardsConfig";

interface RewardsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId?: string;
}

const RewardsPanel = ({ isOpen, onClose, childId }: RewardsPanelProps) => {
  const {
    totalPoints,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    streak,
    unlockedBadges,
    unlockedPets,
    questsCompleted,
    loading,
  } = useRewardsSystem(childId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-card rounded-3xl shadow-float"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-secondary p-6 rounded-t-3xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Rewards Center</h2>
                  <p className="text-white/80">Track your amazing progress!</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Sparkle Meter */}
                  <SparkMeter totalPoints={totalPoints} showLevel />

                  {/* Stats Row - chunky 3D cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-star/10 to-accent/10 rounded-xl p-3 text-center border-2 border-star/20 shadow-[0_3px_0_0_hsl(var(--star-gold)/0.3)]"
                    >
                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Star className="w-6 h-6 text-star mx-auto mb-1" />
                      </motion.div>
                      <motion.p
                        key={questsCompleted}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="font-display text-xl font-bold text-foreground"
                      >{questsCompleted}</motion.p>
                      <p className="text-xs text-muted-foreground">Quests</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-secondary/10 to-candy/10 rounded-xl p-3 text-center border-2 border-secondary/20 shadow-[0_3px_0_0_hsl(var(--secondary)/0.3)]"
                    >
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        <Flame className="w-6 h-6 text-secondary mx-auto mb-1" />
                      </motion.div>
                      <motion.p
                        key={streak}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="font-display text-xl font-bold text-foreground"
                      >{streak}</motion.p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-primary/10 to-bubble/10 rounded-xl p-3 text-center border-2 border-primary/20 shadow-[0_3px_0_0_hsl(var(--primary)/0.3)]"
                    >
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Gift className="w-6 h-6 text-primary mx-auto mb-1" />
                      </motion.div>
                      <motion.p
                        key={unlockedBadges.length}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="font-display text-xl font-bold text-foreground"
                      >{unlockedBadges.length}</motion.p>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </motion.div>
                  </div>

                  {/* Level Progress */}
                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                      📈 Level Progress
                    </h3>
                    <div className="space-y-2">
                      {LEVELS.map((level, index) => {
                        const isCurrentLevel = level.level === currentLevel.level;
                        const isCompleted = level.level < currentLevel.level;
                        
                        return (
                          <motion.div
                            key={level.level}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-2 rounded-xl ${
                              isCurrentLevel
                                ? 'bg-primary/10 border border-primary/30'
                                : isCompleted
                                ? 'bg-star/10'
                                : 'opacity-50'
                            }`}
                          >
                            <span className="text-2xl">{level.emoji}</span>
                            <div className="flex-1">
                              <p className={`font-display font-bold text-sm ${
                                isCurrentLevel ? 'text-primary' : 'text-foreground'
                              }`}>
                                {level.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{level.reward}</p>
                            </div>
                            {isCompleted && (
                              <span className="text-lg">✅</span>
                            )}
                            {isCurrentLevel && (
                              <ChevronRight className="w-5 h-5 text-primary" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trophy Case */}
                  <TrophyCase
                    unlockedBadges={unlockedBadges}
                    unlockedPets={unlockedPets}
                  />

                  {/* Next reward preview */}
                  {nextLevel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-accent/10 to-star/10 rounded-2xl p-4 border border-accent/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{nextLevel.emoji}</span>
                        <div className="flex-1">
                          <p className="font-display font-bold text-foreground">Next: {nextLevel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {nextLevel.minPoints - totalPoints} more points needed
                          </p>
                        </div>
                        <Sparkles className="w-6 h-6 text-accent" />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 bg-card border-t border-border">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onClose}
                  className="w-full rounded-full font-display font-bold shadow-[0_4px_0_0_hsl(var(--primary)/0.4)] active:shadow-none active:translate-y-1"
                  size="lg"
                >
                  Keep Earning! ✨
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardsPanel;
