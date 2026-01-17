import { motion } from "framer-motion";
import { Star, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import toothyLogo from "@/assets/toothyquest-logo.jpeg";
import MascotWithExpression from "@/components/MascotWithExpression";

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
  "hsl(var(--secondary))",
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
    <div className="relative text-center py-8 overflow-hidden">
      {/* Confetti particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
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

      {/* Logo badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-4"
      >
        <img
          src={toothyLogo}
          alt="ToothyQuest"
          className="w-16 h-16 rounded-full mx-auto shadow-float border-3 border-primary"
        />
      </motion.div>
      
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="mb-6"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-star to-accent rounded-full flex items-center justify-center shadow-float">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Trophy className="w-16 h-16 text-primary-foreground" />
          </motion.div>
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
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            >
              <Star className="w-10 h-10 text-star fill-star" />
            </motion.div>
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
        className="flex items-center justify-center gap-2 text-mint font-bold mb-6"
      >
        <Sparkles className="w-5 h-5" />
        <span>Your teeth are sparkling clean!</span>
        <Sparkles className="w-5 h-5" />
      </motion.div>

      {/* Mascot celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1 }}
        className="mb-6"
      >
        <MascotWithExpression 
          expression="cheering" 
          size="md"
          showSpeechBubble
          message="Fantastic brushing!"
        />
      </motion.div>
      
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
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
