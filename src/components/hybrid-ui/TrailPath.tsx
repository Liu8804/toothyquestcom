import { motion } from "framer-motion";

interface TrailPoint {
  x: number;
  y: number;
}

interface TrailPathProps {
  /** Array of points (percentage-based or pixel-based) */
  points: TrailPoint[];
  /** Whether coordinates are percentages (default) or pixels */
  isPercentage?: boolean;
  /** SVG viewBox width */
  width?: number;
  /** SVG viewBox height */
  height?: number;
  /** Trail color variant */
  variant?: "primary" | "warm" | "muted" | "rainbow";
  /** Stroke width */
  strokeWidth?: number;
  /** Animation delay */
  delay?: number;
  /** Whether to show animated glow dots */
  showGlowDots?: boolean;
  /** Additional className for the SVG */
  className?: string;
}

const variantColors = {
  primary: { stroke: "hsl(var(--primary))", glow: "hsl(var(--primary) / 0.4)" },
  warm: { stroke: "hsl(var(--secondary))", glow: "hsl(var(--secondary) / 0.4)" },
  muted: { stroke: "hsl(var(--muted-foreground) / 0.3)", glow: "hsl(var(--muted-foreground) / 0.15)" },
  rainbow: { stroke: "url(#trail-rainbow)", glow: "hsl(var(--star-gold) / 0.4)" },
};

const TrailPath = ({
  points,
  isPercentage = true,
  width = 100,
  height = 100,
  variant = "primary",
  strokeWidth = 3,
  delay = 0,
  showGlowDots = true,
  className = "",
}: TrailPathProps) => {
  if (points.length < 2) return null;

  const scale = isPercentage ? { x: width / 100, y: height / 100 } : { x: 1, y: 1 };

  // Build smooth curve path
  const buildPath = () => {
    const pts = points.map((p) => ({ x: p.x * scale.x, y: p.y * scale.y }));
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` Q ${cpX} ${curr.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const pathD = buildPath();
  const colors = variantColors[variant];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`pointer-events-none ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="trail-rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <filter id="trail-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={colors.glow}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        filter="url(#trail-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 2, ease: "easeInOut" }}
      />

      {/* Main trail */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="8 6"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.7 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.3, duration: 1.8, ease: "easeInOut" }}
      />

      {/* Animated glow dots traveling along path */}
      {showGlowDots && (
        <>
          {[0, 1].map((i) => (
            <motion.circle
              key={i}
              r={strokeWidth * 0.8}
              fill={colors.stroke}
              opacity={0.8}
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              style={{ offsetPath: `path('${pathD}')` } as any}
              transition={{
                delay: delay + 1 + i * 2,
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </>
      )}
    </svg>
  );
};

export default TrailPath;
