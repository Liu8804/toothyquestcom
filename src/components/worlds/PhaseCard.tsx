import { motion } from "framer-motion";
import { Check, Lock, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhaseCardProps {
  id: string;
  name: string;
  description: string;
  emoji: string;
  badgeName: string;
  color: string;
  questCount: number;
  completedCount: number;
  isLocked: boolean;
  isCompleted: boolean;
  phaseNumber: number;
  onClick: () => void;
}

export const PhaseCard = ({
  id,
  name,
  description,
  emoji,
  badgeName,
  color,
  questCount,
  completedCount,
  isLocked,
  isCompleted,
  phaseNumber,
  onClick,
}: PhaseCardProps) => {
  const progress = questCount > 0 ? Math.round((completedCount / questCount) * 100) : 0;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: phaseNumber * 0.1 }}
      whileHover={!isLocked ? { scale: 1.02, x: 8 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative w-full p-5 rounded-2xl text-left transition-all duration-300",
        "border-2 overflow-hidden group",
        isLocked
          ? "bg-muted/30 border-muted-foreground/10 cursor-not-allowed shadow-sm"
          : isCompleted
          ? "bg-gradient-to-r from-mint/20 to-primary/20 border-mint/40 shadow-[0_4px_0_0_hsl(var(--mint)/0.4)]"
          : `${color} border-white/20 cursor-pointer shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-[2px]`
      )}
    >
      {/* Phase number badge */}
      <div className={cn(
        "absolute -top-1 -left-1 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg",
        isLocked
          ? "bg-muted text-muted-foreground"
          : isCompleted
          ? "bg-mint text-white"
          : "bg-white text-foreground"
      )}>
        {isCompleted ? <Check className="w-5 h-5" /> : phaseNumber}
      </div>

      <div className="ml-8 flex items-center gap-4">
        {/* Emoji */}
        <div className="text-4xl">{emoji}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "font-display font-bold text-lg",
              isLocked ? "text-muted-foreground" : "text-white"
            )}>
              {name}
            </h4>
            {isCompleted && (
              <Trophy className="w-5 h-5 text-star fill-star" />
            )}
          </div>

          <p className={cn(
            "text-sm line-clamp-1 mb-2",
            isLocked ? "text-muted-foreground/60" : "text-white/80"
          )}>
            {description}
          </p>

          {/* Progress - chunky bar */}
          {!isLocked && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]",
                    isCompleted ? "bg-mint" : "bg-white"
                  )}
                />
              </div>
              <span className={cn(
                "text-xs font-semibold whitespace-nowrap",
                isLocked ? "text-muted-foreground" : "text-white"
              )}>
                {completedCount}/{questCount}
              </span>
            </div>
          )}

          {/* Badge preview with reward pop */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="mt-2 inline-flex items-center gap-1 bg-star/20 text-star px-2 py-0.5 rounded-full text-xs font-semibold"
            >
              🏆 {badgeName}
            </motion.div>
          )}
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight className={cn(
            "w-5 h-5 flex-shrink-0",
            isCompleted ? "text-mint" : "text-white"
          )} />
        )}

        {/* Lock icon */}
        {isLocked && (
          <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
};

export default PhaseCard;
