import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChestItem {
  name: string;
  emoji: string;
  bonusPoints: number;
  message: string;
}

interface MysteryChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  chestItem: ChestItem | null;
}

const MysteryChestModal = ({ isOpen, onClose, chestItem }: MysteryChestModalProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    setIsOpened(true);
  };

  const handleClose = () => {
    setIsOpened(false);
    onClose();
  };

  if (!chestItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-gradient-to-br from-accent via-star to-secondary rounded-3xl shadow-float p-8 text-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [0, -100],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 2,
                    repeat: Infinity,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {!isOpened ? (
              <>
                {/* Chest icon */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-6"
                >
                  <span className="text-8xl block">🎁</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-2xl font-bold text-white mb-4 drop-shadow-lg"
                >
                  Mystery Chest!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 mb-6"
                >
                  You found a surprise! Open it to see what's inside!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleOpen}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Open Chest!
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {/* Revealed item */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mb-4"
                >
                  <span className="text-8xl block">{chestItem.emoji}</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
                >
                  {chestItem.name}!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 mb-4"
                >
                  {chestItem.message}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="font-display font-bold text-white">
                    +{chestItem.bonusPoints} Bonus Points!
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={handleClose}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                  >
                    Yay! 🎉
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MysteryChestModal;
