import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMascotSounds } from "@/hooks/useMascotSounds";
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

const BUBBLE_EMOJIS = ["✨", "⭐", "🌟", "💫", "🫧", "💎"];
const SPAWN_INTERVAL = 3500; // Spawn every 3.5 seconds
const BUBBLE_LIFETIME = 4000; // Bubbles last 4 seconds

const InteractiveBubbles = ({ isActive, onBubblePop }: InteractiveBubblesProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const { playSparkle, playCheer } = useMascotSounds();
  const { haptic } = useHapticFeedback();

  // Spawn bubbles periodically
  useEffect(() => {
    if (!isActive) {
      setBubbles([]);
      return;
    }

    const spawnBubble = () => {
      const newBubble: Bubble = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80, // 10-90% from left
        y: 20 + Math.random() * 60, // 20-80% from top
        size: 40 + Math.random() * 30, // 40-70px
        emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)],
        popped: false,
      };
      setBubbles((prev) => [...prev, newBubble]);

      // Auto-remove after lifetime
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, BUBBLE_LIFETIME);
    };

    // Spawn initial bubble after a short delay
    const initialTimeout = setTimeout(spawnBubble, 1000);
    
    // Then spawn at intervals
    const interval = setInterval(spawnBubble, SPAWN_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isActive]);

  const handleBubblePop = useCallback(
    (bubbleId: number) => {
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubbleId ? { ...b, popped: true } : b))
      );
      haptic("light");
      playSparkle();
      
      // Occasionally play cheer for extra delight
      if (Math.random() > 0.7) {
        setTimeout(() => playCheer(), 100);
      }

      onBubblePop?.();

      // Remove after pop animation
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
      }, 300);
    },
    [haptic, playSparkle, playCheer, onBubblePop]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              bubble.popped
                ? { opacity: 0, scale: 1.5 }
                : { opacity: 1, scale: [0.8, 1.1, 1], y: [0, -10, 0] }
            }
            exit={{ opacity: 0, scale: 0 }}
            transition={
              bubble.popped
                ? { duration: 0.3 }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute pointer-events-auto touch-manipulation cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            onClick={() => !bubble.popped && handleBubblePop(bubble.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              if (!bubble.popped) handleBubblePop(bubble.id);
            }}
          >
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/50"
              whileTap={{ scale: 0.8 }}
              animate={
                !bubble.popped
                  ? { rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-2xl">{bubble.emoji}</span>
            </motion.div>

            {/* Pop effect */}
            {bubble.popped && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 0.8,
                      x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 30,
                    }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center text-sm"
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveBubbles;
