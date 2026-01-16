import { motion } from "framer-motion";

interface MouthGridProps {
  currentQuadrant: number;
  completedQuadrants: number[];
}

const quadrantLabels = [
  "Top Left",
  "Top Right", 
  "Bottom Left",
  "Bottom Right",
];

const quadrantEmojis = ["🦷", "🦷", "🦷", "🦷"];

export const MouthGrid = ({
  currentQuadrant,
  completedQuadrants,
}: MouthGridProps) => {
  return (
    <div className="relative">
      {/* Mouth outline */}
      <div className="w-48 h-48 rounded-full bg-candy/20 border-4 border-candy p-4 mx-auto">
        {/* Teeth grid */}
        <div className="grid grid-cols-2 gap-2 h-full">
          {[0, 1, 2, 3].map((quadrant) => {
            const isActive = currentQuadrant === quadrant;
            const isCompleted = completedQuadrants.includes(quadrant);
            
            return (
              <motion.div
                key={quadrant}
                className={`
                  relative rounded-xl flex items-center justify-center
                  transition-all duration-300
                  ${isActive 
                    ? "bg-primary shadow-lg scale-105" 
                    : isCompleted
                    ? "bg-mint/50"
                    : "bg-card/80"
                  }
                `}
                animate={isActive ? {
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.5)",
                    "0 0 40px hsl(var(--primary) / 0.8)",
                    "0 0 20px hsl(var(--primary) / 0.5)",
                  ],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {/* Quadrant content */}
                <div className="text-center">
                  <motion.span
                    className="text-2xl block"
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {isCompleted ? "✨" : quadrantEmojis[quadrant]}
                  </motion.span>
                  <span className={`text-xs font-bold ${
                    isActive 
                      ? "text-primary-foreground" 
                      : isCompleted 
                      ? "text-mint" 
                      : "text-muted-foreground"
                  }`}>
                    {quadrantLabels[quadrant]}
                  </span>
                </div>
                
                {/* Sparkle effect when completed */}
                {isCompleted && (
                  <>
                    <motion.div
                      className="absolute top-1 right-1 text-star"
                      animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⭐
                    </motion.div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Lips decoration */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-20 bg-candy/30 rounded-full" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-20 bg-candy/30 rounded-full" />
    </div>
  );
};

export default MouthGrid;
