import { motion } from "framer-motion";
import { Sparkles, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Badge {
  name: string;
  emoji: string;
  description: string;
}

interface QuestCompleteCelebrationProps {
  isOpen: boolean;
  questTitle: string;
  xpEarned: number;
  newBadges: Badge[];
  onClose: () => void;
}

const QuestCompleteCelebration = ({
  isOpen,
  questTitle,
  xpEarned,
  newBadges,
  onClose,
}: QuestCompleteCelebrationProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-br from-star via-primary to-accent rounded-3xl shadow-float p-8 text-center"
      >
        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * 300 - 150,
                y: Math.random() * 300 - 150,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
              className="absolute top-1/2 left-1/2 text-2xl"
            >
              ⭐
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="relative"
        >
          <Trophy className="w-20 h-20 mx-auto text-white mb-4 drop-shadow-lg" />
        </motion.div>

        <h2 className="font-display text-3xl font-bold text-white mb-2 drop-shadow-lg">
          Quest Complete! 🎉
        </h2>
        <p className="text-white/90 text-lg mb-6">{questTitle}</p>

        {/* XP earned */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-star fill-star" />
            <span className="font-display text-4xl font-bold text-white">
              +{xpEarned} XP
            </span>
            <Star className="w-8 h-8 text-star fill-star" />
          </div>
        </motion.div>

        {/* New badges */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-white/80 text-sm mb-3">New Badges Earned!</p>
            <div className="flex justify-center gap-3">
              {newBadges.map((badge, i) => (
                <motion.div
                  key={badge.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  className="bg-white rounded-2xl p-3 shadow-card"
                >
                  <span className="text-3xl block mb-1">{badge.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={onClose}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Continue Adventure
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default QuestCompleteCelebration;
