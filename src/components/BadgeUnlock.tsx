import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

interface Badge {
  name: string;
  emoji: string;
  description: string;
}

interface BadgeUnlockProps {
  isOpen: boolean;
  badge: Badge | null;
  onClose: () => void;
}

const BadgeUnlock = ({ isOpen, badge, onClose }: BadgeUnlockProps) => {
  if (!isOpen || !badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 20 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-card rounded-3xl shadow-float p-8 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mascot Celebration */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <motion.img
              src={mascotCelebrating}
              alt="Toothy celebrating"
              className="w-16 h-16 mx-auto drop-shadow-lg"
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          {/* Glowing effect behind badge */}
          <motion.div
            className="relative mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Glow circles */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-star"
                  style={{
                    transform: `rotate(${i * 60}deg) translateY(-60px)`,
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>

            {/* Badge container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", duration: 0.8 }}
              className="relative z-10 w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-star via-accent to-primary flex items-center justify-center shadow-float"
            >
              <motion.span
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {badge.emoji}
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Badge info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              New Badge Unlocked!
            </h2>
            <h3 className="font-display text-xl font-bold text-primary mb-2">
              {badge.name}
            </h3>
            <p className="text-muted-foreground mb-6">{badge.description}</p>
          </motion.div>

          {/* Mascot with speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-3 max-w-[200px] mx-auto border border-primary/20">
              <div className="flex items-center gap-2">
                <motion.img
                  src={mascotCelebrating}
                  alt="Toothy"
                  className="w-10 h-10 object-contain"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <p className="text-foreground font-medium text-sm">
                  You earned it! 🎉
                </p>
              </div>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={onClose}
              className="rounded-full font-display font-bold px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeUnlock;