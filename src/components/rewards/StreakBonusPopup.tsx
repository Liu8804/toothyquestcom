import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

interface StreakBonusPopupProps {
  isOpen: boolean;
  streak: number;
  bonusPoints: number;
  onClose: () => void;
}

const STREAK_MESSAGES = [
  "Keep it up, champion! 🏆",
  "You're on fire! 🔥",
  "Amazing dedication! 💪",
  "Wow! So consistent! ⭐",
];

const StreakBonusPopup = ({ isOpen, streak, bonusPoints, onClose }: StreakBonusPopupProps) => {
  const message = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
  
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
            {/* Celebrating Mascot */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="relative"
            >
              <img 
                src={mascotCelebrating} 
                alt="Toothy celebrating"
                className="w-14 h-14 object-contain drop-shadow-md"
              />
              {/* Mini sparkles */}
              <motion.span
                className="absolute -top-1 -right-1 text-sm"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ✨
              </motion.span>
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-white/80 mt-1"
              >
                {message}
              </motion.p>
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
