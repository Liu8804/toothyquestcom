import { motion } from "framer-motion";
import magicToothbrush from "@/assets/interactive/magic-toothbrush-v3.jpeg";
interface ToothbrushCharacterProps {
  isActive: boolean;
  currentQuadrant: number;
}

export const ToothbrushCharacter = ({
  isActive,
  currentQuadrant,
}: ToothbrushCharacterProps) => {
  // Different brush patterns for different quadrants
  const getBrushAnimation = () => {
    if (!isActive) return {};
    
    const patterns = {
      0: { // Top-left: up-down motion
        y: [-8, 8, -8],
        rotate: [-5, 5, -5],
      },
      1: { // Top-right: up-down motion
        y: [-8, 8, -8],
        rotate: [5, -5, 5],
      },
      2: { // Bottom-left: side-to-side
        x: [-8, 8, -8],
        rotate: [-10, 10, -10],
      },
      3: { // Bottom-right: side-to-side
        x: [-8, 8, -8],
        rotate: [10, -10, 10],
      },
    };
    
    return patterns[currentQuadrant as keyof typeof patterns] || patterns[0];
  };

  return (
    <motion.div
      className="relative"
      animate={getBrushAnimation()}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {/* Toothbrush image */}
      <div className="relative">
        <img
          src={magicToothbrush}
          alt="Magic Toothbrush"
          className="w-20 h-32 object-contain drop-shadow-lg"
        />
        
        {/* Sparkles when active */}
        {isActive && (
          <>
            <motion.div
              className="absolute -top-2 -left-4 text-xl"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                y: [-5, -15, -5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -top-4 -right-4 text-lg"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                y: [-5, -20, -5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              ⭐
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ToothbrushCharacter;
