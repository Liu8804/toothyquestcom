import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useMemo, useState } from "react";

interface FloatingSparklesProps {
  count?: number;
  className?: string;
  /** Play subtle sparkle sounds synced with animations */
  withSound?: boolean;
  /** Sound interval in ms (default: 3000) */
  soundInterval?: number;
}

/**
 * FloatingSparkles - Optimized ambient sparkle particles
 * Reduced count and simplified animations for better performance
 */
const FloatingSparkles = ({ 
  count = 8, // Reduced default from 15
  className = "",
  withSound = false,
  soundInterval = 5000, // Increased from 3000
}: FloatingSparklesProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  
  // Disable when tab is not visible
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Pre-compute sparkle positions to avoid re-renders
  const sparkles = useMemo(() => {
    const emojis = ["✨", "⭐"];
    return [...Array(Math.min(count, 8))].map((_, i) => ({
      id: i,
      emoji: emojis[i % 2],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.4,
      duration: 5 + (i % 3),
    }));
  }, [count]);

  // Skip rendering if reduced motion is preferred or tab is hidden
  if (prefersReducedMotion || !isVisible) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute will-change-transform"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <span className="text-base">{sparkle.emoji}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingSparkles;