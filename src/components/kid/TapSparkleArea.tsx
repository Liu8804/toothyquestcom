import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
}

interface TapSparkleAreaProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
  sparkleEmojis?: string[];
  maxSparkles?: number;
  onTap?: (x: number, y: number) => void;
  /** Use ding sound instead of happy sound for quicker feedback */
  useDingSound?: boolean;
}

/**
 * TapSparkleArea - Wraps content and triggers sparkles/sounds on any tap
 * Makes the entire area feel interactive and rewarding for kids
 * Now synced with sparkle chime sounds for delightful audio-visual feedback
 */
const TapSparkleArea = ({
  children,
  className = "",
  enabled = true,
  sparkleEmojis = ["✨", "⭐", "💫", "🌟", "💖", "🎉"],
  maxSparkles = 6,
  onTap,
  useDingSound = false,
}: TapSparkleAreaProps) => {
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const nextIdRef = useRef(0);
  const { haptic } = useHapticFeedback();
  const { playHappy, playDing, playSparkleChime, playToothTapShine } = useMascotSounds();

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;
    
    // Get tap position relative to container
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
    
    // Create sparkle particles
    const newSparkles: SparkleParticle[] = [];
    for (let i = 0; i < maxSparkles; i++) {
      newSparkles.push({
        id: nextIdRef.current++,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        emoji: sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)],
        size: 0.8 + Math.random() * 0.6,
      });
    }
    
    setSparkles(prev => [...prev, ...newSparkles]);
    
    // Haptic feedback
    haptic("light");
    
    // Sound feedback synced with sparkle visuals
    if (useDingSound) {
      // Quick ding for tooth taps
      playDing();
      // Add sparkle chime occasionally for extra delight
      if (Math.random() > 0.5) {
        setTimeout(() => playToothTapShine(), 50);
      }
    } else {
      // Happy sound with occasional sparkle chime
      playHappy();
      if (Math.random() > 0.6) {
        setTimeout(() => playSparkleChime(), 80);
      }
    }
    
    // Clean up sparkles after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
    
    onTap?.(x, y);
  }, [enabled, maxSparkles, sparkleEmojis, haptic, playHappy, playDing, playSparkleChime, playToothTapShine, useDingSound, onTap]);

  return (
    <div 
      className={`relative ${className}`}
      onClick={handleTap}
    >
      {children}
      
      {/* Sparkle particles */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              fontSize: `${sparkle.size * 1.5}rem`,
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.5],
              y: [0, -40 - Math.random() * 30],
              x: (Math.random() - 0.5) * 40,
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {sparkle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TapSparkleArea;
