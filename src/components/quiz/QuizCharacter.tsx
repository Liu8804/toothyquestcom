import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import toothyMascot from "@/assets/toothy-mascot-new.jpeg";
import { useQuizSounds } from "@/hooks/useQuizSounds";

export type CharacterMood = 
  | "idle" 
  | "thinking" 
  | "excited" 
  | "celebrating" 
  | "encouraging" 
  | "surprised"
  | "waving"
  | "dancing";

interface QuizCharacterProps {
  mood: CharacterMood;
  message?: string;
  onMessageComplete?: () => void;
  showSpeechBubble?: boolean;
  size?: "sm" | "md" | "lg";
  enableVoice?: boolean;
}

const moodEmojis: Record<CharacterMood, string> = {
  idle: "😊",
  thinking: "🤔",
  excited: "🤩",
  celebrating: "🎉",
  encouraging: "💪",
  surprised: "😲",
  waving: "👋",
  dancing: "💃",
};

const moodColors: Record<CharacterMood, string> = {
  idle: "from-bubble/80 to-primary/20",
  thinking: "from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20",
  excited: "from-accent/30 to-yellow-100 dark:from-accent/20 dark:to-yellow-900/20",
  celebrating: "from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/20",
  encouraging: "from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20",
  surprised: "from-orange-100 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/20",
  waving: "from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20",
  dancing: "from-pink-100 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/20",
};

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

export const QuizCharacter = ({
  mood,
  message,
  onMessageComplete,
  showSpeechBubble = true,
  size = "md",
  enableVoice = true,
}: QuizCharacterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const { playVoiceSound, playSynthSound } = useQuizSounds();

  // Typewriter effect for speech bubble
  useEffect(() => {
    if (!message) {
      setDisplayedText("");
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
        // Play subtle typing sound occasionally
        if (index % 3 === 0) {
          playSynthSound("pop");
        }
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        onMessageComplete?.();
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [message, playSynthSound, onMessageComplete]);

  // Show mood emoji with animation
  useEffect(() => {
    if (mood !== "idle") {
      setShowEmoji(true);
      const timer = setTimeout(() => setShowEmoji(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  // Trigger voice based on mood
  useEffect(() => {
    if (!enableVoice) return;
    
    if (mood === "celebrating") {
      playVoiceSound("celebration");
    } else if (mood === "excited") {
      playVoiceSound("correct");
    } else if (mood === "encouraging") {
      playVoiceSound("incorrect");
    }
  }, [mood, enableVoice, playVoiceSound]);

  const getCharacterAnimation = useCallback((): {
    rotate?: number[];
    y?: number[];
    x?: number[];
    scale?: number[];
    transition: { duration: number; repeat: number; ease?: [number, number, number, number] };
  } => {
    const easeInOut: [number, number, number, number] = [0.42, 0, 0.58, 1];
    
    switch (mood) {
      case "thinking":
        return {
          rotate: [-3, 3, -3],
          y: [0, -5, 0],
          transition: { duration: 2, repeat: Infinity, ease: easeInOut }
        };
      case "excited":
        return {
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
          transition: { duration: 0.5, repeat: Infinity }
        };
      case "celebrating":
        return {
          rotate: [0, 10, -10, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
          transition: { duration: 0.6, repeat: Infinity }
        };
      case "encouraging":
        return {
          scale: [1, 1.05, 1],
          y: [0, -8, 0],
          transition: { duration: 1.5, repeat: Infinity, ease: easeInOut }
        };
      case "surprised":
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.3, repeat: 0 }
        };
      case "waving":
        return {
          rotate: [0, 15, -15, 15, 0],
          transition: { duration: 1, repeat: Infinity }
        };
      case "dancing":
        return {
          x: [-5, 5, -5],
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
          transition: { duration: 0.8, repeat: Infinity }
        };
      default:
        return {
          y: [0, -8, 0],
          transition: { duration: 3, repeat: Infinity, ease: easeInOut }
        };
    }
  }, [mood]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className={`relative mb-3 px-4 py-3 rounded-2xl shadow-lg max-w-[250px] bg-gradient-to-br ${moodColors[mood]}`}
          >
            {/* Speech bubble pointer */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
              border-l-8 border-r-8 border-t-8 
              border-l-transparent border-r-transparent border-t-bubble/80`} 
            />
            
            <p className="text-sm font-medium text-foreground text-center leading-relaxed">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  |
                </motion.span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Container */}
      <div className="relative">
        {/* Mood Emoji Indicator */}
        <AnimatePresence>
          {showEmoji && mood !== "idle" && (
            <motion.div
              initial={{ scale: 0, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: -20, opacity: 0 }}
              className="absolute -top-2 -right-2 z-20"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="text-2xl drop-shadow-lg"
              >
                {moodEmojis[mood]}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle Effects for celebrating */}
        {mood === "celebrating" && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xl pointer-events-none"
                style={{
                  top: `${20 + Math.sin(i) * 30}%`,
                  left: `${20 + Math.cos(i) * 30}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [-10, -30],
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

        {/* Main Character */}
        <motion.div
          className={`${sizeClasses[size]} relative`}
          animate={getCharacterAnimation()}
        >
          <motion.img
            src={toothyMascot}
            alt="Toothy - Your Quiz Buddy"
            className="w-full h-full object-contain drop-shadow-xl"
            whileHover={{ scale: 1.1 }}
          />

          {/* Thinking bubbles */}
          {mood === "thinking" && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/80 dark:bg-gray-700/80"
                  style={{
                    width: 8 + i * 4,
                    height: 8 + i * 4,
                    right: -15 - i * 8,
                    top: 5 + i * 10,
                  }}
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Glow effect based on mood */}
        <motion.div
          className={`absolute inset-0 rounded-full blur-xl -z-10 bg-gradient-radial ${
            mood === "celebrating" ? "from-yellow-400/30 to-transparent" :
            mood === "excited" ? "from-accent/30 to-transparent" :
            mood === "encouraging" ? "from-green-400/30 to-transparent" :
            "from-primary/20 to-transparent"
          }`}
          animate={{
            scale: mood === "celebrating" || mood === "excited" ? [1, 1.3, 1] : [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default QuizCharacter;
