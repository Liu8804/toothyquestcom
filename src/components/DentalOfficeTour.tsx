import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import toothyMascot from "@/assets/mascot-sticker-main-v2.png";

interface DentalEquipment {
  id: string;
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  position: { x: number; y: number };
  size: "sm" | "md" | "lg";
}

const dentalEquipment: DentalEquipment[] = [
  {
    id: "chair",
    name: "The Magic Chair",
    emoji: "🪑",
    description: "This special chair goes up, down, and tilts back like a spaceship seat! It helps the dentist see all your teeth perfectly.",
    funFact: "The chair can move in 5 different directions!",
    position: { x: 45, y: 55 },
    size: "lg",
  },
  {
    id: "light",
    name: "Super Bright Light",
    emoji: "💡",
    description: "This bright light helps the dentist see inside your mouth clearly. It's like having a tiny sun just for your teeth!",
    funFact: "It's 10 times brighter than your room light!",
    position: { x: 55, y: 25 },
    size: "md",
  },
  {
    id: "mirror",
    name: "Tiny Tooth Mirror",
    emoji: "🪞",
    description: "A teeny tiny mirror on a stick! The dentist uses it to see the back of your teeth like a detective.",
    funFact: "Dentists have used mirrors for over 100 years!",
    position: { x: 75, y: 45 },
    size: "sm",
  },
  {
    id: "suction",
    name: "Mr. Thirsty",
    emoji: "💨",
    description: "This funny straw slurps up water and spit so you don't have to swallow it. It makes a silly sound!",
    funFact: "It's called 'Mr. Thirsty' because it's always thirsty!",
    position: { x: 25, y: 50 },
    size: "sm",
  },
  {
    id: "brush",
    name: "Spinning Toothbrush",
    emoji: "🪥",
    description: "A special electric toothbrush that spins and polishes your teeth until they sparkle like diamonds!",
    funFact: "It spins 3000 times per minute!",
    position: { x: 70, y: 65 },
    size: "sm",
  },
  {
    id: "xray",
    name: "Picture Machine",
    emoji: "📷",
    description: "This cool camera takes pictures of your teeth, even the parts you can't see! It shows the dentist if your teeth are healthy inside.",
    funFact: "X-rays can see through your cheeks!",
    position: { x: 15, y: 30 },
    size: "md",
  },
  {
    id: "toothpaste",
    name: "Special Toothpaste",
    emoji: "🍓",
    description: "Yummy flavored paste that makes your teeth super clean! You can pick your favorite flavor like strawberry or bubblegum!",
    funFact: "There are over 50 different flavors!",
    position: { x: 85, y: 70 },
    size: "sm",
  },
  {
    id: "gloves",
    name: "Magic Gloves",
    emoji: "🧤",
    description: "The dentist wears special gloves to keep everything clean and germ-free. They come in fun colors too!",
    funFact: "Some gloves are purple, blue, or even pink!",
    position: { x: 30, y: 75 },
    size: "sm",
  },
];

interface EquipmentSpotProps {
  equipment: DentalEquipment;
  isActive: boolean;
  onClick: () => void;
  isExplored: boolean;
}

