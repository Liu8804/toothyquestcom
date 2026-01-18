import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Shield, Moon, Palette, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// Braces quest IDs for special effects
export const BRACES_QUEST_IDS = [
  "bracey-first-day",
  "bracey-colorful-bands",
  "bracey-sticky-snack",
  "bracey-wiggly-adventure",
  "bracey-nighttime-brushing",
  "bracey-colored-bands-challenge",
  "bracey-braces-superpowers",
];

export const isBracesQuest = (questId: string) => BRACES_QUEST_IDS.includes(questId);

// Get quest-specific animation config
export const getBracesQuestConfig = (questId: string) => {
  switch (questId) {
    case "bracey-first-day":
      return {
        emoji: "🦷",
        icon: Sparkles,
        rewardMessage: "Great job!",
        animationType: "sparkle-braces",
        colors: ["#FFD700", "#FFA500", "#FF69B4"],
      };
    case "bracey-colorful-bands":
      return {
        emoji: "🌈",
        icon: Palette,
        rewardMessage: "Rainbow smile!",
        animationType: "color-bands",
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
      };
    case "bracey-sticky-snack":
      return {
        emoji: "🐛",
        icon: Shield,
        rewardMessage: "Sugar bugs gone!",
        animationType: "bug-chase",
        colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
      };
    case "bracey-wiggly-adventure":
      return {
        emoji: "✨",
        icon: Star,
        rewardMessage: "Wiggly tooth tamed!",
        animationType: "wiggly-tooth",
        colors: ["#9C27B0", "#E91E63", "#FF9800"],
      };
    case "bracey-nighttime-brushing":
      return {
        emoji: "🌙",
        icon: Moon,
        rewardMessage: "Sleepy time sparkle!",
        animationType: "nighttime-sparkle",
        colors: ["#3F51B5", "#673AB7", "#1A237E", "#FFD700"],
      };
    case "bracey-colored-bands-challenge":
      return {
        emoji: "🎨",
        icon: Palette,
        rewardMessage: "Color combo unlocked!",
        animationType: "shimmer-bands",
        colors: ["#00BCD4", "#009688", "#4CAF50", "#8BC34A"],
      };
    case "bracey-braces-superpowers":
      return {
        emoji: "💪",
        icon: Zap,
        rewardMessage: "Braces Hero!",
        animationType: "superhero",
        colors: ["#FF5722", "#F44336", "#FFD700", "#2196F3"],
      };
    default:
      return null;
  }
};

