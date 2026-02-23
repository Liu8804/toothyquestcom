import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useCallback } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";

// Import the new kid-friendly sticker-style mascot assets (v2)
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import mascotPointing from "@/assets/mascot-sticker-pointing-v2.png";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";
import mascotSquare from "@/assets/mascot-sticker-square-v2.png";

export type MascotPoseType = "full" | "icon" | "badge" | "celebrating" | "brushing" | "waving" | "pointing";

interface MascotPoseProps {
  pose: MascotPoseType;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  animate?: boolean;
  className?: string;
  showSparkles?: boolean;
  enableSound?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}

// Size configurations
const sizeMap = {
  xs: { class: "w-8 h-8", px: 32 },
  sm: { class: "w-12 h-12", px: 48 },
  md: { class: "w-24 h-24", px: 96 },
  lg: { class: "w-32 h-32", px: 128 },
  xl: { class: "w-40 h-40", px: 160 },
  "2xl": { class: "w-52 h-52", px: 208 },
};

// Get the correct sticker image asset for each pose
const getPoseImage = (pose: MascotPoseType) => {
  switch (pose) {
    case "full":
      return mascotMain;
    case "waving":
      return mascotWaving;
    case "celebrating":
      return mascotCelebrating;
    case "brushing":
      return mascotMain; // Use main pose for brushing (has toothbrush)
    case "pointing":
      return mascotPointing;
    case "icon":
    case "badge":
      return mascotSquare;
    default:
      return mascotWaving;
  }
};

// Animation configs for each pose
const poseAnimations = {
  full: {
    idle: { y: [0, -8, 0] },
    hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
  },
  waving: {
    idle: { y: [0, -8, 0], rotate: [0, -3, 3, 0] },
    hover: { scale: 1.1 },
  },
  icon: {
    idle: {},
    hover: { scale: 1.05 },
  },
  badge: {
    idle: { scale: [1, 1.05, 1] },
    hover: { scale: 1.15 },
  },
  celebrating: {
    idle: { y: [0, -15, 0], rotate: [0, 5, -5, 0] },
    hover: { scale: 1.1 },
  },
  brushing: {
    idle: { x: [-2, 2, -2] },
    hover: { scale: 1.05 },
  },
  pointing: {
    idle: { y: [0, -5, 0] },
    hover: { scale: 1.1, x: 5 },
  },
};

const MascotPose = forwardRef<HTMLDivElement, MascotPoseProps>(({
  pose = "full",
  size = "md",
  animate = true,
  className = "",
  showSparkles = false,
  enableSound = true,
  onClick,
  onHover,
}, ref) => {
  const sizeConfig = sizeMap[size];
  const animation = poseAnimations[pose];
  const { playWave, playCheer, playHappy } = useMascotSounds();

  const handleClick = useCallback(() => {
    if (enableSound) {
      if (pose === "celebrating") {
        playCheer();
      } else {
        playHappy();
      }
    }
    onClick?.();
  }, [enableSound, pose, playCheer, playHappy, onClick]);

  const handleHover = useCallback(() => {
    if (enableSound) {
      playWave();
    }
    onHover?.();
  }, [enableSound, playWave, onHover]);

  return (
    <motion.div
      ref={ref}
      className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      onClick={handleClick}
      onHoverStart={handleHover}
      whileHover={animation.hover}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`${sizeConfig.class} relative`}
        animate={animate ? animation.idle : undefined}
        transition={{
          duration: pose === "celebrating" ? 1 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main mascot image - using correct pose asset */}
        <img 
          src={getPoseImage(pose)} 
          alt={`Toothy mascot - ${pose} pose`}
          className="w-full h-full object-contain image-3d"
          style={{ imageRendering: "auto" }}
        />

        {/* Sparkles effect for celebrating and when enabled */}
        <AnimatePresence>
          {(showSparkles || pose === "celebrating") && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: `${10 + Math.random() * 80}%`,
                    fontSize: `${10 + Math.random() * 8}px`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [-5, -20],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  {i % 2 === 0 ? "✨" : "⭐"}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

MascotPose.displayName = "MascotPose";

export default MascotPose;
