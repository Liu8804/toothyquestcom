import { motion } from "framer-motion";
import toothyMascot from "@/assets/toothy-mascot.png";

export type MascotMood = "idle" | "happy" | "excited" | "cheering" | "waving";

interface ToothyMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
  mood?: MascotMood;
  showTip?: boolean;
  tipMessage?: string;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

const moodAnimations = {
  idle: { y: [0, -10, 0] as number[] },
  happy: { y: [0, -8, 0] as number[], scale: [1, 1.05, 1] as number[] },
  excited: { y: [0, -15, 0] as number[], rotate: [0, 5, -5, 0] as number[], scale: [1, 1.1, 1] as number[] },
  cheering: { y: [0, -20, 0] as number[], rotate: [0, 10, -10, 0] as number[] },
  waving: { rotate: [0, 15, -15, 0] as number[] },
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
}: ToothyMascotProps) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Speech bubble tip */}
      {showTip && tipMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-card rounded-2xl shadow-card max-w-[200px]"
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-card" />
          <p className="text-sm font-medium text-foreground text-center">{tipMessage}</p>
        </motion.div>
      )}

      <motion.div
        className={sizeClasses[size]}
        animate={animate ? moodAnimations[mood] : undefined}
        transition={{
          duration: mood === "excited" || mood === "cheering" ? 1 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.img
          src={toothyMascot}
          alt="Toothy - Your friendly dental buddy"
          className="w-full h-full object-contain drop-shadow-lg"
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        />

        {/* Mood emoji indicator */}
        {mood !== "idle" && moodEmojis[mood] && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <motion.span
              className="text-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {moodEmojis[mood]}
            </motion.span>
          </motion.div>
        )}

        {/* Sparkles for excited/cheering moods */}
        {(mood === "excited" || mood === "cheering") && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [-5, -15],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ToothyMascot;
