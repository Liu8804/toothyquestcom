import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, ChevronRight } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { Button } from "@/components/ui/button";

interface WorldCompletionCelebrationProps {
  isOpen: boolean;
  worldName: string;
  worldEmoji: string;
  nextWorldName?: string;
  nextWorldEmoji?: string;
  onClose: () => void;
  onGoToNextWorld?: () => void;
}

const confettiColors = [
  "hsl(var(--star))",
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(48, 96%, 53%)",
  "hsl(280, 70%, 60%)",
  "hsl(150, 70%, 50%)",
  "hsl(350, 80%, 60%)",
];

const WorldCompletionCelebration = ({
  isOpen,
  worldName,
  worldEmoji,
  nextWorldName,
  nextWorldEmoji,
  onClose,
  onGoToNextWorld,
}: WorldCompletionCelebrationProps) => {
  const { playWinFanfare, playSound } = useGameSounds();
  const { success: hapticSuccess, customHaptic } = useHapticFeedback();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStage(0);
      playWinFanfare();
      hapticSuccess();
      setTimeout(() => customHaptic([80, 40, 120, 40, 160]), 200);
      setTimeout(() => setStage(1), 600);
      setTimeout(() => {
        setStage(2);
        playSound("achievement");
      }, 1800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />

          {/* Confetti particles */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-5%",
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                backgroundColor: confettiColors[i % confettiColors.length],
              }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: ["0vh", `${70 + Math.random() * 40}vh`],
                x: [0, (Math.random() - 0.5) * 120],
                rotate: [0, Math.random() * 720 - 360],
                opacity: [1, 1, 0.5, 0],
              }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: Math.random() * 0.8,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main card */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(170deg, hsl(var(--card)), hsl(var(--muted)))",
              boxShadow:
                "0 24px 80px -12px rgba(0,0,0,0.5), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
            }}
            initial={{ scale: 0.3, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            {/* Top gradient banner */}
            <div
              className="relative h-36 flex items-center justify-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--star)), hsl(var(--accent)), hsl(var(--primary)))",
              }}
            >
              {/* Radiating rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border border-white/20"
                  style={{
                    width: `${ring * 80}px`,
                    height: `${ring * 80}px`,
                  }}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: [0, 2], opacity: [0.5, 0] }}
                  transition={{
                    duration: 2,
                    delay: 0.3 + ring * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}

              {/* 3D Trophy */}
              <motion.div
                className="relative z-10"
                initial={{ scale: 0, rotateY: -180 }}
                animate={
                  stage >= 1
                    ? { scale: [0, 1.4, 1], rotateY: [-180, 15, 0] }
                    : { scale: 0 }
                }
                transition={{ type: "spring", stiffness: 150, damping: 12 }}
              >
                {/* Trophy sphere bg */}
                <div
                  className="absolute inset-[-16px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(ellipse at 40% 30%, hsl(0 0% 100% / 0.3), hsl(var(--star) / 0.2) 50%, transparent 75%)",
                    boxShadow:
                      "0 12px 40px hsl(var(--star) / 0.4), inset 0 2px 8px hsl(0 0% 100% / 0.2)",
                  }}
                />
                <Trophy className="w-16 h-16 text-white relative z-10 drop-shadow-lg" />
              </motion.div>

              {/* Orbiting stars */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`orbit-${i}`}
                  className="absolute z-20"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 0.7],
                    x: Math.cos((i / 5) * Math.PI * 2) * 60,
                    y: Math.sin((i / 5) * Math.PI * 2) * 40,
                    rotate: [0, 360],
                  }}
                  transition={{ delay: 0.8 + i * 0.12, duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  style={{ filter: "drop-shadow(0 2px 6px hsl(var(--star) / 0.5))" }}
                >
                  <Star className="w-4 h-4 text-white fill-white" />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 py-6 text-center space-y-4">
              {/* World emoji + name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <div className="text-5xl mb-2">{worldEmoji}</div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  World Complete!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  You conquered <span className="font-bold text-primary">{worldName}</span>!
                </p>
              </motion.div>

              {/* Badge earned */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "linear-gradient(145deg, hsl(var(--star) / 0.15), hsl(var(--accent) / 0.1))",
                  border: "1px solid hsl(var(--star) / 0.3)",
                  boxShadow: "0 4px 16px hsl(var(--star) / 0.15)",
                }}
                initial={{ scale: 0 }}
                animate={stage >= 2 ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-4 h-4 text-star" />
                <span className="font-display font-bold text-star text-sm">
                  World Champion!
                </span>
                <Star className="w-4 h-4 text-star fill-star" />
              </motion.div>

              {/* Next world unlock */}
              {nextWorldName && (
                <motion.div
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-muted/50 border border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-2xl">{nextWorldEmoji}</span>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Next world unlocked!</p>
                    <p className="font-display font-bold text-foreground text-sm">{nextWorldName}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                className="flex flex-col gap-2 pt-2"
                initial={{ opacity: 0 }}
                animate={stage >= 2 ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 }}
              >
                {nextWorldName && onGoToNextWorld && (
                  <Button
                    onClick={() => {
                      onGoToNextWorld();
                      onClose();
                    }}
                    className="w-full font-display font-bold"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                      boxShadow: "0 6px 20px hsl(var(--primary) / 0.3)",
                    }}
                  >
                    Explore {nextWorldName} {nextWorldEmoji}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="font-display text-muted-foreground"
                >
                  Stay Here
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldCompletionCelebration;
