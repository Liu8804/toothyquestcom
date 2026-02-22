import { motion } from "framer-motion";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const variantColors = {
  primary: { stone: "from-primary/60 to-primary/30", glow: "bg-primary" },
  warm: { stone: "from-amber-400 to-amber-300", glow: "bg-amber-400" },
  accent: { stone: "from-secondary/60 to-secondary/30", glow: "bg-secondary" },
  rainbow: { stone: "from-star to-accent", glow: "bg-star" },
};

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  const windRight = index % 2 === 0;
  const colors = variantColors[variant];

  // Winding path stones - more stones, wider spread
  const stones = windRight
    ? [
        { x: 50, y: 4, size: 18 },
        { x: 58, y: 15, size: 14 },
        { x: 65, y: 28, size: 16 },
        { x: 58, y: 40, size: 14 },
        { x: 48, y: 52, size: 16 },
        { x: 38, y: 64, size: 14 },
        { x: 42, y: 76, size: 16 },
        { x: 50, y: 88, size: 14 },
        { x: 50, y: 96, size: 18 },
      ]
    : [
        { x: 50, y: 4, size: 18 },
        { x: 42, y: 15, size: 14 },
        { x: 35, y: 28, size: 16 },
        { x: 42, y: 40, size: 14 },
        { x: 52, y: 52, size: 16 },
        { x: 62, y: 64, size: 14 },
        { x: 58, y: 76, size: 16 },
        { x: 50, y: 88, size: 14 },
        { x: 50, y: 96, size: 18 },
      ];

  return (
    <div className="relative flex flex-col items-center py-4 z-10">
      {/* From emoji */}
      <motion.div
        className="text-3xl md:text-4xl drop-shadow-lg z-10 mb-2"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300 }}
        animate={{ y: [0, -4, 0] }}
      >
        {fromEmoji}
      </motion.div>

      {/* Winding trail */}
      <div className="relative w-48 md:w-64 h-52 md:h-64">
        {/* Dotted path line connecting stones */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d={
              windRight
                ? "M 50 4 C 65 15, 70 25, 65 28 C 60 32, 50 38, 48 52 C 46 62, 38 68, 42 76 C 46 84, 50 90, 50 96"
                : "M 50 4 C 35 15, 30 25, 35 28 C 40 32, 50 38, 52 52 C 54 62, 62 68, 58 76 C 54 84, 50 90, 50 96"
            }
            fill="none"
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="3"
            strokeDasharray="4 3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Stepping stones */}
        {stones.map((stone, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${colors.stone} border-2 border-white/40 shadow-md`}
            style={{
              left: `${stone.x}%`,
              top: `${stone.y}%`,
              transform: "translate(-50%, -50%)",
              width: stone.size,
              height: stone.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}
          />
        ))}

        {/* Animated sparkle traveler */}
        <motion.div
          className={`absolute w-4 h-4 rounded-full ${colors.glow} shadow-lg z-10`}
          style={{
            boxShadow: `0 0 12px 4px hsl(var(--star) / 0.5)`,
          }}
          animate={{
            left: stones.map((s) => `${s.x}%`),
            top: stones.map((s) => `${s.y}%`),
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            times: stones.map((_, i) => i / (stones.length - 1)),
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-white/50"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Decorative sparkles along path */}
        {[stones[2], stones[5], stones[7]].map((stone, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-sm pointer-events-none"
            style={{
              left: `${(stone?.x || 50) + (i % 2 === 0 ? 8 : -8)}%`,
              top: `${(stone?.y || 50)}%`,
            }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 0.5], y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* To emoji */}
      <motion.div
        className="text-3xl md:text-4xl drop-shadow-lg z-10 mt-2"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
        animate={{ y: [0, 4, 0] }}
      >
        {toEmoji}
      </motion.div>
    </div>
  );
};

export default SectionTrailConnector;
