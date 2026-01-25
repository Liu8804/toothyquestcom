import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle, Sparkles, Timer, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyTask } from "@/hooks/useDailyTask";
import { useStreak } from "@/hooks/useStreak";
import BrushingTimerGame from "@/components/BrushingGame/BrushingTimerGame";
import MascotWithExpression from "@/components/MascotWithExpression";
import ConfettiCelebration from "@/components/ConfettiCelebration";

interface DailyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskComplete: (xpEarned: number) => void;
  childId?: string;
  childName?: string;
}

const DailyTaskModal = ({
  isOpen,
  onClose,
  onTaskComplete,
  childId,
  childName,
}: DailyTaskModalProps) => {
  const { task, isCompleted, loading, completeTask } = useDailyTask(childId);
  const { currentStreak } = useStreak();
  const [phase, setPhase] = useState<"intro" | "task" | "complete">("intro");
  const [showBrushingGame, setShowBrushingGame] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [newStreak, setNewStreak] = useState(0);

  // Reset phase when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isCompleted) {
        setPhase("complete");
      } else {
        setPhase("intro");
      }
    }
  }, [isOpen, isCompleted]);

  const handleStartTask = useCallback(() => {
    if (!task) return;

    // For brushing type challenges, open the timer game
    if (task.challengeType === "brushing" || task.challengeType === "brush_teeth") {
      setShowBrushingGame(true);
    } else {
      // For other types, mark complete directly
      handleTaskCompletion();
    }
  }, [task]);

  const handleTaskCompletion = useCallback(async () => {
    const result = await completeTask();
    
    if (result.success) {
      setEarnedXp(result.xpEarned);
      setNewStreak(result.newStreak);
      setShowConfetti(true);
      setPhase("complete");
      
      // Notify parent
      onTaskComplete(result.xpEarned);
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [completeTask, onTaskComplete]);

  const handleBrushingComplete = useCallback(() => {
    setShowBrushingGame(false);
    handleTaskCompletion();
  }, [handleTaskCompletion]);

  const handleClose = useCallback(() => {
    // Only allow closing if task is complete or user explicitly closes
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />
      
      {/* Brushing Timer Game */}
      <BrushingTimerGame
        isOpen={showBrushingGame}
        onClose={handleBrushingComplete}
      />

      <AnimatePresence>
        {isOpen && !showBrushingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl shadow-float p-6 text-center overflow-hidden"
            >
              {/* Close button - only show if task complete */}
              {(phase === "complete" || isCompleted) && (
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Streak badge */}
              {currentStreak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-3 bg-background/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1"
                >
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-white font-bold text-sm">{currentStreak} day streak</span>
                </motion.div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-12 h-12 text-white mx-auto" />
                  </motion.div>
                  <p className="text-white mt-4">Loading today's quest...</p>
                </div>
              )}

              {/* Intro phase */}
              {!loading && phase === "intro" && task && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mb-4"
                  >
                    <MascotWithExpression expression="excited" size="lg" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
                  >
                    {childName ? `Good morning, ${childName}!` : "Good morning!"}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 mb-4"
                  >
                    Ready for today's quest? 🌟
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-background/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
                  >
                    <span className="text-4xl block mb-2">{task.emoji}</span>
                    <h3 className="font-display font-bold text-white text-lg mb-1">
                      {task.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-3">{task.description}</p>
                    <div className="flex items-center justify-center gap-2 text-star">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold">+{task.xpReward} XP</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      onClick={handleStartTask}
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Let's Go!
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Complete phase */}
              {!loading && (phase === "complete" || isCompleted) && (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="mb-4"
                  >
                    <MascotWithExpression expression="celebrating" size="lg" />
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                  >
                    <CheckCircle className="w-16 h-16 text-mint mx-auto" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
                  >
                    Quest Complete! 🎉
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-background/20 backdrop-blur-sm rounded-2xl p-4 mb-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6 text-star" />
                      <span className="text-white font-bold text-2xl">
                        +{earnedXp || task?.xpReward || 0} XP
                      </span>
                    </div>
                    {(newStreak > 0 || currentStreak > 0) && (
                      <div className="flex items-center justify-center gap-2 mt-2 text-orange-300">
                        <Flame className="w-4 h-4" />
                        <span className="font-medium">
                          {newStreak || currentStreak} day streak!
                        </span>
                      </div>
                    )}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/90 mb-4"
                  >
                    You're doing amazing! See you tomorrow! ✨
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      onClick={handleClose}
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </>
              )}

              {/* No task available */}
              {!loading && !task && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-4"
                  >
                    <Timer className="w-16 h-16 text-white/50 mx-auto" />
                  </motion.div>
                  <h2 className="font-display text-xl font-bold text-white mb-2">
                    No Quest Today
                  </h2>
                  <p className="text-white/80 mb-4">
                    Check back tomorrow for a new adventure!
                  </p>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="rounded-full"
                  >
                    Close
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyTaskModal;
