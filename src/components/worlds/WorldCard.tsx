import { motion } from "framer-motion";
import { Lock, ChevronRight, Star } from "lucide-react";
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
  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative w-full rounded-3xl text-left transition-all duration-300",
        "border-2 shadow-lg overflow-hidden group",
        "aspect-[4/3] md:aspect-[3/2]",
        isLocked
          ? "bg-muted/50 border-muted-foreground/20 cursor-not-allowed opacity-70"
          : "border-white/30 cursor-pointer hover:shadow-xl"
      )}
    >
      {/* Background Image */}
      {backgroundImage && !isLocked && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Gradient overlay for text readability */}
      {!isLocked && (
        <div className={cn(
          "absolute inset-0",
          backgroundImage 
            ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" 
            : `bg-gradient-to-br ${color}`
        )} />
      )}

      {/* Hover effect */}
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
      <div className="absolute inset-0 p-5 flex flex-col justify-end z-0">
        <div className="flex items-start justify-between mb-2">
          {!backgroundImage && <div className="text-4xl">{emoji}</div>}
          {!isLocked && progress > 0 && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full ml-auto">
              <Star className="w-4 h-4 text-star fill-star" />
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
          )}
        </div>

        <h3 className={cn(
          "font-display text-xl font-bold mb-1",
          isLocked ? "text-muted-foreground" : "text-white drop-shadow-lg"
        )}>
          {name}
        </h3>

        <p className={cn(
          "text-sm mb-3 line-clamp-2",
          isLocked ? "text-muted-foreground/70" : "text-white/90 drop-shadow-md"
        )}>
          {description}
        </p>

        {!isLocked && (
          <div className="flex items-center justify-between">
            {/* Progress bar */}
            <div className="flex-1 mr-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
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
