import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, PartyPopper, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const ANNOUNCEMENT_DISMISSED_KEY = "toothyquest_price_announcement_dismissed";

const PriceChangeAnnouncement = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if announcement was already dismissed
    const dismissed = localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY);
    if (!dismissed) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="relative w-full max-w-md bg-gradient-to-b from-card to-background rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti header */}
            <div className="relative bg-gradient-to-r from-primary via-bubble to-star p-6 text-center overflow-hidden">
              {/* Floating celebration elements */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${5 + i * 12}%`,
                      top: `${10 + (i % 3) * 30}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {["🎉", "✨", "🦷", "⭐", "🎊", "💫", "🏆", "🎁"][i]}
                  </motion.div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PartyPopper className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Exciting News! 🎉
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="text-center space-y-4">
                <p className="text-foreground text-lg font-medium">
                  ToothyQuest is growing with even more content!
                </p>
                
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-foreground text-sm text-left">
                      <strong>New subscribers:</strong> $4.99/month or $49.99/year for full access to 50+ quests, games, and rewards!
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-mint flex-shrink-0" />
                    <p className="text-foreground text-sm text-left">
                      <strong>Existing subscribers:</strong> Stay at your $3.99/month rate forever! 🎁
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">
                  Thank you for being part of the ToothyQuest family!
                </p>
              </div>

              <Button
                onClick={handleDismiss}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary via-bubble to-star hover:opacity-90 text-white"
              >
                Got it! Let's explore! 🦷
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceChangeAnnouncement;
