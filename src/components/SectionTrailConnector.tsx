import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const variantColors = {
  primary: ["hsl(var(--primary))", "hsl(var(--secondary))"],
  warm: ["hsl(var(--secondary))", "hsl(var(--candy))"],
  accent: ["hsl(var(--accent))", "hsl(var(--primary))"],
  rainbow: ["hsl(var(--primary))", "hsl(var(--candy))", "hsl(var(--secondary))"],
};

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  const isMobile = useIsMobile();
  const colors = variantColors[variant];
  const height = isMobile ? 48 : 64;

  return (
    <div className="relative flex justify-center items-center -my-1 z-10 overflow-hidden">
      <svg
        viewBox={`0 0 400 ${height}`}
        className={`w-full max-w-md ${isMobile ? "h-12" : "h-16"} pointer-events-none`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`stc-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.5} />
            <stop offset="50%" stopColor={colors[1] || colors[0]} stopOpacity={0.7} />
            <stop offset="100%" stopColor={colors[colors.length - 1]} stopOpacity={0.5} />
          </linearGradient>
        </defs>

        {/* Dashed trail curve */}
        <motion.path
          d={`M 40 ${height * 0.15} C 120 ${height * 0.85}, 280 ${height * 0.85}, 360 ${height * 0.15}`}
          fill="none"
          stroke={`url(#stc-grad-${index})`}
          strokeWidth={isMobile ? 2 : 2.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 1.4, delay: 0.1, ease: "easeOut" }}
        />

        {/* Sparkle dots along the trail */}
        {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
          const px = 40 + t * 320;
          const py = height * 0.15 + Math.sin(t * Math.PI) * (height * 0.7);
          return (
            <motion.circle
              key={i}
              cx={px}
              cy={py}
              r={isMobile ? 2 : 2.5}
              fill={colors[i % colors.length]}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
              viewport={{ once: true }}
              transition={{
                opacity: { duration: 2.5, repeat: Infinity, delay: i * 0.3 },
                scale: { duration: 0.5, delay: 0.5 + i * 0.15 },
              }}
            />
          );
        })}
      </svg>

      {/* Emojis at start and end */}
      <motion.span
        className="absolute left-[15%] text-base md:text-lg opacity-60"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {fromEmoji}
      </motion.span>
      <motion.span
        className="absolute right-[15%] text-base md:text-lg opacity-60"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        {toEmoji}
      </motion.span>
    </div>
  );
};

export default SectionTrailConnector;
