import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useTapSpeak } from "@/hooks/useAutoSpeak";

interface DirtyToCleanMascotProps {
  onTransformComplete?: () => void;
  size?: "sm" | "md" | "lg";
  showHint?: boolean;
}

/**
 * Dirty-to-Clean Mascot Transformation
 * - Starts dirty/dull with sad expression
 * - One tap transforms to sparkly/happy
 * - Celebration sound and confetti on transformation
 * 
 * For non-readers ages 3-6
 */
const DirtyToCleanMascot = ({
  onTransformComplete,
  size = "lg",
  showHint = true,
}: DirtyToCleanMascotProps) => {
  const [isClean, setIsClean] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const { playFirstTap, playCelebrate, playSparkle } = useMascotSounds();
  const { haptic, success } = useHapticFeedback();
  const { speak } = useTapSpeak();

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
  };

  const handleTap = useCallback(() => {
    if (isClean) {
      // Already clean - play happy sound on tap
      playSparkle();
      haptic("light");
      speak("Yay! You made me sparkle!");
      return;
    }

    // Transform from dirty to clean!
    setIsClean(true);
    success();
    haptic("heavy");
    playFirstTap();
    
    // Add sparkle burst
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.cos((i * 30 * Math.PI) / 180) * 80,
      y: Math.sin((i * 30 * Math.PI) / 180) * 80,
    }));
    setSparkles(newSparkles);

    // Show confetti
    setTimeout(() => {
      setShowConfetti(true);
      playCelebrate();
    }, 200);

    // Speak celebration
    setTimeout(() => {
      speak("Yay! You made me sparkle! Let's brush our teeth!");
    }, 500);

    // Clean up
    setTimeout(() => {
      setSparkles([]);
      setShowConfetti(false);
      onTransformComplete?.();
    }, 2500);
  }, [isClean, playFirstTap, playCelebrate, playSparkle, haptic, success, speak, onTransformComplete]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Tap hint for dirty mascot */}
      {showHint && !isClean && (
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="bg-star/90 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg whitespace-nowrap"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            👆 Tap me!
          </motion.div>
        </motion.div>
      )}

      {/* Pulsing ring hint */}
      {!isClean && (
        <motion.div
          className="absolute inset-0 -m-4 rounded-full border-4 border-star/50"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Mascot container */}
      <motion.button
        onClick={handleTap}
        className={`relative ${sizeClasses[size]} cursor-pointer touch-manipulation`}
        whileTap={{ scale: 0.95 }}
        animate={isClean ? { scale: [1, 1.1, 1] } : { y: [0, -5, 0] }}
        transition={{ duration: isClean ? 0.5 : 2, repeat: isClean ? 0 : Infinity }}
      >
        {/* Dirty overlay (grayscale + dull) */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: isClean ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={mascotWaving}
            alt="Toothy needs help"
            className="w-full h-full object-contain filter grayscale brightness-75 contrast-90"
          />
          {/* Sad overlay indicator */}
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            😢
          </motion.div>
        </motion.div>

        {/* Clean mascot (revealed on tap) */}
        <AnimatePresence>
          {isClean && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <img
                src={mascotCelebrating}
                alt="Toothy is happy!"
                className="w-full h-full object-contain drop-shadow-lg"
              />
              {/* Happy indicator */}
              <motion.div
                className="absolute top-0 right-0 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2 }}
              >
                🌟
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle burst */}
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="absolute text-2xl pointer-events-none"
              style={{ left: "50%", top: "50%", marginLeft: -12, marginTop: -12 }}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, x: sparkle.x, y: sparkle.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              ✨
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Clean glow ring */}
        {isClean && (
          <motion.div
            className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-star/30 via-mint/30 to-bubble/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.3] }}
            transition={{ duration: 1, repeat: 2 }}
          />
        )}
      </motion.button>

      {/* Confetti explosion */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#DDA0DD"][i % 5],
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200 - 50,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.5, delay: i * 0.03 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text (icon-based for non-readers) */}
      <motion.div
        className="mt-4 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isClean ? (
          <motion.div
            className="flex items-center gap-2 text-primary font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-2xl">⭐</span>
            <span className="text-2xl">🦷</span>
            <span className="text-2xl">⭐</span>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-1 text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xl">👆</span>
            <span className="text-xl">🦷</span>
            <span className="text-xl">✨</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DirtyToCleanMascot;
