import { motion } from "framer-motion";

interface SectionTrailConnectorProps {
  fromEmoji?: string;
  toEmoji?: string;
  variant?: "primary" | "warm" | "accent" | "rainbow";
  index?: number;
}

const variantClasses = {
  primary: "from-primary/40 via-primary/60 to-primary/40",
  warm: "from-secondary/40 via-secondary/60 to-secondary/40",
  accent: "from-accent/40 via-accent/60 to-accent/40",
  rainbow: "from-primary/40 via-star/60 to-secondary/40",
};

const SectionTrailConnector = ({
  fromEmoji = "✨",
  toEmoji = "✨",
  variant = "primary",
  index = 0,
}: SectionTrailConnectorProps) => {
  return (
    <div className="relative flex flex-col items-center py-2 z-10">
      {/* Simple visible dotted trail */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xl">{fromEmoji}</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full bg-gradient-to-b ${variantClasses[variant]}`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.7, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          />
        ))}
        <span className="text-xl">{toEmoji}</span>
      </div>
    </div>
  );
};

export default SectionTrailConnector;
