import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Trophy, Zap, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import type { Level } from "@/data/rewardsConfig";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: Level;
}

const LevelUpModal = ({ isOpen, onClose, newLevel }: LevelUpModalProps) => {
  const getLevelIcon = () => {
    switch (newLevel.level) {
      case 2: return Zap;
      case 3: return Star;
      case 4: return Trophy;
      default: return Sparkles;
    }
  };

  const LevelIcon = getLevelIcon();

  return (
    <>
      <ConfettiCelebration isActive={isOpen} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-gradient-to-br from-primary via-secondary to-star rounded-3xl shadow-float p-8 text-center overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-xl"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-20, -180],
                      x: Math.random() * 60 - 30,
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
                    {["✨", "⭐", "🌟", "💫", "🎉"][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </div>

              {/* Level icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                className="relative mx-auto mb-4 w-24 h-24 flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 rounded-full"
                />
                <div className="relative p-5 bg-white rounded-full shadow-float">
                  <LevelIcon className="w-10 h-10 text-primary" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <span className="text-3xl">{newLevel.emoji}</span>
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-3xl font-bold text-white mb-2 drop-shadow-lg"
              >
                Level Up!
              </motion.h2>

              {/* Level name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4"
              >
                <p className="text-white/80 text-sm mb-1">You are now a</p>
                <p className="font-display text-2xl font-bold text-white">
                  {newLevel.emoji} {newLevel.name}
                </p>
                <p className="text-white/80 text-sm mt-1">Level {newLevel.level}</p>
              </motion.div>

              {/* Reward */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Gift className="w-5 h-5 text-white" />
                <span className="text-white/90 font-medium">{newLevel.reward}</span>
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Awesome!
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LevelUpModal;
