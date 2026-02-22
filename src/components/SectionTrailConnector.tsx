import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const variantColors = {
  primary: { main: "hsl(var(--primary))", glow: "hsl(var(--primary) / 0.4)", tile: "hsl(var(--primary) / 0.15)" },
  warm: { main: "hsl(var(--secondary))", glow: "hsl(var(--secondary) / 0.4)", tile: "hsl(var(--secondary) / 0.15)" },
  accent: { main: "hsl(var(--accent))", glow: "hsl(var(--accent) / 0.4)", tile: "hsl(var(--accent) / 0.15)" },
  rainbow: { main: "hsl(var(--primary))", glow: "hsl(var(--candy) / 0.4)", tile: "hsl(var(--candy) / 0.12)" },
};

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  const isMobile = useIsMobile();
  const colors = variantColors[variant];
  const height = isMobile ? 80 : 100;
  const pathD = `M 30 ${height * 0.2} C 130 ${height * 0.9}, 270 ${height * 0.9}, 370 ${height * 0.2}`;

  // Generate stepping-stone positions along the curve
  const stones = [0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map((t) => ({
    x: 30 + t * 340,
    y: height * 0.2 + Math.sin(t * Math.PI) * (height * 0.7),
    size: 8 + Math.sin(t * 2) * 3,
  }));

  return (
    <div className="relative flex justify-center items-center z-10 overflow-hidden py-1">
      {/* Subtle grass/terrain strip */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${colors.tile}, transparent)`,
        }}
      />

      <svg
        viewBox={`0 0 400 ${height}`}
        className={`w-full max-w-lg ${isMobile ? "h-20" : "h-24"} pointer-events-none`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`stc-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.main} stopOpacity={0.2} />
            <stop offset="50%" stopColor={colors.main} stopOpacity={0.6} />
            <stop offset="100%" stopColor={colors.main} stopOpacity={0.2} />
          </linearGradient>
          <filter id={`stc-glow-${index}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
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
          stroke={colors.glow}
          strokeWidth={isMobile ? 18 : 24}
          strokeLinecap="round"
          filter={`url(#stc-glow-${index})`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.5 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />

        {/* Main road path — thicker and more visible */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={`url(#stc-grad-${index})`}
          strokeWidth={isMobile ? 10 : 14}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
        />

        {/* Stepping stones along the path */}
        {stones.map((stone, i) => (
          <motion.ellipse
            key={`stone-${i}`}
            cx={stone.x}
            cy={stone.y}
            rx={stone.size}
            ry={stone.size * 0.55}
            fill={colors.main}
            opacity={0.25}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, type: "spring" }}
          />
        ))}

        {/* Animated traveler dot */}
        <motion.circle
          r={isMobile ? 4 : 5}
          fill={colors.main}
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

        {/* Sparkle particles that pulse */}
        {[0.25, 0.5, 0.75].map((t, i) => {
          const px = 30 + t * 340;
          const py = height * 0.2 + Math.sin(t * Math.PI) * (height * 0.7);
          return (
            <motion.g key={`sparkle-${i}`}>
              <motion.circle
                cx={px}
                cy={py}
                r={3}
                fill={colors.main}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
              {/* Star sparkle */}
              <motion.text
                x={px}
                y={py - 8}
                textAnchor="middle"
                fontSize="8"
                animate={{ opacity: [0, 0.7, 0], y: [py - 8, py - 16, py - 8] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
              >
                ✦
              </motion.text>
            </motion.g>
          );
        })}
      </svg>

      {/* Floating character emojis at endpoints */}
      <motion.div
        className="absolute left-[10%] md:left-[15%] flex flex-col items-center"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-2xl md:text-3xl drop-shadow-lg">{fromEmoji}</span>
        <div className="w-6 h-1.5 rounded-full bg-foreground/10 mt-1" />
      </motion.div>
      <motion.div
        className="absolute right-[10%] md:right-[15%] flex flex-col items-center"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <span className="text-2xl md:text-3xl drop-shadow-lg">{toEmoji}</span>
        <div className="w-6 h-1.5 rounded-full bg-foreground/10 mt-1" />
      </motion.div>

      {/* Small decorative elements along sides */}
      {["🌿", "🌸", "🍀"].map((deco, i) => (
        <motion.span
          key={i}
          className="absolute text-sm opacity-30 pointer-events-none select-none"
          style={{
            left: `${25 + i * 25}%`,
            top: i % 2 === 0 ? "10%" : "80%",
          }}
          animate={{ rotate: [0, 10, -10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        >
          {deco}
        </motion.span>
      ))}
    </div>
  );
};

export default SectionTrailConnector;
