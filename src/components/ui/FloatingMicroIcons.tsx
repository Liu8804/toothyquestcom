import { motion } from "framer-motion";

interface FloatingMicroIconsProps {
  icons: string[];
  className?: string;
  /** How many icons to show at once */
  count?: number;
  /** Animation speed multiplier (higher = slower) */
  speed?: number;
  /** Size of the icons */
  iconSize?: "xs" | "sm" | "md";
}

const iconSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
};

/**
 * Subtle floating micro-icons that orbit around a parent element.
 * Place inside a relative container. Icons gently drift and fade in/out.
 */
const FloatingMicroIcons = ({
  icons,
  className = "",
  count = 3,
  speed = 1,
  iconSize = "xs",
}: FloatingMicroIconsProps) => {
  // Generate deterministic positions based on index
  const positions = Array.from({ length: count }, (_, i) => ({
    top: `${10 + ((i * 37) % 70)}%`,
    left: `${5 + ((i * 53) % 85)}%`,
    icon: icons[i % icons.length],
    delay: i * 0.6,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {positions.map((pos, i) => (
        <motion.span
          key={i}
          className={`absolute ${iconSizeClasses[iconSize]} opacity-0`}
          style={{ top: pos.top, left: pos.left }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            y: [4, -6, -10, -16],
            x: [0, i % 2 === 0 ? 3 : -3, 0],
            scale: [0.6, 1, 1, 0.6],
          }}
          transition={{
            duration: 3 * speed,
            repeat: Infinity,
            delay: pos.delay,
            ease: "easeInOut",
          }}
        >
          {pos.icon}
        </motion.span>
      ))}
    </div>
  );
};

export default FloatingMicroIcons;
