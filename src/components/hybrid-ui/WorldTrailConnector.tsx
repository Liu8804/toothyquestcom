import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isFromComplete = fromProgress === 100;
  const isActive = fromProgress > 0 && fromProgress < 100;
  const height = isMobile ? 80 : 100;
  const pathD = `M 20 ${height * 0.15} C 80 ${height * 0.95}, 220 ${height * 0.95}, 280 ${height * 0.15}`;

  // Stepping stones along the curve
  const stones = [0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map((t) => ({
    x: 20 + t * 260,
    y: height * 0.15 + Math.sin(t * Math.PI) * (height * 0.8),
    size: 6 + Math.sin(t * 2) * 2,
  }));

  return (
    <div className="relative flex justify-center items-center py-2 -my-1 z-10 overflow-hidden">
      {/* Subtle terrain glow */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: isFromComplete
            ? `radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--primary) / 0.2), transparent)`
            : `radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--muted-foreground) / 0.08), transparent)`,
        }}
      />

      <svg
        viewBox={`0 0 300 ${height}`}
        className={`w-full max-w-md ${isMobile ? "h-20" : "h-24"} pointer-events-none`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`wt-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
          </linearGradient>
          <filter id={`wt-glow-${index}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wide glowing road background */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={isFromComplete ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted-foreground) / 0.1)"}
          strokeWidth={isMobile ? 16 : 20}
          strokeLinecap="round"
          filter={isFromComplete ? `url(#wt-glow-${index})` : undefined}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.5 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Main trail path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={
            isFromComplete
              ? `url(#wt-grad-${index})`
              : "hsl(var(--muted-foreground) / 0.15)"
          }
          strokeWidth={isFromComplete ? (isMobile ? 8 : 10) : (isMobile ? 4 : 6)}
          strokeDasharray={isFromComplete ? "none" : "8 8"}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
        />

        {/* Stepping stones */}
        {stones.map((stone, i) => (
          <motion.ellipse
            key={`stone-${i}`}
            cx={stone.x}
            cy={stone.y}
            rx={stone.size}
            ry={stone.size * 0.5}
            fill={isFromComplete ? "hsl(var(--primary) / 0.25)" : "hsl(var(--muted-foreground) / 0.1)"}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.3, type: "spring" }}
          />
        ))}

        {/* Animated traveler dot */}
        {isFromComplete && (
          <motion.circle
            r={isMobile ? 3.5 : 4.5}
            fill="hsl(var(--primary))"
            initial={{ offsetDistance: "0%" }}
            whileInView={{ offsetDistance: "100%" }}
            viewport={{ once: true }}
            style={{ offsetPath: `path('${pathD}')` } as any}
            transition={{
              duration: 3,
              delay: 0.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Sparkle particles */}
        {isActive &&
          [0.25, 0.5, 0.75].map((t, i) => {
            const px = 20 + t * 260;
            const py = height * 0.15 + Math.sin(t * Math.PI) * (height * 0.8);
            return (
              <motion.circle
                key={`p-${i}`}
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

        {/* Star sparkles on completed */}
        {isFromComplete &&
          [0.2, 0.4, 0.6, 0.8].map((t, i) => {
            const px = 20 + t * 260;
            const py = height * 0.15 + Math.sin(t * Math.PI) * (height * 0.8);
            return (
              <motion.text
                key={`s-${i}`}
                x={px}
                y={py - 6}
                textAnchor="middle"
                fontSize="7"
                animate={{ opacity: [0, 0.7, 0], y: [py - 6, py - 14, py - 6] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
              >
                ✦
              </motion.text>
            );
          })}
      </svg>

      {/* Endpoint emojis */}
      <motion.div
        className="absolute left-[8%] md:left-[12%] flex flex-col items-center"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xl md:text-2xl drop-shadow-lg">{fromEmoji}</span>
        <div className="w-5 h-1 rounded-full bg-foreground/10 mt-0.5" />
      </motion.div>
      <motion.div
        className="absolute right-[8%] md:right-[12%] flex flex-col items-center"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <span className="text-xl md:text-2xl drop-shadow-lg">{toEmoji}</span>
        <div className="w-5 h-1 rounded-full bg-foreground/10 mt-0.5" />
      </motion.div>

      {/* Center indicator */}
      <motion.div
        className="absolute text-base"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {isFromComplete ? "⬇️" : "🔒"}
      </motion.div>
    </div>
  );
};

export default WorldTrailConnector;
