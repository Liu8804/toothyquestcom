import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
  popped: boolean;
}

interface InteractiveBubblesProps {
  isActive: boolean;
  onBubblePop?: () => void;
}

const BUBBLE_EMOJIS = ["✨", "⭐", "🌟"];
const SPAWN_INTERVAL = 5000; // Increased from 3500
const BUBBLE_LIFETIME = 5000; // Increased from 4000
const MAX_BUBBLES = 3; // Limit concurrent bubbles

const InteractiveBubbles = ({ isActive, onBubblePop }: InteractiveBubblesProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const { haptic } = useHapticFeedback();

  // Pre-compute random positions
  const getRandomPosition = useCallback(() => ({
    x: 15 + Math.random() * 70,
    y: 25 + Math.random() * 50,
    size: 45 + Math.random() * 20,
    emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)],
  }), []);

  // Spawn bubbles periodically
  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setBubbles([]);
      return;
    }

    const spawnBubble = () => {
      setBubbles(prev => {
        // Limit max bubbles for performance
        if (prev.length >= MAX_BUBBLES) return prev;
        
        const pos = getRandomPosition();
        const newBubble: Bubble = {
          id: Date.now(),
          ...pos,
          popped: false,
        };
        return [...prev, newBubble];
      });
    };

    // Initial spawn
    const initialTimeout = setTimeout(spawnBubble, 1500);
    const interval = setInterval(spawnBubble, SPAWN_INTERVAL);

    // Auto-cleanup old bubbles
    const cleanup = setInterval(() => {
      setBubbles(prev => prev.filter(b => !b.popped));
    }, BUBBLE_LIFETIME);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, [isActive, prefersReducedMotion, getRandomPosition]);

  const handleBubblePop = useCallback((bubbleId: number) => {
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    haptic("light");
    onBubblePop?.();
  }, [haptic, onBubblePop]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut",
            }}
            className="absolute pointer-events-auto touch-manipulation cursor-pointer will-change-transform"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            onClick={() => handleBubblePop(bubble.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleBubblePop(bubble.id);
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/25 to-secondary/25 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/40">
              <span className="text-xl">{bubble.emoji}</span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveBubbles;
