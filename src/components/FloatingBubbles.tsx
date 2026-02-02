import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

export const FloatingBubbles = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  
  // Pause animations when tab is hidden
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Pre-compute bubbles to avoid re-computation
  const bubbles = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({ // Reduced from 8 to 5
      id: i,
      size: 25 + (i * 10),
      x: 10 + (i * 18),
      delay: i * 0.5,
      duration: 6 + i,
    })), 
  []);

  if (prefersReducedMotion || !isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-bubble/15 will-change-transform"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            bottom: "-5%",
          }}
          animate={{
            y: [0, -600],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBubbles;
