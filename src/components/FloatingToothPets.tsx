import { forwardRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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
  happy: { scale: 1.2, rotate: [0, -10, 10, -10, 0] },
  celebrating: { scale: [1, 1.3, 1.1, 1.2, 1], rotate: [0, -15, 15, -10, 0] },
  bouncing: { y: [0, -20, 0, -15, 0] },
};

const FloatingToothPets = forwardRef<HTMLDivElement, FloatingToothPetsProps>(({ 
  unlockedPets, 
  activePetId = "toothy",
  onQuestComplete,
  className = "" 
}, ref) => {
  const [currentReaction, setCurrentReaction] = useState<keyof typeof PET_REACTIONS>("idle");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  
  // Get active pet
  const activePet = TOOTH_PETS.find(p => p.id === activePetId) || TOOTH_PETS[0];
  
  // Get secondary pets (unlocked but not active, show max 2)
  const secondaryPets = TOOTH_PETS
    .filter(p => unlockedPets.includes(p.id) && p.id !== activePetId)
    .slice(0, 2);

  // Mouse follow effect
  const mouseX = useMotionValue(window.innerWidth - 100);
  const mouseY = useMotionValue(window.innerHeight - 100);
  
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const petX = useSpring(mouseX, springConfig);
  const petY = useSpring(mouseY, springConfig);

  // Follow mouse with delay
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Keep pet in bottom-right area but let it drift towards cursor
      const targetX = Math.min(Math.max(e.clientX - 100, window.innerWidth - 200), window.innerWidth - 60);
      const targetY = Math.min(Math.max(e.clientY - 50, window.innerHeight - 200), window.innerHeight - 60);
      mouseX.set(targetX);
      mouseY.set(targetY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // React to quest completion
  useEffect(() => {
    if (onQuestComplete) {
      setCurrentReaction("celebrating");
      setMessage("Yay! Great job! 🎉");
      setShowMessage(true);
      
      setTimeout(() => {
        setCurrentReaction("idle");
        setShowMessage(false);
      }, 3000);
    }
  }, [onQuestComplete]);

  // Random idle animations
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentReaction === "idle" && Math.random() > 0.7) {
        setCurrentReaction("bouncing");
        const messages = [
          "Keep brushing! 🦷",
          "You're doing great!",
          "Let's learn more!",
          "Ready for adventure?",
          "Smile bright! ✨",
        ];
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShowMessage(true);
        
        setTimeout(() => {
          setCurrentReaction("idle");
          setShowMessage(false);
        }, 2000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [currentReaction]);

  const handlePetClick = useCallback(() => {
    setCurrentReaction("happy");
    const reactions = [
      "Hello friend! 👋",
      "I love brushing!",
      "Clean teeth rock!",
      "Let's play! 🎮",
      "Hehe! That tickles!",
    ];
    setMessage(reactions[Math.floor(Math.random() * reactions.length)]);
    setShowMessage(true);
    
    setTimeout(() => {
      setCurrentReaction("idle");
      setShowMessage(false);
    }, 2000);
  }, []);

  return (
    <div ref={ref} className={`fixed z-50 pointer-events-none ${className}`}>
      {/* Main Pet */}
      <motion.div
        style={{ x: petX, y: petY }}
        className="absolute pointer-events-auto cursor-pointer"
        onClick={handlePetClick}
      >
        <motion.div
          animate={PET_REACTIONS[currentReaction]}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative"
        >
          {/* Pet Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl scale-150" />
          
          {/* Pet Body */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Use mascot image for Toothy, emoji for other pets */}
            {activePet.id === "toothy" ? (
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-float border-2 border-primary/30 bg-gradient-to-br from-card to-muted">
                <img 
                  src={mascotWaving} 
                  alt="Toothy mascot"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-card to-muted rounded-full flex items-center justify-center shadow-float border-2 border-primary/30">
                <span className="text-3xl">{activePet.emoji}</span>
              </div>
            )}
            
            {/* Name tag */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
              {activePet.name}
            </div>
          </motion.div>

          {/* Speech bubble */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 bg-card text-foreground px-3 py-2 rounded-2xl shadow-card text-sm font-medium whitespace-nowrap border border-border"
              >
                {message}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-card" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Secondary Pets (smaller, following) */}
      {secondaryPets.map((pet, index) => (
        <motion.div
          key={pet.id}
          style={{ 
            x: petX, 
            y: petY,
          }}
          animate={{
            x: [null, -30 - (index * 25)],
            y: [null, 20 + (index * 20)],
          }}
          transition={{ delay: 0.2 + (index * 0.1), ...springConfig }}
          className="absolute pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-gradient-to-br from-card to-muted rounded-full flex items-center justify-center shadow-card border border-primary/20"
          >
            <span className="text-lg">{pet.emoji}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
});

FloatingToothPets.displayName = "FloatingToothPets";

export default FloatingToothPets;
