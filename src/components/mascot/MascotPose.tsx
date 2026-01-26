import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useCallback } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import toothyMascot from "@/assets/toothy-mascot-new.jpeg";

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

// Size configurations matching the specified requirements:
// - badge/small_ui: 32-64px
// - icon/app_icon: 64-128px  
// - full/full_pose: scaled from 1024px
// - celebrating/brushing: scaled from 512px
const sizeMap = {
  xs: { class: "w-8 h-8", px: 32 },      // 32x32 - small_ui badge
  sm: { class: "w-12 h-12", px: 48 },    // 48x48 - small UI  
  md: { class: "w-24 h-24", px: 96 },    // 96x96 - medium
  lg: { class: "w-32 h-32", px: 128 },   // 128x128 - app icon
  xl: { class: "w-40 h-40", px: 160 },   // 160x160 - large
  "2xl": { class: "w-52 h-52", px: 208 }, // 208x208 - hero section
};

// Animation configs for each pose as specified:
// - full: wave/bounce animation
// - celebrating: 3-5 frames jumping, arms raised
// - brushing: 1-2 frame animation or static
const poseAnimations = {
  full: {
    idle: { y: [0, -8, 0] }, // Slight wave/bounce
    hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
  },
  icon: {
    idle: {},
    hover: { scale: 1.05 },
  },
  badge: {
    idle: { scale: [1, 1.05, 1] }, // Tiny sparkle effect
    hover: { scale: 1.15 },
  },
  celebrating: {
    idle: { y: [0, -15, 0], rotate: [0, 5, -5, 0] }, // Jumping animation
    hover: { scale: 1.1 },
  },
  brushing: {
    idle: { x: [-2, 2, -2] }, // Brushing motion
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
        {/* Main mascot image - using toothy-mascot-new.jpeg */}
        <img 
          src={toothyMascot} 
          alt={`Toothy mascot - ${pose} pose`}
          className="w-full h-full object-contain drop-shadow-lg rounded-full"
          style={{ imageRendering: "auto" }}
        />

        {/* Pose indicator for brushing */}
        {pose === "brushing" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 text-lg bg-background rounded-full p-0.5 shadow-md"
          >
            🪥
          </motion.div>
        )}

        {/* Celebrating indicator */}
        {pose === "celebrating" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 text-lg"
          >
            🎉
          </motion.div>
        )}

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

        {/* Confetti for celebrating pose */}
        {pose === "celebrating" && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={`confetti-${i}`}
                className="absolute pointer-events-none text-sm"
                style={{
                  top: `${-10 + Math.random() * 20}%`,
                  left: `${15 + i * 20}%`,
                }}
                animate={{
                  y: [0, 80],
                  x: [0, (Math.random() - 0.5) * 20],
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              >
                {["🎊", "🎉", "✨", "⭐"][i]}
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