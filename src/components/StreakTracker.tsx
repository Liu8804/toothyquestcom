import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Star, Trophy, Zap } from "lucide-react";

interface StreakTrackerProps {
  className?: string;
}

const StreakTracker = ({ className = "" }: StreakTrackerProps) => {
  const [streak, setStreak] = useState(0);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const streakData = JSON.parse(localStorage.getItem("streakData") || '{"count": 0, "lastDate": ""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (streakData.lastDate === today) {
      setStreak(streakData.count);
    } else if (streakData.lastDate === yesterday) {
      const newStreak = streakData.count + 1;
      setStreak(newStreak);
      localStorage.setItem("streakData", JSON.stringify({ count: newStreak, lastDate: today }));
      
      // Show bonus animation for milestone streaks
      if (newStreak % 7 === 0) {
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 3000);
      }
    } else {
      // Streak broken, start fresh
      setStreak(1);
      localStorage.setItem("streakData", JSON.stringify({ count: 1, lastDate: today }));
    }
  }, []);

  const getMilestone = () => {
    if (streak >= 30) return { icon: Trophy, color: "text-star", label: "Champion!" };
    if (streak >= 14) return { icon: Star, color: "text-secondary", label: "Superstar!" };
    if (streak >= 7) return { icon: Zap, color: "text-primary", label: "On Fire!" };
    return { icon: Flame, color: "text-secondary", label: "Keep Going!" };
  };

  const milestone = getMilestone();
  const MilestoneIcon = milestone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card ${className}`}
    >
      <motion.div
        animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
      >
        <MilestoneIcon className={`w-5 h-5 ${milestone.color}`} />
      </motion.div>
      
      <span className="font-display font-bold text-foreground">
        {streak} Day{streak !== 1 ? "s" : ""}
      </span>
      
      <span className="text-xs text-muted-foreground">{milestone.label}</span>

      {/* Bonus animation for milestones */}
      {showBonus && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1.5, 0], y: -40 }}
          transition={{ duration: 3 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-star text-white px-3 py-1 rounded-full font-display font-bold text-sm whitespace-nowrap"
        >
          🎉 {streak} Day Streak!
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakTracker;