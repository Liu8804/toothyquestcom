import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, Star, Coins, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BONUS_REWARDS } from "@/data/rewardsConfig";
import MascotWithExpression from "./MascotWithExpression";

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => Promise<number>;
  streak: number;
  childName?: string;
}

const DAILY_GIFTS = [
  { emoji: "✨", name: "Sparkly Star", color: "from-primary to-bubble" },
  { emoji: "⭐", name: "Golden Star", color: "from-star to-accent" },
  { emoji: "🌟", name: "Magic Sparkle", color: "from-secondary to-candy" },
  { emoji: "🎀", name: "Pink Ribbon", color: "from-secondary to-primary" },
  { emoji: "🌈", name: "Rainbow Badge", color: "from-accent to-mint" },
  { emoji: "💎", name: "Diamond Tooth", color: "from-primary to-secondary" },
];

const DailyBonusModal = ({ isOpen, onClose, onClaim, streak, childName }: DailyBonusModalProps) => {
  const [phase, setPhase] = useState<"gift" | "opening" | "reward">("gift");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [gift, setGift] = useState(DAILY_GIFTS[0]);

  useEffect(() => {
    if (isOpen) {
      setPhase("gift");
      setGift(DAILY_GIFTS[Math.floor(Math.random() * DAILY_GIFTS.length)]);
    }
  }, [isOpen]);

  const handleClaim = async () => {
    setPhase("opening");
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const points = await onClaim();
    setPointsEarned(points);
    setPhase("reward");
    
    // Auto close after showing reward
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className={`relative w-full max-w-sm bg-gradient-to-br ${gift.color} rounded-3xl shadow-float p-8 text-center overflow-hidden`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-20, -180],
                    x: Math.random() * 50 - 25,
                  }}
                  transition={{
                    duration: 2.5,
                    delay: Math.random() * 1.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: 0,
                  }}
                >
                  {["✨", "⭐", "🌟", "💫"][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>

            {/* Streak badge */}
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute top-4 left-4 bg-background/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1"
              >
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-white font-bold text-sm">{streak} day streak!</span>
              </motion.div>
            )}

            {/* Gift phase */}
            {phase === "gift" && (
              <>
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block mb-4"
                >
                  <Gift className="w-24 h-24 text-white drop-shadow-lg" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
                >
                  Daily Bonus! 🎁
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 mb-2"
                >
                  {childName ? `Welcome back, ${childName}!` : "Welcome back!"}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-background/20 backdrop-blur-sm rounded-2xl p-3 mb-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5 text-star" />
                    <span className="text-white font-bold text-lg">+{BONUS_REWARDS.dailyOpen} Sparkle Points</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleClaim}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Claim Gift!
                  </Button>
                </motion.div>
              </>
            )}

            {/* Opening animation */}
            {phase === "opening" && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 0.8, 1.5], rotate: [0, -10, 10, 0], opacity: [1, 1, 1, 0] }}
                transition={{ duration: 1 }}
                className="py-8"
              >
                <Gift className="w-24 h-24 text-white mx-auto drop-shadow-lg" />
                <motion.div
                  animate={{ scale: [1, 2, 3], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Star className="w-32 h-32 text-star" />
                </motion.div>
              </motion.div>
            )}

            {/* Reward phase */}
            {phase === "reward" && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="mb-4"
                >
                  <MascotWithExpression expression="celebrating" size="lg" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
                >
                  Reward Collected! 🎉
                </motion.h2>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="bg-background/20 backdrop-blur-sm rounded-2xl p-4 mb-4"
                >
                  <span className="text-5xl block mb-2">{gift.emoji}</span>
                  <p className="font-display font-bold text-white text-lg">{gift.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Sparkles className="w-5 h-5 text-star" />
                    <span className="text-star font-bold text-xl">+{pointsEarned} Points!</span>
                  </div>
                </motion.div>

                {streak >= 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-orange-500/30 backdrop-blur-sm rounded-xl p-2"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flame className="w-4 h-4 text-orange-300" />
                      <span className="text-white text-sm font-medium">
                        +{BONUS_REWARDS.streakBonus} streak bonus!
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyBonusModal;