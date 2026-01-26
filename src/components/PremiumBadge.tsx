import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  variant?: "small" | "medium" | "large";
  className?: string;
  showText?: boolean;
}

const PremiumBadge = forwardRef<HTMLDivElement, PremiumBadgeProps>(({ 
  variant = "small", 
  className,
  showText = false 
}, ref) => {
  const sizes = {
    small: "w-5 h-5",
    medium: "w-6 h-6", 
    large: "w-8 h-8"
  };

  const iconSizes = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
    large: "w-5 h-5"
  };

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 relative",
        className
      )}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -5, 5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatDelay: 3 
        }}
        className={cn(
          "rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg ring-2 ring-amber-300/50",
          sizes[variant]
        )}
      >
        <Crown className={cn("text-white drop-shadow-sm", iconSizes[variant])} />
      </motion.div>
      
      {showText && (
        <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          PREMIUM
        </span>
      )}
      
      {/* Sparkle effect */}
      <motion.div
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        className="absolute -top-1 -right-1"
      >
        <Sparkles className="w-2 h-2 text-amber-400" />
      </motion.div>
    </motion.div>
  );
});

PremiumBadge.displayName = "PremiumBadge";

export default PremiumBadge;