const EquipmentSpot = ({ equipment, isActive, onClick, isExplored }: EquipmentSpotProps) => {
  const sizeClasses = {
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${sizeClasses[equipment.size]} 
        rounded-full flex items-center justify-center cursor-pointer
        ${isActive 
          ? "bg-gradient-to-br from-yellow-400 to-orange-400 ring-4 ring-yellow-300 shadow-lg" 
          : isExplored 
            ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-md" 
            : "bg-gradient-to-br from-pink-400 to-purple-500 shadow-card hover:shadow-lg"
        }
        transition-all duration-300`}
      style={{ left: `${equipment.position.x}%`, top: `${equipment.position.y}%` }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      animate={!isExplored && !isActive ? { 
        scale: [1, 1.1, 1],
        boxShadow: ["0 0 0 0 rgba(236, 72, 153, 0.4)", "0 0 0 10px rgba(236, 72, 153, 0)", "0 0 0 0 rgba(236, 72, 153, 0)"]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className="drop-shadow-md">{equipment.emoji}</span>
      {isExplored && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
        >
          <span className="text-xs">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
};

interface DentalOfficeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const DentalOfficeTour = ({ isOpen, onClose }: DentalOfficeTourProps) => {
  const [selectedEquipment, setSelectedEquipment] = useState<DentalEquipment | null>(null);
  const [exploredItems, setExploredItems] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const handleEquipmentClick = (equipment: DentalEquipment) => {
    setSelectedEquipment(equipment);
    setExploredItems(prev => new Set([...prev, equipment.id]));
  };

  const handleCloseInfo = () => {
    setSelectedEquipment(null);
    // Check if all items explored
    if (exploredItems.size === dentalEquipment.length - 1 && selectedEquipment) {
      const newExplored = new Set([...exploredItems, selectedEquipment.id]);
      if (newExplored.size === dentalEquipment.length) {
        setTimeout(() => setShowCelebration(true), 300);
      }
    }
  };

  const resetTour = () => {
    setExploredItems(new Set());
    setSelectedEquipment(null);
    setShowCelebration(false);
  };

  const progress = (exploredItems.size / dentalEquipment.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden bg-gradient-to-b from-sky-100 to-blue-200">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm p-4 border-b shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.img
                src={toothyMascot}
                alt="Toothy mascot"
                className="w-10 h-10 object-contain"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Explore the Dental Office!</h2>
                <p className="text-xs text-muted-foreground">Tap on things to learn about them!</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Explored: {exploredItems.size}/{dentalEquipment.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Main office scene */}
        <div className="relative w-full h-full pt-28 pb-4 px-4">
          {/* Office background */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl">
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-teal-100" />
            
            {/* Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-200 to-amber-100" />
            
            {/* Wall decorations */}
            <motion.div 
              className="absolute top-8 left-8 text-4xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌈
            </motion.div>
            <motion.div 
              className="absolute top-12 right-12 text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              ⭐
            </motion.div>
            <motion.div 
              className="absolute top-6 left-1/3 text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ☀️
            </motion.div>

            {/* Window */}
            <div className="absolute top-8 right-1/4 w-24 h-32 bg-gradient-to-b from-sky-300 to-sky-400 rounded-lg border-4 border-white shadow-inner">
              <div className="absolute top-2 left-2 text-lg">☁️</div>
              <div className="absolute bottom-2 right-2 text-lg">🌤️</div>
            </div>

            {/* Poster on wall */}
            <div className="absolute top-10 left-1/4 w-20 h-24 bg-white rounded-lg shadow-md flex items-center justify-center">
              <div className="text-center p-2">
                <span className="text-2xl">😁</span>
                <p className="text-[8px] font-bold text-foreground mt-1">Smile!</p>
              </div>
            </div>

            {/* Plants */}
            <motion.div 
              className="absolute bottom-4 left-8 text-4xl"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🪴
            </motion.div>

            {/* Equipment spots */}
            {dentalEquipment.map((equipment) => (
              <EquipmentSpot
                key={equipment.id}
                equipment={equipment}
                isActive={selectedEquipment?.id === equipment.id}
                isExplored={exploredItems.has(equipment.id)}
                onClick={() => handleEquipmentClick(equipment)}
              />
            ))}

            {/* Toothy guide */}
            <motion.div
              className="absolute bottom-4 right-4 flex items-end gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="bg-white rounded-2xl px-3 py-2 shadow-card max-w-[150px]">
                <p className="text-xs font-medium text-foreground">
                  {exploredItems.size === 0 
                    ? "Tap the colorful spots!" 
                    : exploredItems.size === dentalEquipment.length 
                      ? "You found everything! 🎉"
                      : `${dentalEquipment.length - exploredItems.size} more to find!`
                  }
                </p>
              </div>
              <span className="text-5xl">🦷</span>
            </motion.div>
          </div>
        </div>

        {/* Equipment info panel */}
        <AnimatePresence>
          {selectedEquipment && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl p-6 z-30"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl shadow-sm"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {selectedEquipment.emoji}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">
                    {selectedEquipment.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {selectedEquipment.description}
                  </p>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-lg">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <p className="text-xs font-medium text-yellow-700">
                      Fun Fact: {selectedEquipment.funFact}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseInfo}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🏆
                </motion.div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Amazing Explorer!
                </h3>
                <p className="text-muted-foreground mb-4">
                  You discovered everything in the dental office! Now you know what to expect at your visit!
                </p>
                
                {/* Confetti effect */}
                {[...Array(20)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      y: [0, -100],
                      opacity: [1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    {["⭐", "✨", "🌟", "🎉", "🦷"][i % 5]}
                  </motion.span>
                ))}

                <div className="flex gap-3 justify-center">
                  <Button onClick={resetTour} variant="outline" className="rounded-full">
                    Explore Again
                  </Button>
                  <Button onClick={onClose} className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                    Done! 🎉
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DentalOfficeTour;
