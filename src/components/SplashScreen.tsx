import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-sky-50 to-white cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
        >
          {/* Floating sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${5 + (i * 8)}%`,
                  top: `${10 + (i % 3) * 30}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + (i * 0.3),
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {["✨", "⭐", "🌟", "💫", "🎉"][i % 5]}
              </motion.div>
            ))}
          </div>

          {/* Logo container */}
          <motion.div
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.3 
            }}
          >
            <motion.img
              src={mascotWaving}
              alt="Toothy - Your Friendly Dental Buddy"
              className="w-52 md:w-64 lg:w-80 h-auto drop-shadow-2xl"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="mt-8 text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Welcome to ToothyQuest!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              🦷✨ Your dental adventure awaits! ✨🦷
            </p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            className="mt-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
            <span className="text-sm text-muted-foreground ml-2">Tap to continue</span>
          </motion.div>

          {/* Bottom decoration */}
          <motion.div
            className="absolute bottom-8 left-0 right-0 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            {["🎮", "📚", "🎯", "🏆"].map((emoji, i) => (
              <motion.span
                key={i}
                className="text-2xl"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
