import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useCallback } from "react";
import toothyMascot from "@/assets/toothy-mascot-new.jpeg";
import { useMascotSounds } from "@/hooks/useMascotSounds";

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

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
  "2xl": "w-52 h-52",
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
    hover: { scale: 1.1 },
  },
  celebrating: {
    idle: { y: [0, -15, 0], rotate: [0, 5, -5, 0] },
    hover: { scale: 1.1 },
  },
  brushing: {
    idle: { x: [-2, 2, -2], rotate: [0, 3, -3, 0] },
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
  const sizeClass = sizeMap[size];
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
      className={`relative inline-flex items-center justify-center ${className}`}
      onClick={handleClick}
      onHoverStart={handleHover}
      whileHover={animation.hover}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`${sizeClass} relative`}
        animate={animate ? animation.idle : undefined}
        transition={{
          duration: pose === "celebrating" ? 1 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main mascot image - using the actual Toothy mascot */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-white shadow-float overflow-hidden">
          <img 
            src={toothyMascot} 
            alt="Toothy mascot"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Pose indicator badge */}
        {pose !== "full" && pose !== "icon" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 text-xl"
          >
            {pose === "celebrating" && "🎉"}
            {pose === "brushing" && "🪥"}
            {pose === "badge" && "⭐"}
          </motion.div>
        )}

        {/* Sparkles effect */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-star pointer-events-none"
                  style={{
                    top: `${10 + Math.random() * 80}%`,
                    left: `${10 + Math.random() * 80}%`,
                    fontSize: `${10 + Math.random() * 8}px`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [-5, -20],
                    rotate: [0, 180],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  ✨
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
