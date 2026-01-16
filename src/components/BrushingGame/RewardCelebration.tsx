import { motion } from "framer-motion";
import { Star, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardCelebrationProps {
  onPlayAgain: () => void;
  onClose: () => void;
}

const confettiColors = [
  "hsl(var(--primary))",
  "hsl(var(--star-gold))",
  "hsl(var(--candy-pink))",
  "hsl(var(--mint-fresh))",
  "hsl(var(--bubble-blue))",
];

export const RewardCelebration = ({
  onPlayAgain,
  onClose,
}: RewardCelebrationProps) => {
  const messages = [
    "Super Brusher!",
    "Tooth Hero!",
    "Sparkling Champion!",
    "Dental Superstar!",
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="relative text-center py-8">
      {/* Confetti particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: 400,
            opacity: [1, 1, 0],
            rotate: 720,
            x: Math.random() * 100 - 50,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-6"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-star to-accent rounded-full flex items-center justify-center shadow-float">
          <Trophy className="w-16 h-16 text-primary-foreground" />
        </div>
      </motion.div>
      
      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-2 mb-4"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
          >
            <Star className="w-10 h-10 text-star fill-star" />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Message */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2"
      >
        {randomMessage}
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground text-lg mb-2"
      >
        You brushed for 2 whole minutes!
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-2 text-mint font-bold mb-8"
      >
        <Sparkles className="w-5 h-5" />
        <span>Your teeth are sparkling clean!</span>
        <Sparkles className="w-5 h-5" />
      </motion.div>
      
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button
          onClick={onPlayAgain}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-8 py-6 text-lg"
        >
          🦷 Brush Again!
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-2xl px-8 py-6 text-lg"
        >
          All Done!
        </Button>
      </motion.div>
    </div>
  );
};

export default RewardCelebration;
