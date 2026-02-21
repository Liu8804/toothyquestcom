import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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

// Individual teeth positions per quadrant for the sparkle-clean effect
const teethPerQuadrant = [
  ["🦷", "🦷", "🦷"],
  ["🦷", "🦷", "🦷"],
  ["🦷", "🦷", "🦷"],
  ["🦷", "🦷", "🦷"],
];

const shimmerColors = [
  "hsl(var(--mint-fresh))",
  "hsl(var(--star-gold))",
  "hsl(var(--bubble-blue))",
];

export const MouthGrid = ({
  currentQuadrant,
  completedQuadrants,
}: MouthGridProps) => {
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  // Detect when a new quadrant completes to trigger the shimmer wave
  useEffect(() => {
    if (completedQuadrants.length > 0) {
      const latest = completedQuadrants[completedQuadrants.length - 1];
      setJustCompleted(latest);
      const timer = setTimeout(() => setJustCompleted(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [completedQuadrants.length]);

  return (
    <div className="relative">
      {/* Mouth outline */}
      <div className="w-48 h-48 rounded-full bg-candy/20 border-4 border-candy p-4 mx-auto overflow-hidden">
        {/* Teeth grid */}
        <div className="grid grid-cols-2 gap-2 h-full">
          {[0, 1, 2, 3].map((quadrant) => {
            const isActive = currentQuadrant === quadrant;
            const isCompleted = completedQuadrants.includes(quadrant);
            const isJustDone = justCompleted === quadrant;
            
            return (
              <motion.div
                key={quadrant}
                className={`
                  relative rounded-xl flex flex-col items-center justify-center overflow-hidden
                  transition-colors duration-500
                  ${isActive 
                    ? "bg-primary shadow-lg" 
                    : isCompleted
                    ? "bg-mint/30"
                    : "bg-muted/60"
                  }
                `}
                animate={isActive ? {
                  scale: [1, 1.04, 1],
                  boxShadow: [
                    "0 0 15px hsl(var(--primary) / 0.4)",
                    "0 0 30px hsl(var(--primary) / 0.7)",
                    "0 0 15px hsl(var(--primary) / 0.4)",
                  ],
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {/* Dirty-to-clean shimmer wave on completion */}
                <AnimatePresence>
                  {isJustDone && (
                    <motion.div
                      className="absolute inset-0 z-10"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.8 }}
                    >
                      {/* Sweeping shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                      {/* Sparkle burst particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: shimmerColors[i % shimmerColors.length],
                            left: "50%",
                            top: "50%",
                          }}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                          animate={{
                            x: Math.cos((i * Math.PI * 2) / 8) * 30,
                            y: Math.sin((i * Math.PI * 2) / 8) * 30,
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                          }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Teeth display — dirty vs clean */}
                <div className="flex gap-0.5 mb-0.5">
                  {teethPerQuadrant[quadrant].map((_, toothIdx) => (
                    <motion.span
                      key={toothIdx}
                      className="text-sm leading-none"
                      initial={false}
                      animate={
                        isCompleted
                          ? { 
                              scale: [1, 1.3, 1],
                              filter: "brightness(1.3)",
                            }
                          : isActive
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{
                        duration: 0.6,
                        delay: isJustDone ? 0.4 + toothIdx * 0.15 : 0,
                        repeat: isActive ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      {isCompleted ? "✨" : isActive ? "🪥" : "🦷"}
                    </motion.span>
                  ))}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-bold leading-tight ${
                  isActive 
                    ? "text-primary-foreground" 
                    : isCompleted 
                    ? "text-mint" 
                    : "text-muted-foreground"
                }`}>
                  {quadrantLabels[quadrant]}
                </span>
                
                {/* Completion star badge */}
                {isCompleted && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 text-xs"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.5 }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      ⭐
                    </motion.span>
                  </motion.div>
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-primary-foreground/40"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
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
