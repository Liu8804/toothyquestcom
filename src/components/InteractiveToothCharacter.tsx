import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface InteractiveToothCharacterProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  tips?: string[];
  className?: string;
  idleAnimation?: "float" | "wobble" | "bounce" | "spin";
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28 md:w-32 md:h-32",
  lg: "w-32 h-32 md:w-40 md:h-40",
  xl: "w-40 h-40 md:w-48 md:h-48",
};

const DENTAL_TIPS = [
  "Brush twice a day for 2 minutes! 🪥",
  "Floss like a superhero every night! 🦸",
  "Drink water to keep your smile shiny! 💧",
  "Eat crunchy veggies — teeth love them! 🥕",
  "Visit your dentist every 6 months! 🏥",
  "Sugar bugs don't like toothpaste! 😤",
  "Your tongue needs brushing too! 👅",
  "Calcium makes teeth super strong! 💪",
  "Smile — it's your superpower! 😁✨",
  "Healthy snacks = happy teeth! 🍎",
];

const idleAnimations = {
  float: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } },
  wobble: { rotate: [0, 3, -3, 0], y: [0, -4, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } },
  bounce: { y: [0, -12, 0], scale: [1, 1.05, 1], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const } },
  spin: { rotate: [0, 5, -5, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } },
};

const InteractiveToothCharacter = ({
  src,
  alt,
  size = "md",
  tips,
  className = "",
  idleAnimation = "float",
}: InteractiveToothCharacterProps) => {
  const [showBubble, setShowBubble] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [isExcited, setIsExcited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const { playSparkle, playHappy, playCheer, playDing } = useMascotSounds();
  const { selection } = useHapticFeedback();

  const allTips = tips || DENTAL_TIPS;

  const handleTap = useCallback(() => {
    selection();
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Pick a random tip
    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
    setCurrentTip(randomTip);
    setShowBubble(true);
    setShowSparkles(true);

    // Different sounds based on tap count
    if (newCount % 5 === 0) {
      playCheer();
      setIsExcited(true);
      setTimeout(() => setIsExcited(false), 1200);
    } else if (newCount % 3 === 0) {
      playHappy();
    } else {
      playDing();
    }

    // Hide speech bubble after 4s
    setTimeout(() => setShowBubble(false), 4000);
    setTimeout(() => setShowSparkles(false), 1000);
  }, [tapCount, allTips, selection, playCheer, playHappy, playDing]);

  const idle = idleAnimations[idleAnimation];

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && currentTip && (
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full z-30 px-4 py-3 bg-card rounded-2xl shadow-float max-w-[220px] border-2 border-primary/30"
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary/30" />
            <p className="text-xs font-medium text-foreground text-center leading-relaxed">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <motion.div
        className={`relative ${sizeClasses[size]} cursor-pointer select-none`}
        animate={isExcited ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : idle}
        transition={isExcited ? { duration: 0.6 } : idle.transition}
        onClick={handleTap}
        whileTap={{ scale: 0.9 }}
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-contain drop-shadow-xl"
          draggable={false}
        />

        {/* Sparkle burst on tap */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm pointer-events-none"
                  style={{
                    top: `${30 + Math.sin(i * 1.05) * 40}%`,
                    left: `${30 + Math.cos(i * 1.05) * 40}%`,
                  }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 0, scale: 1.5, y: -20 - i * 5, x: (i % 2 === 0 ? 1 : -1) * 10 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                >
                  {["✨", "⭐", "💫", "🌟", "✨", "⭐"][i]}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Excited ring effect */}
        {isExcited && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/40 -z-10"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </motion.div>

      {/* Tap hint - shows briefly on first render */}
      <motion.p
        initial={{ opacity: 0.8 }}
        animate={{ opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 2, repeat: 2 }}
        className="text-[10px] text-muted-foreground mt-1 font-medium"
      >
        Tap me! 👆
      </motion.p>
    </div>
  );
};

export default InteractiveToothCharacter;
