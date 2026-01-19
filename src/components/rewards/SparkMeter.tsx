import { motion } from "framer-motion";
import { Sparkles, Star, Zap, Trophy } from "lucide-react";
import { getLevelForPoints, getProgressToNextLevel, getNextLevel, type Level } from "@/data/rewardsConfig";

interface SparkMeterProps {
  totalPoints: number;
  className?: string;
  showLevel?: boolean;
  compact?: boolean;
}

const SparkMeter = ({ totalPoints, className = "", showLevel = true, compact = false }: SparkMeterProps) => {
  const currentLevel = getLevelForPoints(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const progress = getProgressToNextLevel(totalPoints);

  const getLevelIcon = (level: Level) => {
    switch (level.level) {
      case 1: return Sparkles;
      case 2: return Zap;
      case 3: return Star;
      case 4: return Trophy;
      default: return Sparkles;
    }
  };

  const LevelIcon = getLevelIcon(currentLevel);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-star/20 to-accent/20 rounded-full ${className}`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-star" />
        </motion.div>
        <span className="font-display font-bold text-foreground text-sm">
          {totalPoints}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-2xl p-4 shadow-card ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-star to-accent"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-display font-bold text-foreground">Sparkle Meter</h3>
            <p className="text-xs text-muted-foreground">Keep earning points!</p>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-display text-2xl font-bold text-star"
        >
          {totalPoints}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-star rounded-full"
        />
        
        {/* Sparkle particles on progress bar */}
        {progress > 20 && (
          <motion.div
            animate={{ x: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Level info */}
      {showLevel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <LevelIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">
                {currentLevel.emoji} {currentLevel.name}
              </p>
              <p className="text-xs text-muted-foreground">Level {currentLevel.level}</p>
            </div>
          </div>
          
          {nextLevel && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next level</p>
              <p className="font-display font-bold text-sm text-primary">
                {nextLevel.minPoints - totalPoints} pts
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SparkMeter;
