import { motion } from "framer-motion";
import toothyMascot from "@/assets/toothy-mascot.png";
import toothyLogo from "@/assets/toothyquest-logo.jpeg";

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
  const getAnimation = () => {
    switch (expression) {
      case "excited":
        return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] };
      case "cheering":
        return { y: [0, -15, 0], scale: [1, 1.1, 1] };
      case "celebrating":
        return { rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] };
      case "winking":
        return { scale: [1, 1.05, 1] };
      default:
        return { y: [0, -5, 0] };
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      {showSpeechBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative mb-2 px-4 py-2 bg-card rounded-2xl shadow-card max-w-xs"
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-card" />
          <p className="text-sm font-medium text-foreground text-center">{message}</p>
        </motion.div>
      )}

      {/* Mascot container */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={getAnimation()}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.img
          src={toothyMascot}
          alt="Toothy mascot"
          className="w-full h-full object-contain drop-shadow-lg"
          whileHover={{ scale: 1.1 }}
        />
        
        {/* Expression overlay */}
        <motion.div
          className="absolute -top-1 -right-1 text-lg"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: expression === "celebrating" ? [0, 15, -15, 0] : 0 
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {expressionEmojis[expression]}
        </motion.div>

        {/* Sparkles for excited/celebrating states */}
        {(expression === "excited" || expression === "celebrating" || expression === "cheering") && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [-10, -20],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </motion.div>

      {/* Logo badge */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mt-2"
        >
          <img
            src={toothyLogo}
            alt="ToothyQuest"
            className="w-12 h-12 rounded-full shadow-card border-2 border-primary"
          />
        </motion.div>
      )}
    </div>
  );
};

export default MascotWithExpression;