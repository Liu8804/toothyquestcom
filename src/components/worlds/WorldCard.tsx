import { motion } from "framer-motion";
import { Lock, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorldCardProps {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  isLocked: boolean;
  progress?: number;
  onClick: () => void;
}

export const WorldCard = ({
  id,
  name,
  description,
  emoji,
  color,
  isLocked,
  progress = 0,
  onClick,
}: WorldCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative w-full p-6 rounded-3xl text-left transition-all duration-300",
        "border-2 shadow-lg overflow-hidden group",
        isLocked
          ? "bg-muted/50 border-muted-foreground/20 cursor-not-allowed opacity-70"
          : `bg-gradient-to-br ${color} border-white/30 cursor-pointer hover:shadow-xl`
      )}
    >
      {/* Background decoration */}
      {!isLocked && (
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground font-medium">Coming Soon</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-0">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl">{emoji}</div>
          {!isLocked && progress > 0 && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-star fill-star" />
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
          )}
        </div>

        <h3 className={cn(
          "font-display text-xl font-bold mb-2",
          isLocked ? "text-muted-foreground" : "text-white"
        )}>
          {name}
        </h3>

        <p className={cn(
          "text-sm mb-4 line-clamp-2",
          isLocked ? "text-muted-foreground/70" : "text-white/80"
        )}>
          {description}
        </p>

        {!isLocked && (
          <div className="flex items-center justify-between">
            {/* Progress bar */}
            <div className="flex-1 mr-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default WorldCard;
