import { motion, AnimatePresence } from "framer-motion";
import { Hand } from "lucide-react";

interface SwipeHintProps {
  isVisible: boolean;
  message?: string;
}

const SwipeHint = ({ isVisible, message = "Swipe to brush your teeth!" }: SwipeHintProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-card/95 backdrop-blur-md rounded-full px-6 py-3 shadow-float border border-border/50"
        >
          {/* Animated hand */}
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-primary"
          >
            <Hand className="w-6 h-6" />
          </motion.div>

          {/* Arrow trail */}
          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-primary">→</span>
            <span className="text-primary/70">→</span>
            <span className="text-primary/40">→</span>
          </motion.div>

          {/* Message */}
          <span className="font-display font-bold text-foreground">
            {message}
          </span>

          {/* Sparkle */}
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-star"
          >
            ✨
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeHint;
