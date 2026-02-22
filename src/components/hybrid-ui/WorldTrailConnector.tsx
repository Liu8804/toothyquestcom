import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isFromComplete = fromProgress === 100;
  const windRight = index % 2 === 0;

  const stones = windRight
    ? [
        { x: 50, y: 8, size: 16 },
        { x: 60, y: 25, size: 12 },
        { x: 55, y: 45, size: 14 },
        { x: 42, y: 62, size: 12 },
        { x: 48, y: 80, size: 14 },
        { x: 50, y: 94, size: 16 },
      ]
    : [
        { x: 50, y: 8, size: 16 },
        { x: 40, y: 25, size: 12 },
        { x: 45, y: 45, size: 14 },
        { x: 58, y: 62, size: 12 },
        { x: 52, y: 80, size: 14 },
        { x: 50, y: 94, size: 16 },
      ];

  return (
    <div className="relative flex flex-col items-center py-3 z-10">
      {/* From emoji */}
      <motion.div
        className="text-2xl md:text-3xl drop-shadow-lg z-10"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {fromEmoji}
      </motion.div>

      {/* Trail */}
      <div className={`relative ${isMobile ? "w-36 h-32" : "w-48 h-40"}`}>
        {/* Stepping stones */}
        {stones.map((stone, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full shadow-sm border ${
              isFromComplete
                ? "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-400/60"
                : "bg-gradient-to-br from-muted to-muted-foreground/20 border-muted-foreground/20"
            }`}
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

        {/* Animated traveler */}
        {isFromComplete && (
          <motion.div
            className="absolute w-3.5 h-3.5 rounded-full bg-star shadow-lg z-10"
            style={{ boxShadow: "0 0 10px 3px hsl(var(--star) / 0.5)" }}
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
          />
        )}

        {/* Lock or arrow in center */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg z-10"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {isFromComplete ? "⬇️" : "🔒"}
        </motion.div>
      </div>

      {/* To emoji */}
      <motion.div
        className="text-2xl md:text-3xl drop-shadow-lg z-10"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        {toEmoji}
      </motion.div>
    </div>
  );
};

export default WorldTrailConnector;
