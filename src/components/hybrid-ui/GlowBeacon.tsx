import { motion } from "framer-motion";

interface GlowBeaconProps {
  /** Whether the beacon is active */
  isActive?: boolean;
  /** Color variant */
  variant?: "primary" | "star" | "secondary" | "mint";
  /** Size in pixels */
  size?: number;
  /** Additional className */
  className?: string;
}

const variantClasses = {
  primary: "border-primary/50 bg-primary/10",
  star: "border-star/50 bg-star/10",
  secondary: "border-secondary/50 bg-secondary/10",
  mint: "border-mint/50 bg-mint/10",
};

const GlowBeacon = ({
  isActive = true,
  variant = "primary",
  size = 80,
  className = "",
}: GlowBeaconProps) => {
  if (!isActive) return null;

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {/* Outer pulse ring */}
      <motion.div
        className={`rounded-full border-2 ${variantClasses[variant]}`}
        style={{ width: size, height: size }}
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner pulse ring */}
      <motion.div
        className={`absolute inset-0 rounded-full border ${variantClasses[variant]}`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.1, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </div>
  );
};

export default GlowBeacon;
