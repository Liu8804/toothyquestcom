import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface FirstTapCelebrationProps {
  isActive: boolean;
  onComplete: () => void;
}

const FirstTapCelebration = ({ isActive, onComplete }: FirstTapCelebrationProps) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#DDA0DD", "#98D8C8"][
          Math.floor(Math.random() * 6)
        ],
      }));
      setConfettiPieces(pieces);

      // Complete after animation
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      >
        {/* Confetti */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: piece.color,
              left: `${piece.x}%`,
            }}
            initial={{ y: "50vh", opacity: 1, scale: 0 }}
            animate={{
              y: ["50vh", "-10vh"],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              rotate: [0, 360, 720],
              x: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: Math.random() * 0.3,
            }}
          />
        ))}

        {/* Central sparkle burst */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles className="w-24 h-24 text-star" />
        </motion.div>

        {/* Star burst */}
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 text-4xl"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1],
              opacity: [1, 0],
              x: Math.cos((i * Math.PI) / 4) * 150,
              y: Math.sin((i * Math.PI) / 4) * 150,
            }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            ⭐
          </motion.span>
        ))}

        {/* Coin animation */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2"
          initial={{ y: 0, scale: 0, opacity: 0 }}
          animate={{ y: [-50, -150], scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg border-4 border-yellow-300">
            <span className="text-2xl">⭐</span>
          </div>
        </motion.div>

        {/* Reward text */}
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20], scale: [0.8, 1, 1, 0.8] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <span className="font-display text-4xl font-bold text-white drop-shadow-lg">
            +10 XP! 🎉
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstTapCelebration;
