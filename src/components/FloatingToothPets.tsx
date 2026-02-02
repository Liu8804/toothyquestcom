import { forwardRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { TOOTH_PETS, type ToothPet } from "@/data/rewardsConfig";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";

interface FloatingToothPetsProps {
  unlockedPets: string[];
  activePetId?: string;
  onQuestComplete?: boolean;
  className?: string;
}

const PET_REACTIONS = {
  idle: { scale: 1, rotate: 0 },
  happy: { scale: 1.1, rotate: [0, -5, 5, 0] },
  celebrating: { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] },
};

const FloatingToothPets = forwardRef<HTMLDivElement, FloatingToothPetsProps>(({ 
  unlockedPets, 
  activePetId = "toothy",
  onQuestComplete,
  className = "" 
}, ref) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentReaction, setCurrentReaction] = useState<keyof typeof PET_REACTIONS>("idle");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  
  // Get active pet
  const activePet = useMemo(() => 
    TOOTH_PETS.find(p => p.id === activePetId) || TOOTH_PETS[0],
  [activePetId]);

  // React to quest completion
  useEffect(() => {
    if (onQuestComplete) {
      setCurrentReaction("celebrating");
      setMessage("Yay! Great job! 🎉");
      setShowMessage(true);
      
      const timer = setTimeout(() => {
        setCurrentReaction("idle");
        setShowMessage(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [onQuestComplete]);

  // Less frequent idle animations (every 15 seconds instead of 8)
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      if (currentReaction === "idle" && Math.random() > 0.8) {
        const messages = ["Keep brushing! 🦷", "You're doing great!", "Smile bright! ✨"];
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShowMessage(true);
        
        setTimeout(() => setShowMessage(false), 2000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentReaction, prefersReducedMotion]);

  const handlePetClick = useCallback(() => {
    setCurrentReaction("happy");
    const reactions = ["Hello friend! 👋", "Clean teeth rock!", "Let's play! 🎮"];
    setMessage(reactions[Math.floor(Math.random() * reactions.length)]);
    setShowMessage(true);
    
    setTimeout(() => {
      setCurrentReaction("idle");
      setShowMessage(false);
    }, 2000);
  }, []);

  // Skip complex animations if reduced motion
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={`fixed bottom-20 right-4 z-50 ${className}`}>
        <div 
          className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-primary/30 bg-card cursor-pointer"
          onClick={handlePetClick}
        >
          {activePet.id === "toothy" ? (
            <img src={mascotWaving} alt="Toothy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {activePet.emoji}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`fixed bottom-20 right-4 z-50 ${className}`}>
      <motion.div
        className="cursor-pointer"
        onClick={handlePetClick}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={PET_REACTIONS[currentReaction]}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Simple float animation */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {activePet.id === "toothy" ? (
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-primary/30 bg-card">
                <img src={mascotWaving} alt="Toothy" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center shadow-lg border-2 border-primary/30">
                <span className="text-2xl">{activePet.emoji}</span>
              </div>
            )}
          </motion.div>

          {/* Speech bubble */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-12 right-0 bg-card text-foreground px-3 py-1.5 rounded-xl shadow-md text-xs font-medium whitespace-nowrap border border-border"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
});

FloatingToothPets.displayName = "FloatingToothPets";

export default FloatingToothPets;
