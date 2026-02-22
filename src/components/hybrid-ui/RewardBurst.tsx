import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Trophy } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

interface RewardBurstProps {
  isActive: boolean;
  xp?: number;
  emoji?: string;
  duration?: number;
  onComplete?: () => void;
  position?: "center" | "inline";
  /** Optional badge/achievement name */
  badgeName?: string;
}

const burstEmojis = ["⭐", "🌟", "✨", "💫", "🎉", "🏆", "👑", "💎"];

const RewardBurst = ({
  isActive,
  xp,
  emoji = "⭐",
  duration = 2500,
  onComplete,
  position = "center",
  badgeName,
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
          {/* Radiating particles — 3D depth with varying sizes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const pSize = 0.7 + Math.random() * 0.6;
            return (
              <motion.div
                key={i}
                className="absolute text-lg pointer-events-none"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: [0, 1.2 * pSize, 0.8 * pSize],
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
              >
                {burstEmojis[i % burstEmojis.length]}
              </motion.div>
            );
          })}

          {/* Central glow — layered for 3D depth */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 128,
              height: 128,
              background: "radial-gradient(circle, hsl(var(--star) / 0.4), hsl(var(--star) / 0.1) 60%, transparent 80%)",
              filter: "blur(16px)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 2.2, 1.5], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.5 }}
          />

          {/* Main emoji — 3D sphere look */}
          <motion.div
            className="text-5xl z-10 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], rotate: [-180, 10, 0] }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            {/* Circular 3D backdrop behind emoji */}
            <div
              className="absolute inset-[-12px] rounded-full -z-10"
              style={{
                background: "radial-gradient(ellipse at 40% 30%, hsl(var(--star) / 0.3), hsl(var(--accent) / 0.15) 60%, transparent 80%)",
                boxShadow: "0 8px 32px hsl(var(--star) / 0.3), inset 0 2px 8px hsl(0 0% 100% / 0.2)",
              }}
            />
            {emoji}
          </motion.div>

          {/* XP badge — 3D pill */}
          {xp && (
            <motion.div
              className="absolute z-20 px-5 py-2 rounded-full"
              style={{
                background: "linear-gradient(145deg, hsl(var(--star)), hsl(var(--accent)))",
                boxShadow: "0 6px 20px hsl(var(--star) / 0.4), inset 0 -2px 4px hsl(var(--star) / 0.3), inset 0 2px 4px hsl(0 0% 100% / 0.3)",
              }}
              initial={{ y: 20, opacity: 0, scale: 0 }}
              animate={{ y: -55, opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <span className="font-display font-bold text-white text-lg flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />+{xp} XP
              </span>
            </motion.div>
          )}

          {/* Badge name label */}
          {badgeName && (
            <motion.div
              className="absolute z-20 px-4 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: "linear-gradient(145deg, hsl(var(--primary)), hsl(var(--secondary)))",
                boxShadow: "0 4px 16px hsl(var(--primary) / 0.3), inset 0 1px 3px hsl(0 0% 100% / 0.2)",
              }}
              initial={{ y: -20, opacity: 0, scale: 0 }}
              animate={{ y: 55, opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Trophy className="w-4 h-4 text-white" />
              <span className="font-display font-bold text-white text-sm">{badgeName}</span>
            </motion.div>
          )}

          {/* Orbiting stars — 3D shadows */}
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
              style={{ filter: "drop-shadow(0 3px 6px hsl(var(--star) / 0.4))" }}
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
