import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock, Unlock, RefreshCw, Crown, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePurchase, purchaseMessages, PRODUCT_ID } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseModal = ({ isOpen, onClose }: PurchaseModalProps) => {
  const { purchase, restorePurchase, isLoading, isRestoring, isPurchased } = usePurchase();
  const { playWinFanfare, playAchievementUnlock, playSound } = useGameSounds();

  const handlePurchase = async () => {
    const success = await purchase();
    if (success) {
      playWinFanfare();
      setTimeout(onClose, 2000);
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchase();
    if (success) {
      playAchievementUnlock();
      setTimeout(onClose, 2000);
    }
  };

  const features = [
    { emoji: "🎯", text: "25 more exciting quests" },
    { emoji: "🎮", text: "6 fun educational games" },
    { emoji: "🏆", text: "All rewards & surprises" },
    { emoji: "📖", text: "Every bedtime story" },
    { emoji: "✨", text: "Unlimited brushing adventures" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-gradient-to-b from-card to-background rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-primary via-bubble to-star p-6 text-center">
              {/* Floating decorations */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${10 + i * 20}%`,
                      top: `${20 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                    }}
                  >
                    {["⭐", "🦷", "✨", "🌟", "👑"][i]}
                  </motion.div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Crown icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-white mb-2">
                🦷✨ Unlock ToothyQuest! ✨🦷
              </h2>
              <p className="text-white/90 text-sm">
                Give your child full access to dental health fun!
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Message */}
              <div className="text-center space-y-2">
                <p className="text-foreground font-medium">
                  Pay <span className="text-primary font-bold text-xl">$3.99</span> one time to unlock all games, stories, and activities!
                </p>
                <p className="text-sm text-muted-foreground">
                  One-time purchase. No subscriptions. Forever access.
                </p>
              </div>
              {/* Already purchased state */}
              {isPurchased ? (
                <motion.div
                  className="text-center py-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-mint/20">
                    <Check className="w-8 h-8 text-mint" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    You're All Set!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {purchaseMessages.purchaseSuccess}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Features list */}
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-2xl">{feature.emoji}</span>
                        <span className="text-foreground font-medium">{feature.text}</span>
                        <Star className="w-4 h-4 text-star ml-auto" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Purchase button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isLoading || isRestoring}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-bubble to-star hover:opacity-90 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-5 h-5" />
                        Opening Checkout...
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Unlock className="w-5 h-5" />
                        Pay $3.99 to Unlock ToothyQuest
                      </span>
                    )}
                  </Button>

                  {/* Restore button - Required by Apple */}
                  <Button
                    onClick={handleRestore}
                    disabled={isLoading || isRestoring}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    {isRestoring ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Restoring...
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Restore Purchase
                      </span>
                    )}
                  </Button>

                  {/* Product ID note for developers */}
                  <p className="text-xs text-center text-muted-foreground/50">
                    Product ID: {PRODUCT_ID}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal;
