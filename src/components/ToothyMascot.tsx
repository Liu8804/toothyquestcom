import { motion, useAnimation } from "framer-motion";
import { useState, useCallback } from "react";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

export type MascotMood = "idle" | "happy" | "excited" | "cheering" | "waving";

interface ToothyMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
  mood?: MascotMood;
  showTip?: boolean;
  tipMessage?: string;
  onTap?: () => void;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

const moodAnimations = {
  idle: { y: [0, -8, 0], rotate: [0, 1, -1, 0] },
  happy: { y: [0, -8, 0], scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] },
  excited: { y: [0, -15, 0], rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] },
  cheering: { y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.12, 1] },
  waving: { rotate: [0, 15, -15, 0], y: [0, -4, 0] },
};

const moodEmojis: Record<MascotMood, string> = {
  idle: "",
  happy: "😊",
  excited: "🤩",
  cheering: "🎉",
  waving: "👋",
};

export const ToothyMascot = ({
  size = "md",
  className = "",
  animate = true,
  mood = "idle",
  showTip = false,
  tipMessage = "Keep brushing!",
  onTap,
}: ToothyMascotProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const controls = useAnimation();

  const getMascotImage = () => {
    if (mood === "cheering" || mood === "excited") return mascotCelebrating;
    return mascotWaving;
  };

  const handleTap = useCallback(() => {
    setIsTapped(true);
    controls.start({
      scale: [1, 1.2, 0.9, 1.05, 1],
      rotate: [0, -10, 10, -5, 0],
      transition: { duration: 0.5 },
    });
    onTap?.();
    setTimeout(() => setIsTapped(false), 600);
  }, [controls, onTap]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Speech bubble tip */}
      {showTip && tipMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-card rounded-2xl shadow-card border-2 border-border max-w-[200px]"
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-card" />
          <p className="text-sm font-bold text-foreground text-center">{tipMessage}</p>
        </motion.div>
      )}

      <motion.div
        className={`${sizeClasses[size]} cursor-pointer`}
        animate={animate ? moodAnimations[mood] : undefined}
        transition={{
          duration: mood === "excited" || mood === "cheering" ? 0.8 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        onTap={handleTap}
      >
        <motion.img
          src={getMascotImage()}
          alt="Toothy - Your friendly dental buddy"
          className="w-full h-full object-contain image-3d"
          animate={controls}
          whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
          transition={{ duration: 0.3 }}
        />

        {/* Mood emoji indicator with pop-in */}
        {mood !== "idle" && moodEmojis[mood] && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <motion.span
              className="text-lg"
              animate={{ 
                scale: [1, 1.3, 1],
                y: [0, -4, 0],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {moodEmojis[mood]}
            </motion.span>
          </motion.div>
        )}

        {/* Tap reaction burst */}
        {isTapped && (
          <>
            {["⭐", "✨", "💫"].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-lg pointer-events-none"
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: [1, 0],
                  scale: [0, 1.5],
                  x: (i - 1) * 30,
                  y: -30 - i * 10,
                }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ top: "20%", left: "40%" }}
              >
                {emoji}
              </motion.span>
            ))}
          </>
        )}

        {/* Sparkles for excited/cheering moods */}
        {(mood === "excited" || mood === "cheering") && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-sm pointer-events-none"
                style={{
                  top: `${15 + Math.sin(i * 1.2) * 35}%`,
                  left: `${15 + Math.cos(i * 1.2) * 35}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  y: [-5, -20],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.18,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </motion.div>

      {/* Glow ring under character */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-primary/15 blur-sm -z-10"
        animate={{
          scaleX: mood === "excited" || mood === "cheering" ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

export default ToothyMascot;
