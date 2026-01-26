import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

interface LevelUpCelebrationProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

const confettiColors = [
  "hsl(var(--primary))",
  "hsl(var(--star-gold))",
  "hsl(var(--candy-pink))",
  "hsl(var(--mint-fresh))",
  "hsl(var(--bubble-blue))",
  "hsl(var(--secondary))",
];

const LevelUpCelebration = ({ isOpen, newLevel, onClose }: LevelUpCelebrationProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-foreground/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden"
        >
          {/* Confetti explosion */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: confettiColors[i % confettiColors.length],
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  opacity: [1, 1, 0],
                  rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.3,
                }}
              />
            ))}
          </div>

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-star via-accent to-primary rounded-3xl shadow-float p-8 text-center">
            {/* Logo in corner */}
            {/* Mascot in corner */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 right-4"
            >
              <motion.img
                src={mascotCelebrating}
                alt="Toothy celebrating"
                className="w-14 h-14 object-contain drop-shadow-lg"
                animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>

            {/* Crown animation */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Level text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mb-4"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                LEVEL UP!
              </h1>
            </motion.div>

            {/* Level number */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-float">
                <span className="font-display text-5xl font-bold text-primary">{newLevel}</span>
              </div>
            </motion.div>

            {/* Mascot with message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 max-w-[250px] mx-auto border border-primary/20">
                <div className="flex items-center gap-3">
                  <motion.img
                    src={mascotCelebrating}
                    alt="Toothy celebrating"
                    className="w-14 h-14 object-contain"
                    animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <p className="text-foreground font-medium text-sm text-left">
                    You're amazing! Keep going! 🌟
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stars decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-3 mb-6"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
                >
                  <Star className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                </motion.div>
              ))}
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue Adventure!
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelUpCelebration;