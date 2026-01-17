import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MotivationalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MotivationalPopup = ({ isOpen, onClose }: MotivationalPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-card rounded-3xl p-8 shadow-float max-w-md w-full text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Content */}
            <div className="relative z-10">
              {/* Animated stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                  >
                    <Star className="w-8 h-8 text-accent fill-accent" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-6xl mb-4"
              >
                🦸
              </motion.div>

              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Keep Going, Hero!
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Every quest you complete helps you grow a healthier, stronger smile! 
                Don't forget your daily adventures—your teeth will thank you!
              </p>

              <Button
                variant="hero"
                size="lg"
                onClick={onClose}
                className="gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Let's Go!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MotivationalPopup;
