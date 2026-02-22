import { motion } from "framer-motion";

interface MinimapWorld {
  id: string;
  emoji: string;
  name: string;
  progress: number; // 0-100
}

interface ProgressionMinimapProps {
  worlds: MinimapWorld[];
  activeWorldId: string | null;
  onWorldClick: (id: string) => void;
}

const ProgressionMinimap = ({ worlds, activeWorldId, onWorldClick }: ProgressionMinimapProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-1 bg-card/80 backdrop-blur-md rounded-2xl p-2 shadow-card border border-border/50"
    >
      {worlds.map((world, idx) => {
        const isActive = activeWorldId === world.id;
        const isComplete = world.progress === 100;

        return (
          <div key={world.id} className="flex flex-col items-center">
            {/* Trail line between dots */}
            {idx > 0 && (
              <div
                className="w-0.5 h-3 -mt-1 -mb-0.5 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: worlds[idx - 1].progress === 100
                    ? "hsl(var(--primary) / 0.6)"
                    : "hsl(var(--muted-foreground) / 0.15)",
                }}
              />
            )}

            {/* World dot */}
            <motion.button
              onClick={() => onWorldClick(world.id)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                isActive
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                  : "hover:scale-105"
              }`}
              style={{
                background: isComplete
                  ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                  : "hsl(var(--muted))",
              }}
              whileTap={{ scale: 0.9 }}
              title={`${world.name} (${world.progress}%)`}
            >
              <span className="text-base">{world.emoji}</span>

              {/* Progress ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.3)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(world.progress / 100) * 100.5} 100.5`}
                  initial={{ strokeDasharray: "0 100.5" }}
                  animate={{
                    strokeDasharray: `${(world.progress / 100) * 100.5} 100.5`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>

              {/* Completion star */}
              {isComplete && (
                <motion.span
                  className="absolute -top-1 -right-1 text-xs"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  ⭐
                </motion.span>
              )}
            </motion.button>
          </div>
        );
      })}
    </motion.div>
  );
};

export default ProgressionMinimap;
