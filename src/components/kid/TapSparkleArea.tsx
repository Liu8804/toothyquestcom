import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef, useMemo } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface TapSparkleAreaProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
  sparkleEmojis?: string[];
  maxSparkles?: number;
  onTap?: (x: number, y: number) => void;
  useDingSound?: boolean;
}

/**
 * TapSparkleArea - Optimized version with reduced particles
 */
const TapSparkleArea = ({
  children,
  className = "",
  enabled = true,
  sparkleEmojis = ["✨", "⭐", "🌟"],
  maxSparkles = 3, // Reduced from 6
  onTap,
}: TapSparkleAreaProps) => {
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const nextIdRef = useRef(0);
  const lastTapRef = useRef(0);
  const { haptic } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;
    
    // Throttle taps to prevent excessive sparkles
    const now = Date.now();
    if (now - lastTapRef.current < 150) return;
    lastTapRef.current = now;
    
    // Get tap position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Haptic only
    haptic("light");
    
    // Skip sparkles if reduced motion
    if (prefersReducedMotion) {
      onTap?.(x, y);
      return;
    }
    
    // Create fewer sparkle particles
    const newSparkles: SparkleParticle[] = [];
    const sparkleCount = Math.min(maxSparkles, 3);
    for (let i = 0; i < sparkleCount; i++) {
      newSparkles.push({
        id: nextIdRef.current++,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        emoji: sparkleEmojis[i % sparkleEmojis.length],
      });
    }
    
    setSparkles(prev => [...prev.slice(-6), ...newSparkles]); // Keep max 9 total
    
    // Clean up after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 800);
    
    onTap?.(x, y);
  }, [enabled, maxSparkles, sparkleEmojis, haptic, prefersReducedMotion, onTap]);

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleTap}
    >
      {children}
      
      {/* Sparkle particles - simplified */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="absolute pointer-events-none z-50 text-xl will-change-transform"
            style={{ left: sparkle.x, top: sparkle.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              y: -30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {sparkle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TapSparkleArea;
