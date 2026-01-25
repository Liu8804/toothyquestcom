import { motion } from "framer-motion";
import { Flame, Star, Trophy, Zap } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

interface StreakTrackerProps {
  className?: string;
}

const StreakTracker = ({ className = "" }: StreakTrackerProps) => {
  const { currentStreak, loading, getMilestone } = useStreak();

  const milestone = getMilestone();

  const getIcon = () => {
    if (currentStreak >= 30) return Trophy;
    if (currentStreak >= 14) return Star;
    if (currentStreak >= 7) return Zap;
    return Flame;
  };

  const getColor = () => {
    if (currentStreak >= 30) return "text-star";
    if (currentStreak >= 14) return "text-secondary";
    if (currentStreak >= 7) return "text-primary";
    return "text-secondary";
  };

  const MilestoneIcon = getIcon();

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card ${className}`}>
        <Flame className="w-5 h-5 text-muted-foreground animate-pulse" />
        <span className="font-display font-bold text-muted-foreground">--</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card ${className}`}
    >
      <motion.div
        animate={{ scale: currentStreak > 0 ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5, repeat: currentStreak > 0 ? Infinity : 0, repeatDelay: 2 }}
      >
        <MilestoneIcon className={`w-5 h-5 ${getColor()}`} />
      </motion.div>
      
      <span className="font-display font-bold text-foreground">
        {currentStreak} Day{currentStreak !== 1 ? "s" : ""}
      </span>
      
      <span className="text-xs text-muted-foreground">{milestone.label}</span>
    </motion.div>
  );
};

export default StreakTracker;
