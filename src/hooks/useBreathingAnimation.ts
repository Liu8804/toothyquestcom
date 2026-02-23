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
      scaleY: [1, 1.02, 1],
      scaleX: [1, 0.99, 1],
    },
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  playful: {
    animate: {
      scaleY: [1, 1.03, 1],
      scaleX: [1, 0.98, 1],
      rotate: [0, 0.5, -0.5, 0],
    },
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  excited: {
    animate: {
      scaleY: [1, 1.04, 1],
      scaleX: [1, 0.97, 1],
      y: [0, -2, 0],
    },
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  subtle: {
    animate: {
      scaleY: [1, 1.01, 1],
      scaleX: [1, 0.995, 1],
    },
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const getBreathingAnimation = (style: BreathingStyle = "gentle") => {
  return breathingConfigs[style];
};

export default getBreathingAnimation;
