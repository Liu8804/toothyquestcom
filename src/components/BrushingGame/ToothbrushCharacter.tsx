import { motion } from "framer-motion";

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
      {/* Toothbrush body */}
      <div className="relative">
        {/* Handle */}
        <div className="w-8 h-32 bg-gradient-to-b from-primary to-primary/80 rounded-full mx-auto shadow-lg">
          {/* Grip pattern */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-1 bg-primary-foreground/30 rounded-full"
              />
            ))}
          </div>
        </div>
        
        {/* Brush head */}
        <div className="w-12 h-8 bg-card rounded-lg mx-auto -mt-1 shadow-md flex items-end justify-center pb-1 gap-0.5">
          {/* Bristles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-4 bg-gradient-to-b from-bubble to-mint rounded-full"
              animate={isActive ? {
                scaleY: [1, 0.8, 1],
              } : {}}
              transition={{
                duration: 0.3,
                delay: i * 0.05,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
        
        {/* Sparkles when active */}
        {isActive && (
          <>
            <motion.div
              className="absolute -top-2 -left-4 text-star text-xl"
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
              className="absolute -top-4 -right-4 text-star text-lg"
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
      
      {/* Character face on handle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center">
        <motion.span
          className="text-lg"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isActive ? "😄" : "😊"}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default ToothbrushCharacter;