// Sparkle Braces Animation - Quest 5
const SparkleBracesAnimation = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Color Bands Animation - Quest 37
const ColorBandsAnimation = ({ isActive }: { isActive: boolean }) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex gap-2">
            {colors.map((color, i) => (
              <motion.div
                key={i}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ scale: 0, y: 50, rotate: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  y: [50, -20, 0],
                  rotate: [0, 360, 720],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: 1,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Bug Chase Animation - Quest 38
const BugChaseAnimation = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{
              left: `${10 + i * 15}%`,
              top: `${40 + Math.sin(i) * 20}%`,
            }}
            initial={{ opacity: 1, x: 0, scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              x: [0, 100, 300],
              y: [0, -20, 20, -10],
              scale: [1, 1.2, 0.5],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
            }}
          >
            🐛
          </motion.div>
        ))}
        {/* Brushing effect */}
        <motion.div
          className="absolute text-4xl"
          style={{ left: "10%", top: "45%" }}
          initial={{ x: 0 }}
          animate={{ x: [0, 250, 0] }}
          transition={{ duration: 2, repeat: 1 }}
        >
          🪥
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Wiggly Tooth Animation - Quest 39
const WigglyToothAnimation = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          className="text-6xl"
          initial={{ rotate: 0 }}
          animate={{
            rotate: [-10, 10, -8, 8, -5, 5, -2, 2, 0],
            scale: [1, 1.1, 1, 1.1, 1, 1.05, 1, 1.02, 1],
          }}
          transition={{ duration: 2 }}
        >
          🦷
        </motion.div>
        <motion.div
          className="absolute text-2xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 1], 
            scale: [0, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          ✅
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Nighttime Sparkle Animation - Quest 40
const NighttimeSparkleAnimation = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden bg-indigo-900/20 rounded-3xl">
        {/* Moon */}
        <motion.div
          className="absolute text-5xl top-4 right-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
          }}
          transition={{ duration: 2, repeat: 1 }}
        >
          🌙
        </motion.div>
        
        {/* Stars */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 10}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0, 1, 0.8, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.15,
              repeat: 1,
            }}
          >
            ⭐
          </motion.div>
        ))}
        
        {/* Braces sparkle */}
        <motion.div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-4xl"
          animate={{
            filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1, repeat: 3 }}
        >
          😁✨
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Shimmer Bands Animation - Quest 41
const ShimmerBandsAnimation = ({ isActive }: { isActive: boolean }) => {
  const colors = ["#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800"];
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex gap-3">
            {colors.map((color, i) => (
              <motion.div
                key={i}
                className="w-4 h-8 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    `0 0 0px ${color}`,
                    `0 0 20px ${color}`,
                    `0 0 0px ${color}`,
                  ],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  repeat: 3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Superhero Animation - Quest 42
const SuperheroAnimation = ({ isActive }: { isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cape swoosh */}
        <motion.div
          className="absolute text-6xl top-1/3 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.5, 1.2],
            rotate: [-180, 0, 10, -10, 0],
          }}
          transition={{ duration: 1.5 }}
        >
          🦸‍♀️
        </motion.div>
        
        {/* Power sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: "50%",
              top: "40%",
              backgroundColor: ["#FFD700", "#FF5722", "#2196F3", "#4CAF50"][i % 4],
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              opacity: [1, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.8 + i * 0.05,
            }}
          />
        ))}
        
        {/* Fireworks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`firework-${i}`}
            className="absolute text-3xl"
            style={{
              left: `${20 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 40}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1,
              delay: 1.2 + i * 0.15,
            }}
          >
            🎆
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Main component that renders the appropriate animation
interface BracesQuestEffectProps {
  questId: string;
  isActive: boolean;
}

const BracesQuestEffect = ({ questId, isActive }: BracesQuestEffectProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  if (!isBracesQuest(questId)) return null;
  
  switch (questId) {
    case "bracey-first-day":
      return <SparkleBracesAnimation isActive={showAnimation} />;
    case "bracey-colorful-bands":
      return <ColorBandsAnimation isActive={showAnimation} />;
    case "bracey-sticky-snack":
      return <BugChaseAnimation isActive={showAnimation} />;
    case "bracey-wiggly-adventure":
      return <WigglyToothAnimation isActive={showAnimation} />;
    case "bracey-nighttime-brushing":
      return <NighttimeSparkleAnimation isActive={showAnimation} />;
    case "bracey-colored-bands-challenge":
      return <ShimmerBandsAnimation isActive={showAnimation} />;
    case "bracey-braces-superpowers":
      return <SuperheroAnimation isActive={showAnimation} />;
    default:
      return null;
  }
};

// Braces quest reward popup component
interface BracesQuestRewardProps {
  questId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BracesQuestReward = ({ questId, isOpen, onClose }: BracesQuestRewardProps) => {
  const config = getBracesQuestConfig(questId);
  
  if (!isOpen || !config) return null;
  
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 50 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl px-6 py-4 shadow-float flex items-center gap-4"
      onClick={onClose}
    >
      <motion.div
        animate={{ 
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="text-4xl"
      >
        {config.emoji}
      </motion.div>
      <div>
        <div className="flex items-center gap-2 text-white font-display font-bold text-lg">
          <Icon className="w-5 h-5" />
          {config.rewardMessage}
        </div>
        <div className="flex items-center gap-1 text-white/80 text-sm">
          <Star className="w-4 h-4 fill-star text-star" />
          <span>+10 XP earned!</span>
        </div>
      </div>
      <motion.div
        className="ml-2"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        🌟
      </motion.div>
    </motion.div>
  );
};

export default BracesQuestEffect;
