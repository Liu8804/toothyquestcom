import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { useAutoSpeak } from "@/hooks/useAutoSpeak";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";

interface KidScreenProps {
  children: ReactNode;
  /** Voice instruction to auto-speak on load */
  instruction: string;
  /** Background variant */
  background?: "bubbles" | "stars" | "rainbow" | "plain";
  /** Show mascot helper in corner */
  showMascot?: boolean;
  /** Header icon (emoji) */
  headerIcon?: string;
  /** Delay before speaking (ms) */
  speakDelay?: number;
}

/**
 * Base wrapper for all kid-facing screens
 * - Auto-speaks instruction on mount
 * - Tap mascot to replay instruction
 * - No text (icon/visual-based)
 * - Large touch targets
 */
const KidScreen = ({
  children,
  instruction,
  background = "bubbles",
  showMascot = true,
  headerIcon,
  speakDelay = 600,
}: KidScreenProps) => {
  const { replay } = useAutoSpeak({
    instruction,
    delay: speakDelay,
    autoSpeak: true,
  });

  const backgroundClasses = {
    bubbles: "bg-gradient-to-b from-bubble/20 via-primary/10 to-mint/20",
    stars: "bg-gradient-to-b from-star/20 via-secondary/10 to-bubble/20",
    rainbow: "bg-gradient-to-br from-primary/20 via-star/20 to-mint/20",
    plain: "bg-background",
  };

  return (
    <div className={`min-h-screen ${backgroundClasses[background]} relative overflow-hidden`}>
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {background === "bubbles" && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-bubble/30"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
        {background === "stars" && (
          <>
            {[...Array(10)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${5 + i * 10}%`,
                  top: `${10 + (i % 4) * 20}%`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                ⭐
              </motion.span>
            ))}
          </>
        )}
      </div>

      {/* Header icon */}
      {headerIcon && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {headerIcon}
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 pt-16">
        {children}
      </div>

      {/* Mascot helper (tap to replay) */}
      {showMascot && (
        <motion.button
          onClick={replay}
          className="fixed bottom-4 right-4 z-50 w-16 h-16"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img
              src={mascotWaving}
              alt="Tap for help"
              className="w-full h-full object-contain drop-shadow-lg"
            />
            {/* Tap hint */}
            <motion.div
              className="absolute -top-2 -left-2 bg-star text-white text-xs font-bold px-2 py-1 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔊
            </motion.div>
          </motion.div>
        </motion.button>
      )}
    </div>
  );
};

export default KidScreen;
