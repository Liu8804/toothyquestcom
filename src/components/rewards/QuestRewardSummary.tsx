import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Trophy, Flame, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AchievementBadge, ToothPet } from "@/data/rewardsConfig";

interface QuestRewardSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  questTitle: string;
  pointsEarned: number;
  bonusPoints: number;
  streakBonus: number;
  newBadges: AchievementBadge[];
  newPets: ToothPet[];
  totalPoints: number;
}

const QuestRewardSummary = ({
  isOpen,
  onClose,
  questTitle,
  pointsEarned,
  bonusPoints,
  streakBonus,
  newBadges,
  newPets,
  totalPoints,
}: QuestRewardSummaryProps) => {
  const totalEarned = pointsEarned + bonusPoints + streakBonus;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card rounded-3xl shadow-float overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center relative overflow-hidden">
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg"
                    animate={{
                      y: [-10, -50],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                    style={{
                      left: `${10 + i * 12}%`,
                      bottom: 0,
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-white">Quest Complete!</h2>
              <p className="text-white/80 text-sm mt-1">{questTitle}</p>
            </div>

            {/* Points breakdown */}
            <div className="p-6 space-y-4">
              {/* Points earned */}
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-star" />
                    <span className="font-medium text-foreground">Base Points</span>
                  </div>
                  <span className="font-display font-bold text-star">+{pointsEarned}</span>
                </motion.div>

                {bonusPoints > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Quiz Bonus</span>
                    </div>
                    <span className="font-display font-bold text-primary">+{bonusPoints}</span>
                  </motion.div>
                )}

                {streakBonus > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/10 to-star/10 rounded-xl border border-secondary/20"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-secondary" />
                      <span className="font-medium text-foreground">Streak Bonus!</span>
                    </div>
                    <span className="font-display font-bold text-secondary">+{streakBonus}</span>
                  </motion.div>
                )}
              </div>

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-star/20 to-accent/20 rounded-xl border-2 border-star/30"
              >
                <span className="font-display font-bold text-foreground">Total Earned</span>
                <span className="font-display text-2xl font-bold text-star">+{totalEarned}</span>
              </motion.div>

              {/* New unlocks */}
              {(newBadges.length > 0 || newPets.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4 border-t border-border"
                >
                  <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    New Unlocks!
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {newBadges.map(badge => (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${badge.color}`}
                      >
                        <span className="text-lg">{badge.emoji}</span>
                        <span className="font-medium text-white text-sm">{badge.name}</span>
                      </motion.div>
                    ))}
                    {newPets.map(pet => (
                      <motion.div
                        key={pet.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-mint to-primary"
                      >
                        <span className="text-lg">{pet.emoji}</span>
                        <span className="font-medium text-white text-sm">{pet.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Total points */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-2"
              >
                <p className="text-muted-foreground text-sm">Total Sparkle Points</p>
                <p className="font-display text-3xl font-bold text-foreground">{totalPoints}</p>
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full rounded-full font-display font-bold"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Continue Adventure!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestRewardSummary;
