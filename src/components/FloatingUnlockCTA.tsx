import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";

const FloatingUnlockCTA = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { isPurchased } = usePurchase();
  const { questProgress } = useQuestProgress();
  const { playAchievementUnlock, playSound } = useGameSounds();
  
  const completedQuestsCount = questProgress.length;
  const shouldShow = !isPurchased && completedQuestsCount >= FREE_QUEST_LIMIT && !isDismissed;
  
  // Play sound when CTA first appears
  useEffect(() => {
    if (shouldShow && completedQuestsCount === FREE_QUEST_LIMIT) {
      playAchievementUnlock();
    }
  }, [shouldShow, completedQuestsCount, playAchievementUnlock]);

  const handleOpenPurchase = () => {
    playSound("success");
    setShowPurchaseModal(true);
  };

  const handleDismiss = () => {
    playSound("tap");
    setIsDismissed(true);
  };

  if (!shouldShow) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 100 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="fixed bottom-6 right-6 z-50"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded((v) => !v)}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded((v) => !v);
            }
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
          
          <motion.div
            layout
            className="relative bg-gradient-to-r from-primary to-secondary rounded-full shadow-float overflow-hidden"
          >
            <div className="flex items-center gap-3 p-2">
              {/* Crown icon button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPurchase();
                }}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground"
              >
                <Crown className="w-7 h-7" />
              </motion.button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 pr-4 overflow-hidden"
                  >
                    <div className="text-primary-foreground whitespace-nowrap">
                      <p className="font-bold text-sm">🎉 First 5 quests done!</p>
                      <p className="text-xs opacity-90">Unlock 25 more adventures</p>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPurchase();
                      }}
                      size="sm"
                      className="bg-white text-primary hover:bg-white/90 font-bold whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Unlock All
                    </Button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                      }}
                      className="p-1 rounded-full hover:bg-white/20 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Floating sparkles */}
          <motion.div
            animate={{ 
              y: [-5, 5, -5],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut"
            }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ✨
          </motion.div>
          
          {/* Notification badge */}
          {!isExpanded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-lg"
            >
              <Lock className="w-3 h-3" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </>
  );
};

export default FloatingUnlockCTA;
