import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";

export type BraceyMood = "happy" | "excited" | "encouraging" | "celebrating" | "thinking" | "winking";

interface BraceyMascotProps {
  mood?: BraceyMood;
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  showMessage?: boolean;
  position?: "left" | "right" | "center";
  className?: string;
  autoRotateMessages?: boolean;
  messages?: string[];
}

const moodEmojis: Record<BraceyMood, string> = {
  happy: "😊",
  excited: "🤩",
  encouraging: "💪",
  celebrating: "🎉",
  thinking: "🤔",
  winking: "😉",
};

const defaultMessages: Record<BraceyMood, string[]> = {
  happy: [
    "Hi! I'm Bracey! 🦷",
    "Love your braces! ✨",
    "Looking great! 😁",
  ],
  excited: [
    "You're doing amazing!",
    "Woohoo! Keep it up!",
    "Braces are so cool! 🌟",
  ],
  encouraging: [
    "You've got this!",
    "Keep brushing! 💪",
    "Almost there, champ!",
  ],
  celebrating: [
    "Yay! Great job! 🎉",
    "You're a braces star!",
    "Super smile power! ⭐",
  ],
  thinking: [
    "Hmm, let's think...",
    "What should we try?",
    "Good question! 🤔",
  ],
  winking: [
    "Secret tip time! 😉",
    "Between us friends...",
    "Pro braces move! ✨",
  ],
};

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

const BraceyMascot = ({
  mood = "happy",
  size = "md",
  message,
  showMessage = true,
  position = "center",
  className = "",
  autoRotateMessages = false,
  messages,
}: BraceyMascotProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const availableMessages = messages || defaultMessages[mood];
  const displayMessage = message || availableMessages[currentMessageIndex];

  useEffect(() => {
    if (autoRotateMessages && availableMessages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % availableMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [autoRotateMessages, availableMessages.length]);

  const getAnimation = () => {
    switch (mood) {
      case "excited":
        return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] };
      case "celebrating":
        return { y: [0, -10, 0], scale: [1, 1.1, 1] };
      case "encouraging":
        return { rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] };
      case "thinking":
        return { rotate: [-5, 5, -5], scale: [1, 1.02, 1] };
      case "winking":
        return { scale: [1, 1.05, 1] };
      default:
        return { y: [0, -5, 0] };
    }
  };

  const positionClasses = {
    left: "items-start",
    right: "items-end",
    center: "items-center",
  };

  return (
    <div className={`relative inline-flex flex-col ${positionClasses[position]} ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {showMessage && displayMessage && (
          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="relative mb-3 px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-card max-w-[200px] border-2 border-pink-200"
          >
            {/* Speech bubble pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-pink-200" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-pink-50" />
            <p className="text-sm font-medium text-foreground text-center leading-relaxed">{displayMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bracey Mascot container */}
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        animate={getAnimation()}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main logo/face with braces overlay */}
        <div className="relative w-full h-full">
          <motion.img
            src={mascotMain}
            alt="Bracey mascot"
            className="w-full h-full object-contain drop-shadow-lg"
            whileHover={{ scale: 1.1 }}
          />
          
          {/* Braces overlay - metal brackets and wire */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Wire across the smile */}
            <motion.div
              className="absolute bottom-[30%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Brackets */}
            {[0.2, 0.35, 0.5, 0.65, 0.8].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute bottom-[28%] w-2 h-2.5 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm border border-gray-500"
                style={{ left: `${pos * 100}%`, transform: "translateX(-50%)" }}
                animate={
                  mood === "celebrating"
                    ? { backgroundColor: ["#9CA3AF", "#EC4899", "#8B5CF6", "#3B82F6", "#10B981"][i % 5] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>

          {/* Pink bow/accessory for Bracey */}
          <motion.div
            className="absolute -top-2 -right-1 text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎀
          </motion.div>
        </div>
        
        {/* Mood emoji */}
        <motion.div
          className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full p-0.5 shadow-sm"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: mood === "celebrating" ? [0, 15, -15, 0] : 0 
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {moodEmojis[mood]}
        </motion.div>

        {/* Sparkles for excited/celebrating states */}
        {(mood === "excited" || mood === "celebrating") && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-sm"
                style={{
                  top: `${-10 + Math.random() * 20}%`,
                  left: `${-10 + i * 25}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [-5, -15],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}

        {/* Encouraging flex animation */}
        {mood === "encouraging" && (
          <motion.span
            className="absolute -left-2 top-1/2 -translate-y-1/2 text-lg"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            💪
          </motion.span>
        )}
      </motion.div>

      {/* Name badge */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-sm"
      >
        <span className="text-xs font-bold text-white">Bracey</span>
      </motion.div>
    </div>
  );
};

export default BraceyMascot;
