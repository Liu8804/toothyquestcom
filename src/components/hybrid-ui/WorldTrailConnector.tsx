import { motion } from "framer-motion";

interface WorldTrailConnectorProps {
  fromProgress: number; // 0-100
  toProgress: number;
  index: number;
  fromEmoji: string;
  toEmoji: string;
}

const WorldTrailConnector = ({
  fromProgress,
  toProgress,
  index,
  fromEmoji,
  toEmoji,
}: WorldTrailConnectorProps) => {
  const isFromComplete = fromProgress === 100;
  const isActive = fromProgress > 0 && fromProgress < 100;

  return (
    <div className="relative flex justify-center items-center py-1 -my-2 z-10">
      <svg
        viewBox="0 0 200 48"
        className="w-48 h-12 pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`wt-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
          </linearGradient>
        </defs>

        {/* Dashed trail */}
        <motion.path
          d="M 30 8 C 60 40, 140 40, 170 8"
          fill="none"
          stroke={
            isFromComplete
              ? `url(#wt-grad-${index})`
              : "hsl(var(--muted-foreground) / 0.2)"
          }
          strokeWidth={isFromComplete ? 2.5 : 1.5}
          strokeDasharray={isFromComplete ? "none" : "5 5"}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
        />

        {/* Animated particles on active trail */}
        {isActive &&
          [0.3, 0.55, 0.8].map((t, i) => {
            const px = 30 + t * 140;
            const py = 8 + Math.sin(t * Math.PI) * 32;
            return (
              <motion.circle
                key={i}
                cx={px}
                cy={py}
                r={2.5}
                fill="hsl(var(--primary) / 0.7)"
                animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            );
          })}

        {/* Sparkle dots on completed trail */}
        {isFromComplete &&
          [0.25, 0.5, 0.75].map((t, i) => {
            const px = 30 + t * 140;
            const py = 8 + Math.sin(t * Math.PI) * 32;
            return (
              <motion.circle
                key={`s-${i}`}
                cx={px}
                cy={py}
                r={2}
                fill="hsl(var(--star) / 0.8)"
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
            );
          })}
      </svg>

      {/* Center chevron indicator */}
      <motion.div
        className="absolute text-lg"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {isFromComplete ? "⬇️" : "🔒"}
      </motion.div>
    </div>
  );
};

export default WorldTrailConnector;
