import { motion } from "framer-motion";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const variantColors = {
  primary: { from: "hsl(var(--primary))", to: "hsl(var(--primary))" },
  warm: { from: "hsl(var(--secondary))", to: "hsl(var(--secondary))" },
  accent: { from: "hsl(var(--accent))", to: "hsl(var(--accent))" },
  rainbow: { from: "hsl(var(--primary))", to: "hsl(var(--star))" },
};

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  const colors = variantColors[variant];
  // Alternate winding direction
  const windRight = index % 2 === 0;

  return (
    <div className="relative flex flex-col items-center py-3 z-10 overflow-hidden">
      {/* From emoji */}
      <motion.span
        className="text-2xl mb-1 drop-shadow-md"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {fromEmoji}
      </motion.span>

      {/* Winding trail path */}
      <svg
        viewBox="0 0 100 80"
        className="w-40 h-20 md:w-52 md:h-24"
        fill="none"
      >
        <motion.path
          d={
            windRight
              ? "M50 0 C50 15, 80 20, 75 35 S20 50, 50 65 S50 75, 50 80"
              : "M50 0 C50 15, 20 20, 25 35 S80 50, 50 65 S50 75, 50 80"
          }
          stroke={`url(#trail-gradient-${index})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 6"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        {/* Animated traveler dot */}
        <motion.circle
          r="4"
          fill="hsl(var(--star))"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={
              windRight
                ? "M50 0 C50 15, 80 20, 75 35 S20 50, 50 65 S50 75, 50 80"
                : "M50 0 C50 15, 20 20, 25 35 S80 50, 50 65 S50 75, 50 80"
            }
          />
        </motion.circle>
        <defs>
          <linearGradient id={`trail-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.from} stopOpacity="0.6" />
            <stop offset="50%" stopColor={colors.to} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.from} stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* To emoji */}
      <motion.span
        className="text-2xl mt-1 drop-shadow-md"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
      >
        {toEmoji}
      </motion.span>
    </div>
  );
};

export default SectionTrailConnector;
