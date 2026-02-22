import { motion } from "framer-motion";

interface WorldTrailConnectorProps {
  fromProgress: number;
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
  const windRight = index % 2 === 0;

  // Create a winding dotted path with larger, colorful stones
  const pathPoints = windRight
    ? [
        { x: 50, y: 5 },
        { x: 62, y: 18 },
        { x: 55, y: 33 },
        { x: 40, y: 48 },
        { x: 48, y: 63 },
        { x: 60, y: 78 },
        { x: 50, y: 93 },
      ]
    : [
        { x: 50, y: 5 },
        { x: 38, y: 18 },
        { x: 45, y: 33 },
        { x: 60, y: 48 },
        { x: 52, y: 63 },
        { x: 40, y: 78 },
        { x: 50, y: 93 },
      ];

  const stoneColors = isFromComplete
    ? [
        "from-amber-400 to-amber-600",
        "from-yellow-300 to-amber-500",
        "from-amber-300 to-yellow-500",
        "from-yellow-400 to-amber-500",
        "from-amber-400 to-yellow-500",
        "from-yellow-300 to-amber-600",
        "from-amber-400 to-amber-600",
      ]
    : [
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
        "from-muted to-muted-foreground/30",
      ];

  // Decorative elements along the path
  const decorations = [
    { emoji: "🌿", x: windRight ? 25 : 75, y: 25 },
    { emoji: "✨", x: windRight ? 75 : 25, y: 50 },
    { emoji: "🍄", x: windRight ? 30 : 70, y: 75 },
  ];

  return (
    <div className="relative flex flex-col items-center py-2 z-10">
      {/* Trail container */}
      <div className="relative w-56 md:w-72 h-48 md:h-56">
        {/* Dashed line connecting stones */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d={`M ${pathPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
            fill="none"
            stroke={isFromComplete ? "hsl(45, 80%, 55%)" : "hsl(var(--muted-foreground) / 0.2)"}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Stepping stones */}
        {pathPoints.map((point, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${stoneColors[i]} shadow-lg border-2 ${
              isFromComplete ? "border-amber-300/60" : "border-muted-foreground/15"
            }`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: "translate(-50%, -50%)",
              width: i === 0 || i === pathPoints.length - 1 ? 28 : 20,
              height: i === 0 || i === pathPoints.length - 1 ? 28 : 20,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
          />
        ))}

        {/* Decorative elements */}
        {decorations.map((deco, i) => (
          <motion.div
            key={`deco-${i}`}
            className="absolute text-lg md:text-xl pointer-events-none opacity-60"
            style={{
              left: `${deco.x}%`,
              top: `${deco.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            {deco.emoji}
          </motion.div>
        ))}

        {/* Animated traveler */}
        {isFromComplete && (
          <motion.div
            className="absolute w-5 h-5 rounded-full z-20"
            style={{
              background: "radial-gradient(circle, hsl(var(--star)), hsl(var(--star) / 0.6))",
              boxShadow: "0 0 16px 4px hsl(var(--star) / 0.5)",
            }}
            animate={{
              left: pathPoints.map((p) => `${p.x}%`),
              top: pathPoints.map((p) => `${p.y}%`),
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              times: pathPoints.map((_, i) => i / (pathPoints.length - 1)),
            }}
          />
        )}

        {/* Lock or arrow indicator */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl z-20 drop-shadow-lg"
          animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {isFromComplete ? "⬇️" : "🔒"}
        </motion.div>
      </div>
    </div>
  );
};

export default WorldTrailConnector;
