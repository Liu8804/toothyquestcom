import { motion } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { purchaseMessages } from "@/hooks/usePurchase";

interface LockedContentOverlayProps {
  onUnlock: () => void;
  contentType?: 'quest' | 'game';
  className?: string;
}

const LockedContentOverlay = ({ 
  onUnlock, 
  contentType = 'quest',
  className = "" 
}: LockedContentOverlayProps) => {
  return (
    <motion.div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-sm rounded-2xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Lock icon with glow */}
      <motion.div
        className="relative mb-4"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
        <div className="relative p-4 bg-gradient-to-br from-primary/20 to-bubble/20 rounded-full">
          <Lock className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      {/* Locked message */}
      <h4 className="font-display text-lg font-bold text-foreground text-center mb-2">
        {contentType === 'game' ? 'Game Locked' : 'Quest Locked'}
      </h4>
      <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
        {purchaseMessages.lockedContent}
      </p>

      {/* Unlock button */}
      <Button
        onClick={onUnlock}
        className="gap-2 bg-gradient-to-r from-primary to-star hover:opacity-90 text-white shadow-lg"
      >
        <Crown className="w-4 h-4" />
        Unlock Full Adventure
      </Button>

      {/* Decorative sparkles */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5 text-star/50" />
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-4"
        animate={{ rotate: [360, 180, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        <Sparkles className="w-5 h-5 text-primary/50" />
      </motion.div>
    </motion.div>
  );
};

export default LockedContentOverlay;
