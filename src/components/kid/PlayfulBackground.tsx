import { motion } from "framer-motion";

interface PlayfulBackgroundProps {
  variant?: "bubbles" | "stars" | "rainbow" | "sparkles";
  intensity?: "light" | "medium" | "full";
}

/**
 * PlayfulBackground - Animated background for kid screens
 * Creates an engaging, colorful environment that responds to the app mood
 */
const PlayfulBackground = ({
  variant = "bubbles",
  intensity = "medium",
}: PlayfulBackgroundProps) => {
  const count = intensity === "light" ? 6 : intensity === "medium" ? 10 : 15;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient */}
      <div 
        className={`absolute inset-0 ${
          variant === "rainbow" 
            ? "bg-gradient-to-br from-candy/10 via-bubble/10 to-mint/10"
            : variant === "stars"
            ? "bg-gradient-to-b from-sparkle/10 via-star/10 to-bubble/10"
            : "bg-gradient-to-b from-bubble/15 via-primary/5 to-mint/10"
        }`}
      />

      {/* Floating elements based on variant */}
      {variant === "bubbles" && (
        <>
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full bg-bubble/20 backdrop-blur-sm"
              style={{
                width: 20 + Math.random() * 40,
                height: 20 + Math.random() * 40,
                left: `${5 + i * (90 / count)}%`,
                bottom: `-${20 + Math.random() * 10}%`,
              }}
              animate={{
                y: [0, -window.innerHeight * 1.2],
                x: [0, (Math.random() - 0.5) * 100],
                scale: [1, 0.8, 1.1, 0.9],
                opacity: [0, 0.6, 0.6, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      {variant === "stars" && (
        <>
          {[...Array(count)].map((_, i) => (
            <motion.span
              key={`star-${i}`}
              className="absolute text-xl"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 90}%`,
              }}
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.2, 0.8, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "🌟"}
            </motion.span>
          ))}
        </>
      )}

      {variant === "rainbow" && (
        <>
          {/* Rainbow arcs */}
          <motion.div
            className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full border-[30px] opacity-20"
            style={{
              borderColor: "transparent",
              borderTopColor: "hsl(var(--primary))",
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-1/3 left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full border-[25px] opacity-15"
            style={{
              borderColor: "transparent",
              borderTopColor: "hsl(var(--star-gold))",
            }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          {/* Floating emojis */}
          {[...Array(count / 2)].map((_, i) => (
            <motion.span
              key={`emoji-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${10 + i * (80 / (count / 2))}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [-10, 10, -10],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
              }}
            >
              {["🦷", "🪥", "✨", "⭐", "💎"][i % 5]}
            </motion.span>
          ))}
        </>
      )}

      {variant === "sparkles" && (
        <>
          {[...Array(count * 2)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: [
                  "hsl(var(--star-gold))",
                  "hsl(var(--primary))",
                  "hsl(var(--candy-pink))",
                  "hsl(var(--mint-fresh))",
                ][i % 4],
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default PlayfulBackground;
