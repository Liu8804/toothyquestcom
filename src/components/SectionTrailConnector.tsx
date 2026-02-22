import { motion } from "framer-motion";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  // Alternate winding direction
  const windRight = index % 2 === 0;

  // Stepping stone positions along a curved path
  const stones = windRight
    ? [
        { x: 50, y: 5 },
        { x: 62, y: 22 },
        { x: 55, y: 40 },
        { x: 40, y: 58 },
        { x: 48, y: 75 },
        { x: 50, y: 92 },
      ]
    : [
        { x: 50, y: 5 },
        { x: 38, y: 22 },
        { x: 45, y: 40 },
        { x: 60, y: 58 },
        { x: 52, y: 75 },
        { x: 50, y: 92 },
      ];

  return (
    <div className="relative flex flex-col items-center py-2 z-10 overflow-hidden">
      {/* From emoji */}
      <motion.span
        className="text-2xl drop-shadow-md z-10"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {fromEmoji}
      </motion.span>

      {/* Stepping stone trail */}
      <div className="relative w-32 h-28 md:w-40 md:h-32">
        {stones.map((stone, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border-2 border-amber-500/40 shadow-sm"
            style={{
              left: `${stone.x}%`,
              top: `${stone.y}%`,
              transform: "translate(-50%, -50%)",
              width: i === 0 || i === stones.length - 1 ? 14 : 10,
              height: i === 0 || i === stones.length - 1 ? 14 : 10,
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 400 }}
          />
        ))}

        {/* Animated sparkle traveling the path */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-star shadow-lg shadow-star/50"
          animate={{
            left: stones.map((s) => `${s.x}%`),
            top: stones.map((s) => `${s.y}%`),
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: stones.map((_, i) => i / (stones.length - 1)),
          }}
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* To emoji */}
      <motion.span
        className="text-2xl drop-shadow-md z-10"
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
