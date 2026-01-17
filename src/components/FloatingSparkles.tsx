import { motion } from "framer-motion";

interface FloatingSparklesProps {
  count?: number;
  className?: string;
}

const FloatingSparkles = ({ count = 15, className = "" }: FloatingSparklesProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        >
          <span className="text-lg md:text-xl">
            {["✨", "⭐", "🌟", "💫"][Math.floor(Math.random() * 4)]}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingSparkles;