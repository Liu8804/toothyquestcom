import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

interface StreakBonusPopupProps {
  isOpen: boolean;
  streak: number;
  bonusPoints: number;
  onClose: () => void;
}

const StreakBonusPopup = ({ isOpen, streak, bonusPoints, onClose }: StreakBonusPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-secondary to-star rounded-2xl p-4 shadow-float"
          onAnimationComplete={() => {
            setTimeout(onClose, 3000);
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="p-2 bg-white/20 rounded-xl"
            >
              <Flame className="w-8 h-8 text-white" />
            </motion.div>
            
            <div className="text-white">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display font-bold text-lg"
              >
                🔥 {streak} Day Streak!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">+{bonusPoints} Bonus Points!</span>
              </motion.div>
            </div>
          </div>

          {/* Floating flames */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-10, -40],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  bottom: 0,
                }}
              >
                🔥
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakBonusPopup;
