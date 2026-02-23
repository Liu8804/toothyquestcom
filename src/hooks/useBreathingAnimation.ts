/**
 * Reusable breathing/idle animation configs for character images.
 * Use with framer-motion's animate and transition props.
 */

export type BreathingStyle = "gentle" | "playful" | "excited" | "subtle";

interface BreathingConfig {
  animate: Record<string, number[]>;
  transition: Record<string, unknown>;
}

const breathingConfigs: Record<BreathingStyle, BreathingConfig> = {
  gentle: {
    animate: {
      scaleY: [1, 1.006, 1],
      scaleX: [1, 0.997, 1],
    },
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  playful: {
    animate: {
      scaleY: [1, 1.009, 1],
      scaleX: [1, 0.994, 1],
      rotate: [0, 0.15, -0.15, 0],
    },
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  excited: {
    animate: {
      scaleY: [1, 1.012, 1],
      scaleX: [1, 0.991, 1],
      y: [0, -0.6, 0],
    },
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  subtle: {
    animate: {
      scaleY: [1, 1.003, 1],
      scaleX: [1, 0.998, 1],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const getBreathingAnimation = (style: BreathingStyle = "gentle") => {
  return breathingConfigs[style];
};

export default getBreathingAnimation;
