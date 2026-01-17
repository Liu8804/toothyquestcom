import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface QuestProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showMilestones?: boolean;
  className?: string;
}

const QuestProgressBar = ({
  current,
  total,
  label = "Quest Progress",
  showMilestones = true,
  className = "",
}: QuestProgressBarProps) => {
  const percentage = Math.min((current / total) * 100, 100);
  const milestones = [25, 50, 75, 100];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-display font-bold text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {current} / {total}
          </span>
        </div>
      )}

      <div className="relative h-6 bg-muted rounded-full overflow-hidden shadow-inner">
        {/* Milestone markers */}
        {showMilestones && milestones.map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-0.5 bg-background/50"
            style={{ left: `${milestone}%` }}
          />
        ))}

        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-star rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>

        {/* Progress indicator icon */}
        {percentage > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${percentage}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-star flex items-center justify-center shadow-card"
            >
              <Star className="w-4 h-4 text-white fill-white" />
            </motion.div>
          </motion.div>
        )}

        {/* Sparkles at end when complete */}
        {percentage >= 100 && (
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Milestone labels */}
      {showMilestones && (
        <div className="flex justify-between mt-1 px-2">
          {milestones.map((milestone) => (
            <motion.span
              key={milestone}
              className={`text-xs font-medium transition-colors ${
                percentage >= milestone ? "text-primary" : "text-muted-foreground"
              }`}
              animate={percentage >= milestone ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {percentage >= milestone ? "⭐" : `${milestone}%`}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestProgressBar;