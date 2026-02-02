import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface PlayfulBackgroundProps {
  variant?: "bubbles" | "stars" | "rainbow" | "sparkles";
  intensity?: "light" | "medium" | "full";
}

/**
 * PlayfulBackground - Optimized animated background
 * Uses fewer elements and simpler animations for better performance
 */
const PlayfulBackground = ({
  variant = "bubbles",
  intensity = "light", // Changed default to light
}: PlayfulBackgroundProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  
  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Reduced counts for better performance
  const count = intensity === "light" ? 4 : intensity === "medium" ? 6 : 8;

  // Pre-compute elements
  const elements = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      id: i,
      left: 5 + i * (90 / count),
      size: 25 + (i % 3) * 15,
      delay: i * 1.2,
      duration: 10 + (i % 3) * 2,
    }));
  }, [count]);

  // Show only static gradient if reduced motion or hidden
  if (prefersReducedMotion || !isVisible) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute inset-0 ${
          variant === "stars"
            ? "bg-gradient-to-b from-sparkle/10 via-star/10 to-bubble/10"
            : "bg-gradient-to-b from-bubble/10 via-primary/5 to-mint/10"
        }`} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient */}
      <div className={`absolute inset-0 ${
        variant === "stars"
          ? "bg-gradient-to-b from-sparkle/10 via-star/10 to-bubble/10"
          : "bg-gradient-to-b from-bubble/10 via-primary/5 to-mint/10"
      }`} />

      {/* Simplified bubbles variant */}
      {variant === "bubbles" && elements.map((el) => (
        <motion.div
          key={`bubble-${el.id}`}
          className="absolute rounded-full bg-bubble/15 will-change-transform"
          style={{
            width: el.size,
            height: el.size,
            left: `${el.left}%`,
            bottom: "-10%",
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Simplified stars variant */}
      {variant === "stars" && elements.map((el) => (
        <motion.span
          key={`star-${el.id}`}
          className="absolute text-lg will-change-transform"
          style={{
            left: `${el.left}%`,
            top: `${15 + (el.id % 3) * 25}%`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: el.delay * 0.3,
          }}
        >
          {el.id % 2 === 0 ? "⭐" : "✨"}
        </motion.span>
      ))}
    </div>
  );
};

export default PlayfulBackground;
