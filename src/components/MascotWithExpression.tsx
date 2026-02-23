import { motion, useAnimation } from "framer-motion";
import { useState, useCallback } from "react";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

export type MascotExpression = "happy" | "excited" | "cheering" | "winking" | "celebrating";

interface MascotWithExpressionProps {
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg" | "xl";
  showSpeechBubble?: boolean;
  message?: string;
  showLogo?: boolean;
  className?: string;
}

const expressionEmojis: Record<MascotExpression, string> = {
  happy: "😊",
  excited: "🤩",
  cheering: "🎉",
  winking: "😉",
  celebrating: "🥳",
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

const MascotWithExpression = ({
  expression = "happy",
  size = "md",
  showSpeechBubble = false,
  message = "",
  showLogo = false,
  className = "",
}: MascotWithExpressionProps) => {
  const [isTapped, setIsTapped] = useState(false);
  const controls = useAnimation();

  const getAnimation = () => {
    switch (expression) {
      case "excited":
        return { scale: [1, 1.03, 1], rotate: [0, 1.5, -1.5, 0], y: [0, -2.5, 0] };
      case "cheering":
        return { y: [0, -4, 0], scale: [1, 1.03, 1], rotate: [0, 1, -1, 0] };
      case "celebrating":
        return { rotate: [0, 3, -3, 0], scale: [1, 1.04, 1], y: [0, -3, 0] };
      case "winking":
        return { scale: [1, 1.015, 1], rotate: [0, 0.6, 0] };
      default:
        return { y: [0, -2, 0], rotate: [0, 0.3, -0.3, 0] };
    }
  };

  const getMascotImage = () => {
    if (expression === "celebrating" || expression === "cheering" || expression === "excited") {
      return mascotCelebrating;
    }
    return mascotWaving;
  };

  const handleTap = useCallback(() => {
    setIsTapped(true);
    controls.start({
      scale: [1, 1.06, 0.97, 1.02, 1],
      rotate: [0, -2.5, 2.5, -1, 0],
      transition: { duration: 0.5 },
    });
    setTimeout(() => setIsTapped(false), 600);
  }, [controls]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      {showSpeechBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative mb-2 px-4 py-2 bg-card rounded-2xl shadow-card border-2 border-border max-w-xs"
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-card" />
          <p className="text-sm font-bold text-foreground text-center">{message}</p>
        </motion.div>
      )}

      {/* Mascot container */}
      <motion.div
        className={`relative ${sizeClasses[size]} cursor-pointer`}
        animate={getAnimation()}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        onTap={handleTap}
      >
        <motion.img
          src={getMascotImage()}
          alt="Toothy mascot"
          className="w-full h-full object-contain character-3d"
          animate={controls}
          whileHover={{ scale: 1.03 }}
        />
        
        {/* Expression overlay with pop-in */}
        <motion.div
          className="absolute -top-1 -right-1 text-lg"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: expression === "celebrating" ? [0, 5, -5, 0] : 0,
            y: [0, -1, 0],
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {expressionEmojis[expression]}
        </motion.div>

        {/* Tap reaction */}
        {isTapped && (
          <>
            {["🌟", "💖", "✨"].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-base pointer-events-none"
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: [1, 0],
                  scale: [0, 1],
                  x: (i - 1) * 15,
                  y: -12 - i * 4,
                }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                style={{ top: "25%", left: "35%" }}
              >
                {emoji}
              </motion.span>
            ))}
          </>
        )}

        {/* Sparkles for excited/celebrating states */}
        {(expression === "excited" || expression === "celebrating" || expression === "cheering") && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs pointer-events-none"
                style={{
                  top: `${15 + Math.sin(i * 1.3) * 40}%`,
                  left: `${15 + Math.cos(i * 1.3) * 40}%`,
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0],
                  y: [-2, -8],
                }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.18,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </motion.div>

      {/* Ground shadow */}
      <motion.div
        className="w-3/4 h-2 rounded-full bg-foreground/10 blur-sm mt-1"
        animate={{
          scaleX: [1, 1.05, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Logo badge */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="mt-2"
        >
          <img
            src={mascotWaving}
            alt="ToothyQuest"
            className="w-12 h-12 object-contain character-3d"
          />
        </motion.div>
      )}
    </div>
  );
};

export default MascotWithExpression;
