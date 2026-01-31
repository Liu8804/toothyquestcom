import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface InteractiveRewardPopupProps {
  isVisible: boolean;
  reward: {
    type: "xp" | "star" | "sticker" | "badge";
    value?: number;
    emoji?: string;
    label?: string;
  };
  position?: { x: number; y: number };
  onComplete?: () => void;
}

/**
 * InteractiveRewardPopup - Animated reward that pops up after actions
 * Provides instant visual feedback for kids
 */
const InteractiveRewardPopup = ({
  isVisible,
  reward,
  position = { x: 50, y: 50 },
  onComplete,
}: InteractiveRewardPopupProps) => {
  const { playSparkle } = useMascotSounds();
  const { success } = useHapticFeedback();

  useEffect(() => {
    if (isVisible) {
      playSparkle();
      success();
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, playSparkle, success, onComplete]);

  const getRewardDisplay = () => {
    switch (reward.type) {
      case "xp":
        return {
          emoji: "⚡",
          text: `+${reward.value || 10}`,
          color: "from-star to-secondary",
        };
      case "star":
        return {
          emoji: "⭐",
          text: `+${reward.value || 1}`,
          color: "from-star to-amber-400",
        };
      case "sticker":
        return {
          emoji: reward.emoji || "🎨",
          text: "",
          color: "from-candy to-sparkle",
        };
      case "badge":
        return {
          emoji: reward.emoji || "🏆",
          text: "",
          color: "from-primary to-mint",
        };
      default:
        return {
          emoji: "✨",
          text: "",
          color: "from-primary to-bubble",
        };
    }
  };

  const display = getRewardDisplay();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1.3, 1.1, 0.8],
            y: [20, -30, -50, -80],
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Glow background */}
          <motion.div
            className={`absolute inset-0 -m-4 rounded-full bg-gradient-to-r ${display.color} blur-xl opacity-50`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Main reward */}
          <motion.div
            className={`relative flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r ${display.color} text-white font-bold shadow-lg`}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className="text-2xl">{display.emoji}</span>
            {display.text && (
              <span className="text-xl">{display.text}</span>
            )}
          </motion.div>

          {/* Sparkle burst */}
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-lg"
              style={{
                left: "50%",
                top: "50%",
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: Math.cos((i * 60 * Math.PI) / 180) * 50,
                y: Math.sin((i * 60 * Math.PI) / 180) * 50,
              }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            >
              ✨
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveRewardPopup;
