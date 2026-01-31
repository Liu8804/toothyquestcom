import { ReactNode, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoSpeak } from "@/hooks/useAutoSpeak";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import PlayfulBackground from "./PlayfulBackground";
import TapSparkleArea from "./TapSparkleArea";

interface KidScreenProps {
  children: ReactNode;
  /** Voice instruction to auto-speak on load */
  instruction: string;
  /** Background variant */
  background?: "bubbles" | "stars" | "rainbow" | "sparkles";
  /** Show mascot helper in corner */
  showMascot?: boolean;
  /** Header icon (emoji) */
  headerIcon?: string;
  /** Delay before speaking (ms) */
  speakDelay?: number;
  /** Enable tap-anywhere sparkles */
  enableTapSparkles?: boolean;
}

/**
 * Base wrapper for all kid-facing screens
 * - Auto-speaks instruction on mount
 * - Tap mascot to replay instruction
 * - No text (icon/visual-based)
 * - Large touch targets
 * - Animated playful backgrounds
 * - Tap-anywhere sparkle feedback
 */
const KidScreen = ({
  children,
  instruction,
  background = "bubbles",
  showMascot = true,
  headerIcon,
  speakDelay = 600,
  enableTapSparkles = true,
}: KidScreenProps) => {
  const { replay } = useAutoSpeak({
    instruction,
    delay: speakDelay,
    autoSpeak: true,
  });
  
  const { playHappy } = useMascotSounds();
  const { haptic } = useHapticFeedback();
  const [mascotBounce, setMascotBounce] = useState(false);

  const handleMascotTap = useCallback(() => {
    haptic("light");
    playHappy();
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 600);
    replay();
  }, [haptic, playHappy, replay]);

  const content = (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <PlayfulBackground variant={background} intensity="medium" />

      {/* Header icon */}
      {headerIcon && (
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2 text-6xl z-20"
          initial={{ y: -30, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        >
          <motion.span
            animate={{ rotate: [-5, 5, -5], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {headerIcon}
          </motion.span>
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 pt-20 pb-24">
        {children}
      </div>

      {/* Mascot helper (tap to replay) */}
      {showMascot && (
        <motion.button
          onClick={handleMascotTap}
          className="fixed bottom-6 right-6 z-50 w-20 h-20 touch-manipulation"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            y: mascotBounce ? [0, -15, 0] : [0, -5, 0],
            rotate: mascotBounce ? [0, -10, 10, 0] : 0,
          }}
          transition={{ 
            x: { delay: 0.8 },
            y: { duration: mascotBounce ? 0.4 : 2, repeat: mascotBounce ? 0 : Infinity },
            rotate: { duration: 0.4 },
          }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-primary/30 to-star/30 blur-lg"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <img
            src={mascotWaving}
            alt="Tap for help"
            className="w-full h-full object-contain drop-shadow-lg relative z-10"
          />
          
          {/* Audio indicator */}
          <motion.div
            className="absolute -top-1 -left-1 bg-gradient-to-r from-star to-secondary text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg z-20"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🔊
          </motion.div>
        </motion.button>
      )}
    </div>
  );

  // Wrap with tap sparkle area if enabled
  if (enableTapSparkles) {
    return (
      <TapSparkleArea className="min-h-screen" enabled={true}>
        {content}
      </TapSparkleArea>
    );
  }

  return content;
};

export default KidScreen;
