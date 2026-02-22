import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  onComplete: () => void;
}

const EMOJIS = ["⭐", "🎉", "✨", "💎", "🏅", "🌟", "🎊", "💫"];

const HybridRewardBurst = ({ onComplete }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop glow */}
      <motion.div
        className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onComplete}
        style={{ pointerEvents: "auto" }}
      />

      {/* Central reward */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.3, 1], rotate: [-20, 10, 0] }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <div className="text-7xl">🎉</div>
        <motion.div
          className="px-6 py-2 bg-card/95 rounded-full shadow-float border border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="font-display font-bold text-foreground text-lg">+60 XP Earned!</span>
        </motion.div>
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[1, 2, 3].map(i => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, type: "spring" }}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Burst particles */}
      {EMOJIS.map((emoji, i) => {
        const angle = (i / EMOJIS.length) * Math.PI * 2;
        const dist = 120 + (i % 3) * 30;
        return (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.2, 0.6],
              opacity: [1, 1, 0],
              rotate: [0, 180 + i * 20],
            }}
            transition={{ duration: 1.2, delay: 0.2 + i * 0.05, ease: "easeOut" }}
          >
            {emoji}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default HybridRewardBurst;
