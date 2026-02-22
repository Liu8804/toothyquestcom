import { motion } from "framer-motion";
import { Lock, ChevronRight, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorldCardProps {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  backgroundImage?: string;
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
  backgroundImage,
  isLocked,
  progress = 0,
  onClick,
}: WorldCardProps) => {
  const isComplete = progress === 100;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.03, y: -6 } : {}}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className={cn(
        "relative w-full rounded-3xl text-left transition-all duration-300",
        "border-3 shadow-xl overflow-hidden group",
        "min-h-[220px] md:min-h-[260px]",
        isLocked
          ? "bg-muted/50 border-muted-foreground/20 cursor-not-allowed opacity-70"
          : isComplete
          ? "border-star/60 cursor-pointer hover:shadow-2xl hover:shadow-star/20"
          : "border-white/40 cursor-pointer hover:shadow-2xl"
      )}
    >
      {/* Background Image — full bleed */}
      {backgroundImage && !isLocked && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Gradient overlay for text readability */}
      {!isLocked && (
        <div className={cn(
          "absolute inset-0",
          backgroundImage
            ? "bg-gradient-to-t from-black/85 via-black/40 to-black/10"
            : `bg-gradient-to-br ${color}`
        )} />
      )}

      {/* Sparkle effect on hover */}
      {!isLocked && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground font-bold">Coming Soon</span>
          </div>
        </div>
      )}

      {/* World emoji — large, top-right */}
      {!isLocked && (
        <motion.div
          className="absolute top-4 right-4 text-5xl md:text-6xl z-10 drop-shadow-lg"
          animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {emoji}
        </motion.div>
      )}

      {/* Progress badge — top-left */}
      {!isLocked && progress > 0 && (
        <motion.div
          className={cn(
            "absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md font-bold text-sm",
            isComplete
              ? "bg-star/90 text-white shadow-lg shadow-star/40"
              : "bg-white/25 text-white"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          {isComplete ? <Sparkles className="w-4 h-4" /> : <Star className="w-4 h-4 fill-star text-star" />}
          {progress}%
        </motion.div>
      )}

      {/* Content — bottom aligned */}
      <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end z-0">
        <h3 className={cn(
          "font-display text-2xl md:text-3xl font-bold mb-1.5",
          isLocked ? "text-muted-foreground" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        )}>
          {name}
        </h3>

        <p className={cn(
          "text-sm md:text-base mb-4 line-clamp-2",
          isLocked ? "text-muted-foreground/70" : "text-white/90 drop-shadow-md"
        )}>
          {description}
        </p>

        {!isLocked && (
          <div className="flex items-center gap-3">
            {/* Progress bar — wider and more visible */}
            <div className="flex-1">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={cn(
                    "h-full rounded-full",
                    isComplete
                      ? "bg-gradient-to-r from-star to-amber-300"
                      : "bg-gradient-to-r from-white/90 to-white/70"
                  )}
                />
              </div>
            </div>
            <motion.div
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20"
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default WorldCard;
