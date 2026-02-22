import { motion } from "framer-motion";

interface GlowBeaconProps {
  isActive?: boolean;
  variant?: "primary" | "star" | "secondary" | "mint";
  size?: number;
  className?: string;
}

const variantStyles = {
  primary: {
    border: "hsl(var(--primary) / 0.5)",
    bg: "hsl(var(--primary) / 0.08)",
    glow: "hsl(var(--primary) / 0.15)",
  },
  star: {
    border: "hsl(var(--star) / 0.5)",
    bg: "hsl(var(--star) / 0.08)",
    glow: "hsl(var(--star) / 0.15)",
  },
  secondary: {
    border: "hsl(var(--secondary) / 0.5)",
    bg: "hsl(var(--secondary) / 0.08)",
    glow: "hsl(var(--secondary) / 0.15)",
  },
  mint: {
    border: "hsl(var(--mint) / 0.5)",
    bg: "hsl(var(--mint) / 0.08)",
    glow: "hsl(var(--mint) / 0.15)",
  },
};

const GlowBeacon = ({
  isActive = true,
  variant = "primary",
  size = 80,
  className = "",
}: GlowBeaconProps) => {
  if (!isActive) return null;

  const styles = variantStyles[variant];

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {/* 3D volumetric glow — radial gradient sphere */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          left: size * 0.2,
          top: size * 0.2,
          background: `radial-gradient(circle, ${styles.glow}, transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer pulse ring */}
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${styles.border}`,
          backgroundColor: styles.bg,
          boxShadow: `0 0 20px ${styles.glow}`,
        }}
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${styles.border}`,
          backgroundColor: styles.bg,
        }}
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
