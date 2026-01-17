import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyChallengeNotificationProps {
  isOpen: boolean;
  challengeTitle: string;
  xpEarned: number;
  onClose: () => void;
}

const confettiColors = [
  "hsl(var(--primary))",
  "hsl(var(--star-gold))",
  "hsl(var(--candy-pink))",
  "hsl(var(--mint-fresh))",
];

const DailyChallengeNotification = ({
  isOpen,
  challengeTitle,
  xpEarned,
  onClose,
}: DailyChallengeNotificationProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -100, x: "-50%" }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-4 left-1/2 z-[100] min-w-[300px] max-w-md"
        >
          <div className="relative bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-float p-4 text-white overflow-hidden">
            {/* Mini confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: confettiColors[i % confettiColors.length],
                    left: `${10 + Math.random() * 80}%`,
                    top: "50%",
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [0, -30, 50],
                    x: (Math.random() - 0.5) * 40,
                    opacity: [1, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.3,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-3xl"
              >
                🎯
              </motion.div>
              
              <div className="flex-1">
                <p className="font-bold text-sm">Challenge Complete!</p>
                <p className="text-white/90 text-sm">{challengeTitle}</p>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1"
              >
                <Sparkles className="w-4 h-4 text-star" />
                <span className="font-bold">+{xpEarned} XP</span>
              </motion.div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyChallengeNotification;
