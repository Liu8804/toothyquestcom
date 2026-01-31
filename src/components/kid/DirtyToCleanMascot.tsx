import { useState, useCallback, useEffect } from "react";
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
 * - Idle breathing + subtle shake animations
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
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [isWiggling, setIsWiggling] = useState(false);
  
  const { playFirstTap, playCelebrate, playSparkle, playWave } = useMascotSounds();
  const { haptic, success } = useHapticFeedback();
  const { speak } = useTapSpeak();

  const sizeClasses = {
    sm: "w-28 h-28",
    md: "w-40 h-40",
    lg: "w-56 h-56",
  };

  // Idle wiggle prompt after 4 seconds of inactivity
  useEffect(() => {
    if (isClean) return;
    
    const wiggleTimer = setInterval(() => {
      setIsWiggling(true);
      playWave();
      setTimeout(() => setIsWiggling(false), 1500);
    }, 5000);

    return () => clearInterval(wiggleTimer);
  }, [isClean, playWave]);

  const handleTap = useCallback(() => {
    if (isClean) {
      // Already clean - play happy sound on tap
      playSparkle();
      haptic("light");
      speak("Yay! You made me sparkle!");
      
      // Add mini sparkle burst
      const miniSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.cos((i * 60 * Math.PI) / 180) * 50,
        y: Math.sin((i * 60 * Math.PI) / 180) * 50,
        emoji: ["✨", "⭐", "💫"][i % 3],
      }));
      setSparkles(miniSparkles);
      setTimeout(() => setSparkles([]), 800);
      return;
    }

    // Transform from dirty to clean!
    setIsClean(true);
    success();
    haptic("heavy");
    playFirstTap();
    
    // Add big sparkle burst with varied emojis
    const newSparkles = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.cos((i * 22.5 * Math.PI) / 180) * 100,
      y: Math.sin((i * 22.5 * Math.PI) / 180) * 100,
      emoji: ["✨", "⭐", "💫", "🌟", "💖", "🎉", "🌈", "🦷"][i % 8],
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
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="bg-gradient-to-r from-star to-secondary text-white px-5 py-2.5 rounded-full font-bold text-base shadow-lg shadow-star/30 whitespace-nowrap"
            animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            👆 Tap me!
          </motion.div>
        </motion.div>
      )}

      {/* Multiple pulsing ring hints */}
      {!isClean && (
        <>
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border-4 border-star/60"
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 -m-10 rounded-full border-2 border-secondary/40"
            animate={{ scale: [1.1, 1.3, 1.1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Mascot container */}
      <motion.button
        onClick={handleTap}
        className={`relative ${sizeClasses[size]} cursor-pointer touch-manipulation`}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        animate={
          isClean 
            ? { scale: [1, 1.08, 1], y: [0, -8, 0] } 
            : isWiggling 
              ? { rotate: [0, -10, 10, -8, 8, -4, 4, 0], scale: [1, 1.05, 1.08, 1.05, 1] }
              : { y: [0, -6, 0], scale: [1, 1.02, 1] }
        }
        transition={{ 
          duration: isClean ? 0.6 : isWiggling ? 0.8 : 2.5, 
          repeat: isClean ? 2 : isWiggling ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Dirty overlay (grayscale + dull) */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: isClean ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={mascotWaving}
            alt="Toothy needs help"
            className="w-full h-full object-contain filter grayscale brightness-70 contrast-90 saturate-50"
            style={{
              filter: "grayscale(1) brightness(0.7) contrast(0.9) saturate(0.5) drop-shadow(0 8px 16px rgba(80,80,80,0.3))",
            }}
          />
          {/* Sad overlay indicator with bounce */}
          <motion.div
            className="absolute top-0 right-0 text-3xl"
            animate={{ y: [0, 4, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            😢
          </motion.div>
          {/* Dirt specks */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-700/50"
              style={{
                top: `${25 + i * 12}%`,
                left: `${20 + (i * 15) % 60}%`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>

        {/* Clean mascot (revealed on tap) */}
        <AnimatePresence>
          {isClean && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 15 }}
            >
              <img
                src={mascotCelebrating}
                alt="Toothy is happy!"
                className="w-full h-full object-contain brightness-110 saturate-125"
                style={{
                  filter: "brightness(1.1) saturate(1.25) drop-shadow(0 12px 24px rgba(0,0,0,0.2))",
                }}
              />
              {/* Happy indicator with spin */}
              <motion.div
                className="absolute -top-2 -right-2 text-3xl"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.5, 1], rotate: [0, 360] }}
                transition={{ duration: 0.6 }}
              >
                🌟
              </motion.div>
              {/* Crown sparkle */}
              <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 1, 1, 0], y: [10, -15], scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                ✨
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
              animate={{ opacity: [1, 1, 0], scale: [0, 1.8, 1], x: sparkle.x, y: sparkle.y, rotate: [0, 180] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {sparkle.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Clean glow ring - more vibrant */}
        {isClean && (
          <>
            <motion.div
              className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-star/40 via-mint/40 to-bubble/40 blur-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.4, 1.5] }}
              transition={{ duration: 1.2, repeat: 2 }}
            />
            <motion.div
              className="absolute inset-0 -m-3 rounded-full border-4 border-primary/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.9, 1.3, 1.4] }}
              transition={{ duration: 1, repeat: 2, delay: 0.2 }}
            />
          </>
        )}
      </motion.button>

      {/* Confetti explosion - more particles, varied shapes */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 30 }, (_, i) => (
              <motion.div
                key={i}
                className={`absolute ${i % 3 === 0 ? 'w-4 h-4 rounded-full' : i % 3 === 1 ? 'w-3 h-3 rotate-45' : 'w-2 h-5 rounded-full'}`}
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: [
                    "hsl(var(--primary))",
                    "hsl(var(--secondary))",
                    "hsl(var(--star-gold))",
                    "hsl(var(--mint-fresh))",
                    "hsl(var(--candy-pink))",
                    "hsl(var(--sparkle-purple))",
                  ][i % 6],
                }}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 280,
                  y: (Math.random() - 0.5) * 280 - 80,
                  scale: [0, 1.2, 0.6],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1.8, delay: i * 0.02, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status indicator (icon-based for non-readers) */}
      <motion.div
        className="mt-6 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isClean ? (
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-star/20 px-4 py-2 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <motion.span 
              className="text-3xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🦷
            </motion.span>
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              ⭐
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              👆
            </motion.span>
            <span className="text-2xl">🦷</span>
            <motion.span 
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DirtyToCleanMascot;
