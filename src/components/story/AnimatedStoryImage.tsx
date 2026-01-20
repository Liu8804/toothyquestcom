import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedStoryImageProps {
  src: string;
  alt: string;
  storyId: string;
  className?: string;
}

// Get animation config based on story theme
const getStoryAnimationConfig = (storyId: string) => {
  // Braces stories - metallic shimmer
  if (storyId.includes("braces") || storyId.includes("bracey") || storyId.includes("bands")) {
    return {
      imageAnimation: {
        filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
      },
      overlayElements: [
        { emoji: "✨", position: "top-right" },
        { emoji: "🎀", position: "bottom-left" },
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
        { emoji: "🦸", position: "top-left" },
        { emoji: "💫", position: "center-right" },
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
        { emoji: "👾", position: "top-right" },
        { emoji: "🍬", position: "bottom-right" },
        { emoji: "🦠", position: "top-left" },
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
        { emoji: "🪥", position: "top-left" },
        { emoji: "✨", position: "center" },
        { emoji: "💧", position: "bottom-right" },
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
        { emoji: "👨‍⚕️", position: "top-right" },
        { emoji: "🏥", position: "bottom-left" },
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
        { emoji: "🧚", position: "top-right" },
        { emoji: "✨", position: "center" },
        { emoji: "⭐", position: "bottom-left" },
        { emoji: "🌙", position: "top-left" },
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
      { emoji: "🦷", position: "top-right" },
    ],
    theme: "default",
    glowColor: "from-primary/20",
  };
};

const positionClasses: Record<string, string> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
  "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "center-right": "top-1/2 right-2 -translate-y-1/2",
  "center-left": "top-1/2 left-2 -translate-y-1/2",
};

export const AnimatedStoryImage = ({
  src,
  alt,
  storyId,
  className = "",
}: AnimatedStoryImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const config = getStoryAnimationConfig(storyId);

  // Periodic interaction animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowInteraction(true);
      setTimeout(() => setShowInteraction(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
        className="w-full h-full object-cover relative z-10"
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
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      />

      {/* Floating character elements */}
      {config.overlayElements.map((element, i) => (
        <motion.div
          key={i}
          className={`absolute ${positionClasses[element.position]} z-20 pointer-events-none`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.2, 1],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          <span className="text-2xl drop-shadow-lg">{element.emoji}</span>
        </motion.div>
      ))}

      {/* Interactive sparkle burst on hover/tap */}
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
                  {["✨", "⭐", "💫", "🌟"][i % 4]}
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
          className="absolute bottom-0 left-0 right-0 h-1 z-20"
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
