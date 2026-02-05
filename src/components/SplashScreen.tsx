import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 1.5 seconds for quicker access
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 1500);

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
          {/* Minimal floating sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${10 + (i * 15)}%`,
                  top: `${15 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {["✨", "⭐", "🌟"][i % 3]}
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
            <MascotEmotionState
              emotion="loading"
              size="2xl"
              animate={true}
            />
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="mt-8 text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              ToothyQuest
            </h1>
            <p className="text-xl font-semibold text-primary mb-1">
              Brave smiles start here! ✨
            </p>
            <p className="text-base text-muted-foreground">
              Making dentist visits fun & fearless
            </p>
          </motion.div>

          {/* Prominent tap indicator */}
          <motion.div
            className="mt-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="px-6 py-3 bg-primary/10 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-lg font-bold text-primary">👆 Tap to start!</span>
            </motion.div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
