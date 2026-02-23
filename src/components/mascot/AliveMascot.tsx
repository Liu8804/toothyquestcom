import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";
import { getBreathingAnimation } from "@/hooks/useBreathingAnimation";

export type AliveMascotState = "idle" | "waving" | "cheering" | "excited" | "sad" | "dirty";

interface AliveMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  state?: AliveMascotState;
  isDirty?: boolean;
  onTap?: () => void;
  showIdlePrompt?: boolean;
  autoSpeak?: string;
}

const sizeClasses = {
  sm: "w-24 h-24",
  md: "w-36 h-36",
  lg: "w-52 h-52",
  xl: "w-72 h-72",
};

/**
 * AliveMascot - An interactive, animated mascot that feels alive
 * Features:
 * - Idle animations (breathing, subtle movement)
 * - Tap reactions (wiggle, bounce, sparkles)
 * - Emotional states (happy, excited, sad, dirty)
 * - Sound effects on interactions
 * - Haptic feedback on mobile
 */
const AliveMascot = ({
  size = "lg",
  className = "",
  state = "idle",
  isDirty = false,
  onTap,
  showIdlePrompt = false,
}: AliveMascotProps) => {
  const { playWave, playCheer, playHappy } = useMascotSounds();
  const { haptic } = useHapticFeedback();
  
  const [currentAnimation, setCurrentAnimation] = useState<"idle" | "tap" | "wiggle" | "bounce" | "spin">("idle");
  const [showSparkles, setShowSparkles] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);

  // Get mascot image based on state
  const getMascotImage = () => {
    if (state === "cheering" || state === "excited") return mascotCelebrating;
    if (state === "waving") return mascotWaving;
    return mascotMain;
  };

  // Handle tap interaction
  const handleTap = useCallback(() => {
    haptic("light");
    setTapCount(prev => prev + 1);
    
    // Different reactions based on tap count
    const reactions = ["wiggle", "bounce", "spin"] as const;
    const reaction = reactions[tapCount % reactions.length];
    
    setCurrentAnimation(reaction);
    setShowSparkles(true);
    
    // Play appropriate sound
    if (tapCount % 3 === 0) {
      playCheer();
    } else if (tapCount % 3 === 1) {
      playWave();
    } else {
      playHappy();
    }
    
    // Reset animation after delay
    setTimeout(() => {
      setCurrentAnimation("idle");
      setShowSparkles(false);
    }, 800);
    
    onTap?.();
  }, [haptic, tapCount, playCheer, playWave, playHappy, onTap]);

  // Idle wiggle prompt after inactivity
  useEffect(() => {
    if (!showIdlePrompt) return;
    
    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      idleTimerRef.current = setTimeout(() => {
        setIsWiggling(true);
        playWave();
        
        setTimeout(() => setIsWiggling(false), 2000);
      }, 4000);
    };
    
    startIdleTimer();
    
    // Reset timer on any interaction
    const resetTimer = () => startIdleTimer();
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [showIdlePrompt, playWave]);

  // Animation variants with proper typing
  const getAnimationProps = () => {
    if (currentAnimation === "wiggle" || isWiggling) {
      return {
        animate: { 
          rotate: [0, -12, 12, -8, 8, -4, 4, 0],
          scale: [1, 1.05, 1.08, 1.05, 1.06, 1.03, 1.02, 1],
        },
        transition: { duration: 0.6, ease: "easeOut" as const } as const,
      };
    }
    if (currentAnimation === "bounce") {
      return {
        animate: { 
          y: [0, -25, -5, -15, 0],
          scale: [1, 1.1, 1.05, 1.08, 1],
        },
        transition: { duration: 0.5, ease: "easeOut" as const } as const,
      };
    }
    if (currentAnimation === "spin") {
      return {
        animate: { 
          rotate: [0, 360],
          scale: [1, 1.15, 1],
        },
        transition: { duration: 0.6, ease: "easeOut" as const } as const,
      };
    }
    // Idle breathing animation
    return {
      animate: { 
        y: [0, -5, 0],
        scale: [1, 1.02, 1],
      },
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const } as const,
    };
  };

  const { animate: animateValue, transition: transitionValue } = getAnimationProps();

  return (
    <motion.div 
      className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      onClick={handleTap}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect when excited/cheering */}
      {(state === "excited" || state === "cheering" || showSparkles) && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--star-gold) / 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
      
      {/* Idle wiggle glow prompt */}
      <AnimatePresence>
        {isWiggling && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.4, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/40 via-star/30 to-candy/40 blur-2xl"
          />
        )}
      </AnimatePresence>

      {/* Main mascot */}
      <motion.div 
        className={`${sizeClasses[size]} relative`}
        animate={animateValue}
        transition={transitionValue}
      >
        <motion.img
          src={getMascotImage()}
          alt="Toothy - Your friendly dental buddy"
          className={`w-full h-full object-contain drop-shadow-xl transition-all duration-300 ${
            isDirty ? "brightness-75 saturate-50 grayscale-[0.4]" : "brightness-105 saturate-110"
          }`}
          style={{
            filter: isDirty 
              ? "drop-shadow(0 10px 20px rgba(100,100,100,0.3))"
              : "drop-shadow(0 15px 30px rgba(0,0,0,0.2))",
          }}
          animate={getBreathingAnimation(state === "excited" || state === "cheering" ? "excited" : "subtle").animate}
          transition={getBreathingAnimation(state === "excited" || state === "cheering" ? "excited" : "subtle").transition}
        />
        
        {/* Sparkle effects on tap */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute pointer-events-none text-xl"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0],
                    y: [-5, -30],
                    rotate: [0, 180],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                  }}
                >
                  {["✨", "⭐", "💫", "🌟"][i % 4]}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
        
        {/* Tap hint pulse when wiggling */}
        <AnimatePresence>
          {isWiggling && (
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: [0, -5, 0],
                scale: [1, 1.05, 1],
              }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              👆 Tap me!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AliveMascot;
