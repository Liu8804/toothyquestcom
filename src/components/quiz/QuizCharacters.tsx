import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import toothyMascot from "@/assets/toothy-mascot.png";
import { useQuizSounds } from "@/hooks/useQuizSounds";

// Character types for different story themes
export type CharacterId = "toothy" | "bracey" | "captain-floss" | "sugar-bug" | "sparkle" | "molar-mike";

export type CharacterMood = 
  | "idle" 
  | "thinking" 
  | "excited" 
  | "celebrating" 
  | "encouraging" 
  | "surprised"
  | "waving"
  | "dancing"
  | "scared"
  | "mischievous";

interface CharacterConfig {
  name: string;
  emoji: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  accessory?: string;
  borderColor: string;
  shadowColor: string;
  isVillain?: boolean;
}

// Character configurations
export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  toothy: {
    name: "Toothy",
    emoji: "🦷",
    color: "from-bubble/80 to-primary/20",
    gradientFrom: "from-blue-100",
    gradientTo: "to-cyan-50",
    borderColor: "border-primary/50",
    shadowColor: "shadow-primary/30",
  },
  bracey: {
    name: "Bracey",
    emoji: "🎀",
    color: "from-pink-100 to-purple-100",
    gradientFrom: "from-pink-100",
    gradientTo: "to-purple-50",
    accessory: "🎀",
    borderColor: "border-pink-400",
    shadowColor: "shadow-pink-300/50",
  },
  "captain-floss": {
    name: "Captain Floss",
    emoji: "🦸",
    color: "from-yellow-100 to-orange-100",
    gradientFrom: "from-yellow-100",
    gradientTo: "to-amber-50",
    accessory: "⚡",
    borderColor: "border-yellow-400",
    shadowColor: "shadow-yellow-300/50",
  },
  "sugar-bug": {
    name: "Sugar Bug",
    emoji: "👾",
    color: "from-purple-200 to-pink-200",
    gradientFrom: "from-purple-200",
    gradientTo: "to-pink-100",
    accessory: "🍬",
    borderColor: "border-purple-400",
    shadowColor: "shadow-purple-300/50",
    isVillain: true,
  },
  sparkle: {
    name: "Sparkle",
    emoji: "✨",
    color: "from-amber-100 to-yellow-100",
    gradientFrom: "from-amber-100",
    gradientTo: "to-yellow-50",
    accessory: "👑",
    borderColor: "border-amber-400",
    shadowColor: "shadow-amber-300/50",
  },
  "molar-mike": {
    name: "Molar Mike",
    emoji: "💪",
    color: "from-green-100 to-emerald-100",
    gradientFrom: "from-green-100",
    gradientTo: "to-emerald-50",
    accessory: "🏆",
    borderColor: "border-green-400",
    shadowColor: "shadow-green-300/50",
  },
};

// Map story topics/IDs to characters
export const getCharacterForStory = (storyId: string): CharacterId => {
  // Braces-related stories
  if (storyId.includes("braces") || storyId.includes("bracey") || storyId.includes("bands")) {
    return "bracey";
  }
  // Flossing stories
  if (storyId.includes("floss") || storyId.includes("captain")) {
    return "captain-floss";
  }
  // Sugar/cavity stories
  if (storyId.includes("sugar") || storyId.includes("cavity") || storyId.includes("monster")) {
    return "sugar-bug";
  }
  // Sparkle/shine stories
  if (storyId.includes("sparkle") || storyId.includes("shine") || storyId.includes("magic")) {
    return "sparkle";
  }
  // Mouthguard/strength stories
  if (storyId.includes("mouthguard") || storyId.includes("defender") || storyId.includes("hero")) {
    return "molar-mike";
  }
  // Default to Toothy
  return "toothy";
};

const moodEmojis: Record<CharacterMood, string> = {
  idle: "😊",
  thinking: "🤔",
  excited: "🤩",
  celebrating: "🎉",
  encouraging: "💪",
  surprised: "😲",
  waving: "👋",
  dancing: "💃",
  scared: "😱",
  mischievous: "😈",
};

interface QuizCharacterProps {
  characterId?: CharacterId;
  mood: CharacterMood;
  message?: string;
  onMessageComplete?: () => void;
  showSpeechBubble?: boolean;
  size?: "sm" | "md" | "lg";
  enableVoice?: boolean;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-36 h-36",
};

export const QuizCharacterAnimated = ({
  characterId = "toothy",
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

  const character = CHARACTERS[characterId];

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
    
    // Sugar Bug has mischievous animations
    if (character.isVillain) {
      switch (mood) {
        case "mischievous":
          return {
            x: [-10, 10, -10],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
            transition: { duration: 0.8, repeat: Infinity }
          };
        case "scared":
          return {
            x: [-5, 5, -5, 5, 0],
            scale: [1, 0.9, 1],
            transition: { duration: 0.3, repeat: Infinity }
          };
        default:
          return {
            y: [0, -5, 0],
            rotate: [-3, 3, -3],
            transition: { duration: 1.5, repeat: Infinity, ease: easeInOut }
          };
      }
    }
    
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
  }, [mood, character.isVillain]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className={`relative mb-3 px-4 py-3 rounded-2xl shadow-lg max-w-[250px] bg-gradient-to-br ${character.color}`}
          >
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
        {/* Character Name Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${character.gradientFrom} ${character.gradientTo} border ${character.borderColor} shadow-sm`}
          style={{ backgroundColor: character.isVillain ? '#9333ea' : undefined }}
        >
          <span className={character.isVillain ? "text-white" : "text-gray-700"}>{character.name}</span>
        </motion.div>

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

        {/* Accessory for character */}
        {character.accessory && (
          <motion.div
            className="absolute -top-4 -right-1 z-30 text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {character.accessory}
          </motion.div>
        )}

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

        {/* Sugar Bug specific: candy particles */}
        {character.isVillain && (mood === "mischievous" || mood === "excited") && (
          <>
            {["🍬", "🍭", "🍫", "🧁"].map((candy, i) => (
              <motion.span
                key={i}
                className="absolute text-lg pointer-events-none"
                style={{
                  top: `${10 + i * 20}%`,
                  left: `${-20 + i * 15}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -20, -40],
                  x: [0, i % 2 === 0 ? 10 : -10, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {candy}
              </motion.span>
            ))}
          </>
        )}

        {/* Main Character */}
        <motion.div
          className={`${sizeClasses[size]} relative`}
          animate={getCharacterAnimation()}
        >
          <motion.div
            className={`w-full h-full rounded-full ${character.shadowColor} shadow-xl overflow-hidden border-4 ${character.borderColor}`}
            whileHover={{ scale: 1.1 }}
          >
            {/* Character face using emoji and gradient */}
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${character.gradientFrom} ${character.gradientTo}`}>
              <motion.span 
                className="text-4xl"
                animate={character.isVillain && mood === "mischievous" ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {character.emoji}
              </motion.span>
            </div>
          </motion.div>

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
            character.isVillain ? "from-purple-500/30 to-transparent" :
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

export default QuizCharacterAnimated;
