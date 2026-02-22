import { motion } from "framer-motion";

interface Props {
  from: { x: number; y: number };
  to: { x: number; y: number };
  status: "completed" | "active" | "unlocked" | "locked";
  nextStatus: "completed" | "active" | "unlocked" | "locked";
  index: number;
  isNextActive: boolean;
}

const HybridTrailPath = ({ from, to, status, nextStatus, index, isNextActive }: Props) => {
  // Convert percentage positions to SVG viewbox (offset to center of node)
  const nodeOffset = 34; // half of 68px node, but in % terms we approximate
  const x1 = from.x + 4;
  const y1 = from.y + 4;
  const x2 = to.x + 4;
  const y2 = to.y + 4;

  // Curve control point for organic feel
  const midX = (x1 + x2) / 2 + (index % 2 === 0 ? 8 : -8);
  const midY = (y1 + y2) / 2;

  const isCompleted = status === "completed" && (nextStatus === "completed" || nextStatus === "active");
  const isToActive = isNextActive;
  const isLocked = nextStatus === "locked";

  const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  return (
    <g>
      {/* Base trail — always visible */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={isLocked ? "hsl(220 20% 70% / 0.15)" : isCompleted ? "hsl(45 90% 60% / 0.5)" : "hsl(220 50% 80% / 0.3)"}
        strokeWidth={isCompleted ? 2.5 : 1.8}
        strokeDasharray={isCompleted ? "none" : "6 6"}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: index * 0.15 + 0.3, ease: "easeOut" }}
      />

      {/* Animated glow for trail leading to active quest */}
      {isToActive && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary) / 0.6)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="4 12"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -32 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Small footprint/dot markers along completed trails */}
      {isCompleted && (
        <>
          {[0.25, 0.5, 0.75].map((t, i) => {
            const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            return (
              <motion.circle
                key={i}
                cx={`${px}%`}
                cy={`${py}%`}
                r={2}
                fill="hsl(45 90% 65% / 0.7)"
                initial={{ scale: 0 }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + index * 0.1 }}
              />
            );
          })}
        </>
      )}

      {/* Animated arrow dots pointing toward the active quest */}
      {isToActive && (
        <>
          {[0.3, 0.55, 0.8].map((t, i) => {
            const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            return (
              <motion.circle
                key={`arrow-${i}`}
                cx={`${px}%`}
                cy={`${py}%`}
                r={3}
                fill="hsl(var(--primary) / 0.8)"
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </>
      )}
    </g>
  );
};

export default HybridTrailPath;
