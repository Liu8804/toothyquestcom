import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

interface RewardBurstProps {
  /** Whether the burst is active */
  isActive: boolean;
  /** XP amount to display */
  xp?: number;
  /** Optional emoji for the burst center */
  emoji?: string;
  /** Duration before auto-hide (ms) */
  duration?: number;
  /** Callback when burst finishes */
  onComplete?: () => void;
  /** Position variant */
  position?: "center" | "inline";
}

const burstEmojis = ["⭐", "🌟", "✨", "💫", "🎉", "🏆", "👑", "💎"];

const RewardBurst = ({
  isActive,
  xp,
  emoji = "⭐",
  duration = 2500,
  onComplete,
  position = "center",
}: RewardBurstProps) => {
  const { playWinFanfare } = useGameSounds();

  useEffect(() => {
    if (isActive) {
      playWinFanfare();
    }
  }, [isActive, playWinFanfare]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={`${
            position === "center"
              ? "fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
              : "absolute inset-0 flex items-center justify-center pointer-events-none"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            if (onComplete) {
              setTimeout(onComplete, duration);
            }
          }}
        >
          {/* Radiating particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            return (
              <motion.div
                key={i}
                className="absolute text-lg pointer-events-none"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
              >
                {burstEmojis[i % burstEmojis.length]}
              </motion.div>
            );
          })}

          {/* Central glow */}
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-star/30 blur-xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 2, 1.5], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5 }}
          />

          {/* Main emoji */}
          <motion.div
            className="text-5xl z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], rotate: [-180, 10, 0] }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            {emoji}
          </motion.div>

          {/* XP badge */}
          {xp && (
            <motion.div
              className="absolute z-20 bg-gradient-to-r from-star to-accent px-4 py-1.5 rounded-full shadow-glow"
              initial={{ y: 20, opacity: 0, scale: 0 }}
              animate={{ y: -50, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <span className="font-display font-bold text-white text-lg flex items-center gap-1">
                <Sparkles className="w-4 h-4" />+{xp} XP
              </span>
            </motion.div>
          )}

          {/* Orbiting stars */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1, 0.8],
                rotate: [0, 360],
                x: [0, Math.cos((i / 3) * Math.PI * 2) * 50],
                y: [0, Math.sin((i / 3) * Math.PI * 2) * 50],
              }}
              transition={{ delay: 0.3 + i * 0.15, duration: 1.5 }}
            >
              <Star className="w-5 h-5 text-star fill-star" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardBurst;
