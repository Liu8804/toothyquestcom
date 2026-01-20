import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface AnimatedStoryImageProps {
  src: string;
  alt: string;
  storyId: string;
  className?: string;
}

// Character tap sounds and effects
const CHARACTER_TAP_EFFECTS: Record<string, {
  sounds: string[];
  emojis: string[];
  message: string;
}> = {
  braces: {
    sounds: ["✨ Sparkle!", "💎 Shine!", "🎀 Pretty!"],
    emojis: ["✨", "💎", "🎀", "💖", "⭐"],
    message: "Bracey says hi! 🎀",
  },
  floss: {
    sounds: ["⚡ Swoosh!", "💪 Power!", "🦸 Hero!"],
    emojis: ["⚡", "💫", "🦸", "🌟", "💪"],
    message: "Captain Floss saves the day! ⚡",
  },
  sugar: {
    sounds: ["👾 Mwaha!", "🍬 Yummy!", "😈 Gotcha!"],
    emojis: ["👾", "🍬", "🍭", "🧁", "🦠"],
    message: "Sugar Bug is hiding! 👾",
  },
  brush: {
    sounds: ["🪥 Brush!", "💧 Splash!", "✨ Clean!"],
    emojis: ["🪥", "💧", "✨", "🫧", "🌊"],
    message: "Squeaky clean! 🪥",
  },
  dentist: {
    sounds: ["👨‍⚕️ Hello!", "🏥 Check!", "😁 Smile!"],
    emojis: ["👨‍⚕️", "🏥", "😁", "🦷", "💙"],
    message: "The dentist is your friend! 👨‍⚕️",
  },
  fairy: {
    sounds: ["🧚 Magic!", "✨ Wish!", "🌙 Dream!"],
    emojis: ["🧚", "✨", "⭐", "🌙", "💫"],
    message: "Tooth fairy sprinkles magic! 🧚",
  },
  default: {
    sounds: ["🦷 Yay!", "😊 Happy!", "⭐ Star!"],
    emojis: ["🦷", "⭐", "✨", "😊", "💙"],
    message: "Keep smiling! 🦷",
  },
};

// Get animation config based on story theme
const getStoryAnimationConfig = (storyId: string) => {
  // Braces stories - metallic shimmer
  if (storyId.includes("braces") || storyId.includes("bracey") || storyId.includes("bands")) {
    return {
      imageAnimation: {
        filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
      },
      overlayElements: [
        { emoji: "✨", position: "top-right", tappable: true },
        { emoji: "🎀", position: "bottom-left", tappable: true },
      ],
      theme: "braces",
      glowColor: "from-pink-400/20",
    };
  }
  
  // Flossing stories - whooshing motion
  if (storyId.includes("floss") || storyId.includes("captain")) {
    return {
      imageAnimation: {
        x: [0, 3, -3, 0],
      },
      overlayElements: [
        { emoji: "🦸", position: "top-left", tappable: true },
        { emoji: "💫", position: "center-right", tappable: true },
      ],
      theme: "floss",
      glowColor: "from-yellow-400/20",
    };
  }
  
  // Sugar/cavity stories - spooky wiggle
  if (storyId.includes("sugar") || storyId.includes("cavity") || storyId.includes("monster")) {
    return {
      imageAnimation: {
        rotate: [-1, 1, -1],
        scale: [1, 1.02, 1],
      },
      overlayElements: [
        { emoji: "👾", position: "top-right", tappable: true },
        { emoji: "🍬", position: "bottom-right", tappable: true },
        { emoji: "🦠", position: "top-left", tappable: true },
      ],
      theme: "sugar",
      glowColor: "from-purple-500/20",
    };
  }
  
  // Brushing stories - clean sweep
  if (storyId.includes("brush") || storyId.includes("sparkle") || storyId.includes("clean")) {
    return {
      imageAnimation: {
        filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"],
      },
      overlayElements: [
        { emoji: "🪥", position: "top-left", tappable: true },
        { emoji: "✨", position: "center", tappable: true },
        { emoji: "💧", position: "bottom-right", tappable: true },
      ],
      theme: "brush",
      glowColor: "from-cyan-400/20",
    };
  }
  
  // Dentist/checkup stories - friendly vibe
  if (storyId.includes("dentist") || storyId.includes("office") || storyId.includes("check")) {
    return {
      imageAnimation: {
        y: [0, -3, 0],
      },
      overlayElements: [
        { emoji: "👨‍⚕️", position: "top-right", tappable: true },
        { emoji: "🏥", position: "bottom-left", tappable: true },
      ],
      theme: "dentist",
      glowColor: "from-blue-400/20",
    };
  }
  
  // Tooth fairy stories - magical sparkle
  if (storyId.includes("fairy") || storyId.includes("magic") || storyId.includes("wish")) {
    return {
      imageAnimation: {
        scale: [1, 1.02, 1],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
      },
      overlayElements: [
        { emoji: "🧚", position: "top-right", tappable: true },
        { emoji: "✨", position: "center", tappable: true },
        { emoji: "⭐", position: "bottom-left", tappable: true },
        { emoji: "🌙", position: "top-left", tappable: true },
      ],
      theme: "fairy",
      glowColor: "from-amber-400/30",
    };
  }
  
  // Default gentle bounce
  return {
    imageAnimation: {
      y: [0, -4, 0],
      scale: [1, 1.01, 1],
    },
    overlayElements: [
      { emoji: "🦷", position: "top-right", tappable: true },
    ],
    theme: "default",
    glowColor: "from-primary/20",
  };
};

