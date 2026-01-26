import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useCallback } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";

// Import all mascot pose images
import mascotFullPose from "@/assets/mascot-full-pose.png";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

export type MascotPoseType = "full" | "icon" | "badge" | "celebrating" | "brushing";

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

// Size configurations per pose type
const sizeMap = {
  xs: { class: "w-8 h-8", px: 32 },      // 32x32 - badge size
  sm: { class: "w-12 h-12", px: 48 },    // 48x48 - small UI
  md: { class: "w-24 h-24", px: 96 },    // 96x96 - medium
  lg: { class: "w-32 h-32", px: 128 },   // 128x128 - app icon
  xl: { class: "w-40 h-40", px: 160 },   // 160x160 - large
  "2xl": { class: "w-52 h-52", px: 208 }, // 208x208 - hero section (scaled from 1024)
};

// Get the correct image for each pose type
const getPoseImage = (pose: MascotPoseType): string => {
  switch (pose) {
    case "celebrating":
      return mascotCelebrating;
    case "full":
    case "icon":
    case "badge":
    case "brushing":
    default:
      return mascotFullPose;
  }
};

// Animation configs for each pose
const poseAnimations = {
  full: {
    idle: { y: [0, -8, 0] },
    hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
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
    idle: { x: [-3, 3, -3], rotate: [0, 3, -3, 0] },
    hover: { scale: 1.05 },
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
  const mascotImage = getPoseImage(pose);
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
        {/* Main mascot image with transparent background */}
        <img 
          src={mascotImage} 
          alt={`Toothy mascot - ${pose} pose`}
          className="w-full h-full object-contain drop-shadow-lg"
          style={{ imageRendering: "auto" }}
        />

        {/* Pose indicator badge for specific poses */}
        {pose === "brushing" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 text-lg bg-background rounded-full p-0.5 shadow-md"
          >
            🪥
          </motion.div>
        )}

        {/* Sparkles effect for celebrating and when enabled */}
        <AnimatePresence>
          {(showSparkles || pose === "celebrating") && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${5 + Math.random() * 90}%`,
                    left: `${5 + Math.random() * 90}%`,
                    fontSize: `${12 + Math.random() * 10}px`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [-5, -25],
                    rotate: [0, 180],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                >
                  {i % 2 === 0 ? "✨" : "⭐"}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Confetti for celebrating pose */}
        {pose === "celebrating" && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={`confetti-${i}`}
                className="absolute pointer-events-none text-sm"
                style={{
                  top: `${-10 + Math.random() * 30}%`,
                  left: `${10 + i * 15}%`,
                }}
                animate={{
                  y: [0, 100],
                  x: [0, (Math.random() - 0.5) * 30],
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {["🎊", "🎉", "✨", "⭐", "💫", "🌟"][i]}
              </motion.span>
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
});

MascotPose.displayName = "MascotPose";

export default MascotPose;
