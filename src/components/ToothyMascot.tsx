import { motion } from "framer-motion";
import toothyMascot from "@/assets/toothy-mascot.png";

interface ToothyMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

export const ToothyMascot = ({
  size = "md",
  className = "",
  animate = true,
}: ToothyMascotProps) => {
  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.img
        src={toothyMascot}
        alt="Toothy - Your friendly dental buddy"
        className="w-full h-full object-contain drop-shadow-lg"
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default ToothyMascot;