const positionClasses: Record<string, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "center-right": "top-1/2 right-4 -translate-y-1/2",
  "center-left": "top-1/2 left-4 -translate-y-1/2",
};

export const AnimatedStoryImage = ({
  src,
  alt,
  storyId,
  className = "",
}: AnimatedStoryImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [tapEffects, setTapEffects] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [tappedCharacter, setTappedCharacter] = useState<number | null>(null);
  const { playSynthSound } = useQuizSounds();
  
  const config = getStoryAnimationConfig(storyId);
  const tapConfig = CHARACTER_TAP_EFFECTS[config.theme] || CHARACTER_TAP_EFFECTS.default;

  // Periodic interaction animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowInteraction(true);
      setTimeout(() => setShowInteraction(false), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle tap on image - burst of emojis and sound
  const handleImageTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x: number, y: number;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Play tap sound
    playSynthSound("pop");

    // Create tap effect
    const newEffects = Array(5).fill(null).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      emoji: tapConfig.emojis[Math.floor(Math.random() * tapConfig.emojis.length)],
    }));

    setTapEffects(prev => [...prev, ...newEffects]);

    // Clear effects after animation
    setTimeout(() => {
      setTapEffects(prev => prev.filter(e => !newEffects.find(ne => ne.id === e.id)));
    }, 1000);
  }, [playSynthSound, tapConfig.emojis]);

  // Handle character tap - special effect with message
  const handleCharacterTap = useCallback((index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    // Play celebration sound
    playSynthSound("sparkle");
    
    // Animate the character
    setTappedCharacter(index);
    setTimeout(() => setTappedCharacter(null), 500);

    // Show message
    setShowMessage(tapConfig.message);
    setTimeout(() => setShowMessage(null), 2000);

    // Create burst effect around character
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newEffects = Array(8).fill(null).map((_, i) => ({
      id: Date.now() + i,
      x: rect.width / 2 + Math.cos((i / 8) * Math.PI * 2) * 30,
      y: rect.height / 2 + Math.sin((i / 8) * Math.PI * 2) * 30,
      emoji: tapConfig.emojis[i % tapConfig.emojis.length],
    }));

    setTapEffects(prev => [...prev, ...newEffects]);
    setTimeout(() => {
      setTapEffects(prev => prev.filter(e => !newEffects.find(ne => ne.id === e.id)));
    }, 1000);
  }, [playSynthSound, tapConfig]);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl cursor-pointer touch-manipulation ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={handleImageTap}
      onTouchStart={handleImageTap}
    >
      {/* Animated glow background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-radial ${config.glowColor} to-transparent opacity-0 z-0`}
        animate={{
          opacity: [0, 0.5, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main animated image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover relative z-10 select-none"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          ...config.imageAnimation,
        }}
        transition={{
          opacity: { duration: 0.3 },
          ...Object.fromEntries(
            Object.keys(config.imageAnimation).map(key => [
              key,
              { duration: 3, repeat: Infinity, ease: "easeInOut" }
            ])
          ),
        }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      />

      {/* Tap instruction hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 3, delay: 1, repeat: 2 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 bg-background/90 rounded-full text-xs font-medium shadow-lg"
      >
        👆 Tap the characters!
      </motion.div>

      {/* Floating character elements - NOW TAPPABLE */}
      {config.overlayElements.map((element, i) => (
        <motion.button
          key={i}
          className={`absolute ${positionClasses[element.position]} z-20 p-2 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 active:scale-90 transition-colors touch-manipulation`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: tappedCharacter === i ? [1, 1.5, 1] : [1, 1.15, 1],
            y: [0, -5, 0],
            rotate: tappedCharacter === i ? [0, 15, -15, 0] : 0,
          }}
          transition={{
            duration: tappedCharacter === i ? 0.3 : 2,
            repeat: tappedCharacter === i ? 0 : Infinity,
            delay: tappedCharacter === i ? 0 : i * 0.3,
            ease: "easeInOut",
          }}
          onClick={(e) => handleCharacterTap(i, e)}
          onTouchStart={(e) => handleCharacterTap(i, e)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-3xl drop-shadow-lg">{element.emoji}</span>
        </motion.button>
      ))}

      {/* Tap effect emojis */}
      <AnimatePresence>
        {tapEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className="absolute z-40 pointer-events-none"
            style={{ left: effect.x, top: effect.y }}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              y: -40,
              x: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-2xl">{effect.emoji}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Character message popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-4 py-2 bg-background/95 rounded-2xl shadow-xl border-2 border-primary/30"
          >
            <p className="text-sm font-bold text-foreground whitespace-nowrap">{showMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive sparkle burst on periodic animation */}
      <AnimatePresence>
        {showInteraction && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{ 
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i / 8) * Math.PI * 2) * 60,
                  y: Math.sin((i / 8) * Math.PI * 2) * 60,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >
                <span className="text-lg">
                  {tapConfig.emojis[i % tapConfig.emojis.length]}
                </span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Theme-specific effects */}
      {config.theme === "sugar" && (
        <motion.div
          className="absolute inset-0 z-15 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle, rgba(147,51,234,0) 0%, rgba(147,51,234,0.1) 100%)",
              "radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(147,51,234,0) 100%)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {config.theme === "fairy" && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`fairy-${i}`}
              className="absolute z-20 pointer-events-none text-sm"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 18}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -30],
                x: [0, i % 2 === 0 ? 10 : -10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}

      {config.theme === "braces" && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 z-20 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
              "linear-gradient(90deg, #3b82f6 0%, #ec4899 50%, #8b5cf6 100%)",
              "linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #ec4899 100%)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedStoryImage;
