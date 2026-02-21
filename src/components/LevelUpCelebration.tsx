import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEffect } from "react";

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

const shockwaveRings = [
  { delay: 0.2, color: "hsl(var(--star-gold) / 0.4)" },
  { delay: 0.4, color: "hsl(var(--primary) / 0.3)" },
  { delay: 0.6, color: "hsl(var(--candy-pink) / 0.2)" },
];

const LevelUpCelebration = ({ isOpen, newLevel, onClose }: LevelUpCelebrationProps) => {
  const { playQuestComplete } = useMascotSounds();

  useEffect(() => {
    if (isOpen) {
      playQuestComplete();
    }
  }, [isOpen, playQuestComplete]);

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
        {/* Radial shockwave rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {shockwaveRings.map((ring, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{ borderColor: ring.color }}
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{
                width: [0, 600, 1200],
                height: [0, 600, 1200],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 1.5,
                delay: ring.delay,
                ease: "easeOut",
              }}
            />
          ))}
          {/* Central flash */}
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-star/40 blur-3xl"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 4, 6], opacity: [1, 0.6, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>

        {/* Confetti explosion */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                width: 4 + Math.random() * 6,
                height: 4 + Math.random() * 6,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600,
                opacity: [1, 1, 0],
                rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden"
        >
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-star via-accent to-primary rounded-3xl shadow-float p-8 text-center">
            
            {/* Mascot victory dance — bouncing and spinning */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="absolute top-3 right-3"
            >
              <motion.img
                src={mascotCelebrating}
                alt="Toothy celebrating"
                className="w-16 h-16 object-contain drop-shadow-lg"
                animate={{
                  y: [0, -12, 0, -8, 0],
                  rotate: [0, 15, -15, 10, -10, 0],
                  scale: [1, 1.15, 1, 1.1, 1],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
              {/* Victory sparkle ring around mascot */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-star/50"
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.div>

            {/* Zap burst icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-2"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-10 h-10 mx-auto text-white/80 fill-white/30" />
              </motion.div>
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

            {/* Level text with energy pulse */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mb-4 relative"
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <h1 className="relative font-display text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                LEVEL UP!
              </h1>
            </motion.div>

            {/* Level number with radial glow */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="mb-6 relative"
            >
              <motion.div
                className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-white/30 blur-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-float">
                <motion.span
                  className="font-display text-5xl font-bold text-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.9, type: "spring" }}
                >
                  {newLevel}
                </motion.span>
              </div>
            </motion.div>

            {/* Mascot speech bubble */}
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

            {/* Stars decoration with staggered entrance */}
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
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  >
                    <Star className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                  </motion.div>
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
