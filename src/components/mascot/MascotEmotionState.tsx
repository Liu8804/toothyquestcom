import { motion, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";
import { getBreathingAnimation } from "@/hooks/useBreathingAnimation";

// Import all mascot emotion images
import mascotWow from "@/assets/mascot-emotions/wow.png";
import mascotGreatJob from "@/assets/mascot-emotions/great-job.png";
import mascotOops from "@/assets/mascot-emotions/oops.png";
import mascotGotIt from "@/assets/mascot-emotions/got-it.png";
import mascotHelp from "@/assets/mascot-emotions/help.png";
import mascotLoading from "@/assets/mascot-emotions/loading.png";
import mascotLetsPlay from "@/assets/mascot-emotions/lets-play.png";
import mascotLevelUp from "@/assets/mascot-emotions/level-up.png";
import mascotPlayQuit from "@/assets/mascot-emotions/play-quit.png";

// Also keep fallback to existing assets
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

export type MascotEmotion = 
  | "idle"
  | "wow"
  | "greatJob"
  | "oops"
  | "gotIt"
  | "help"
  | "loading"
  | "letsPlay"
  | "levelUp"
  | "playQuit"
  | "celebrating"
  | "waving";

interface MascotEmotionStateProps {
  emotion: MascotEmotion;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  animate?: boolean;
  className?: string;
  showSparkles?: boolean;
  onClick?: () => void;
}

// Size configurations
const sizeMap = {
  xs: "w-12 h-12",
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
  "2xl": "w-56 h-56",
};

// Get the correct mascot image for each emotion
const getEmotionImage = (emotion: MascotEmotion): string => {
  switch (emotion) {
    case "wow":
      return mascotWow;
    case "greatJob":
      return mascotGreatJob;
    case "oops":
      return mascotOops;
    case "gotIt":
      return mascotGotIt;
    case "help":
      return mascotHelp;
    case "loading":
      return mascotLoading;
    case "letsPlay":
      return mascotLetsPlay;
    case "levelUp":
      return mascotLevelUp;
    case "playQuit":
      return mascotPlayQuit;
    case "celebrating":
      return mascotCelebrating;
    case "waving":
      return mascotWaving;
    case "idle":
    default:
      return mascotWaving;
  }
};

// Animation configs for each emotion
const emotionAnimations: Record<MascotEmotion, { animate: object; transition: object }> = {
  idle: {
    animate: { y: [0, -3, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  wow: {
    animate: { scale: [1, 1.02, 1], rotate: [0, -0.6, 0.6, 0] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  greatJob: {
    animate: { y: [0, -2, 0], scale: [1, 1.012, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  oops: {
    animate: { x: [-0.6, 0.6, -0.6], rotate: [-0.3, 0.3, -0.3] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
  },
  gotIt: {
    animate: { y: [0, -1.5, 0], scale: [1, 1.015, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  help: {
    animate: { scale: [1, 1.025, 1], y: [0, -1.5, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  loading: {
    animate: { rotate: [0, 1.5, -1.5, 0], y: [0, -1, 0] },
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  letsPlay: {
    animate: { scale: [1, 1.012, 1], rotate: [0, 0.6, -0.6, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  levelUp: {
    animate: { y: [0, -3, 0], scale: [1, 1.02, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" },
  },
  playQuit: {
    animate: { y: [0, -1, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  celebrating: {
    animate: { y: [0, -2.5, 0], rotate: [0, 1, -1, 0], scale: [1, 1.012, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  waving: {
    animate: { y: [0, -2.5, 0], rotate: [0, -1, 1, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const MascotEmotionState = forwardRef<HTMLDivElement, MascotEmotionStateProps>(({
  emotion = "idle",
  size = "lg",
  animate = true,
  className = "",
  showSparkles = false,
  onClick,
}, ref) => {
  const sizeClass = sizeMap[size];
  const animationConfig = emotionAnimations[emotion];
  const imageSrc = getEmotionImage(emotion);

  // Determine if this is a celebratory emotion for extra effects
  const isCelebratory = ["wow", "greatJob", "levelUp", "celebrating"].includes(emotion);

  return (
    <motion.div
      ref={ref}
      className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          className={`relative ${sizeClass}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={animate ? { 
            opacity: 1, 
            scale: 1,
            ...animationConfig.animate 
          } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={animationConfig.transition}
        >
          {/* Main mascot image with breathing */}
          <motion.img 
            src={imageSrc} 
            alt={`Toothy mascot - ${emotion} emotion`}
            className="w-full h-full object-contain drop-shadow-lg"
            style={{ imageRendering: "auto" }}
            animate={getBreathingAnimation(isCelebratory ? "excited" : "gentle").animate}
            transition={getBreathingAnimation(isCelebratory ? "excited" : "gentle").transition}
          />

          {/* Sparkles for celebratory emotions */}
          {(showSparkles || isCelebratory) && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute pointer-events-none text-lg"
                  style={{
                    top: `${5 + Math.random() * 90}%`,
                    left: `${5 + Math.random() * 90}%`,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0.8, 1, 0.8],
                    y: [-2, -10],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {i % 3 === 0 ? "✨" : i % 3 === 1 ? "⭐" : "🌟"}
                </motion.span>
              ))}
            </>
          )}

          {/* Pulsing glow ring for celebratory states */}
          {isCelebratory && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
              }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Wobble effect for oops */}
          {emotion === "oops" && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl"
              animate={{ y: [0, -5, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              😅
            </motion.div>
          )}

          {/* Loading spinner overlay */}
          {emotion === "loading" && (
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-primary via-sunny-orange to-star-gold rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full w-1/3 bg-white/50 rounded-full"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

MascotEmotionState.displayName = "MascotEmotionState";

export default MascotEmotionState;
