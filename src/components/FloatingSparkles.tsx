import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";

interface FloatingSparklesProps {
  count?: number;
  className?: string;
  /** Play subtle sparkle sounds synced with animations */
  withSound?: boolean;
  /** Sound interval in ms (default: 3000) */
  soundInterval?: number;
}

/**
 * FloatingSparkles - Ambient sparkle particles with optional synced sounds
 * When withSound is true, plays subtle sparkle chimes periodically
 */
const FloatingSparkles = ({ 
  count = 15, 
  className = "",
  withSound = false,
  soundInterval = 3000,
}: FloatingSparklesProps) => {
  const { playSparkleChime } = useMascotSounds();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play periodic sparkle sounds when enabled
  useEffect(() => {
    if (!withSound) return;

    // Play initial sound after a short delay
    const initialTimeout = setTimeout(() => {
      playSparkleChime();
    }, 1500);

    // Then play at intervals
    intervalRef.current = setInterval(() => {
      // Only play occasionally (30% chance) to keep it subtle
      if (Math.random() > 0.7) {
        playSparkleChime();
      }
    }, soundInterval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [withSound, soundInterval, playSparkleChime]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        >
          <span className="text-lg md:text-xl">
            {["✨", "⭐", "🌟", "💫"][Math.floor(Math.random() * 4)]}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingSparkles;