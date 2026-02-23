import { motion } from "framer-motion";
import { Lock, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useButtonSounds } from "@/hooks/useButtonSounds";
import FloatingMicroIcons from "@/components/ui/FloatingMicroIcons";

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
  const { playTap, playWhoosh } = useButtonSounds();

  const handleClick = () => {
    if (!isLocked) {
      playTap();
      playWhoosh();
    }
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={cn(
        "relative w-full rounded-3xl text-left transition-all duration-300",
        "border-2 overflow-hidden group",
        "aspect-[4/3] md:aspect-[3/2]",
        isLocked
          ? "bg-muted/50 border-muted-foreground/20 cursor-not-allowed opacity-70 shadow-md"
          : "border-white/30 cursor-pointer shadow-[0_6px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.15)] active:translate-y-1"
      )}
    >
      {/* Background Image */}
      {backgroundImage && !isLocked && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center image-3d-card"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {/* Specular highlight for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent pointer-events-none z-[1]" />
        </>
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

      {/* Subtle floating micro-icons */}
      {!isLocked && (
        <FloatingMicroIcons
          icons={["✨", "⭐", "🦷", "💫"]}
          count={3}
          speed={1.5}
          iconSize="xs"
          className="z-[2]"
        />
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
            {/* Progress bar - chunky Duolingo style */}
            <div className="flex-1 mr-4">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full bg-white rounded-full shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]"
                />
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
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
