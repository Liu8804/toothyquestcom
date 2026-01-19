import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressRing from "./ProgressRing";
import ToothbrushCharacter from "./ToothbrushCharacter";
import MouthGrid from "./MouthGrid";
import RewardCelebration from "./RewardCelebration";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import DailyChallengeNotification from "@/components/DailyChallengeNotification";
import DentalTipsChatbot from "@/components/DentalTipsChatbot";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useQuestProgress } from "@/hooks/useQuestProgress";

interface BrushingTimerGameProps {
  isOpen: boolean;
  onClose: () => void;
}

type GamePhase = "ready" | "countdown" | "playing" | "paused" | "completed";

const TOTAL_TIME = 120; // 2 minutes in seconds
const QUADRANT_TIME = 30; // 30 seconds per quadrant

const encouragements = [
  "Great brushing! 🦷",
  "Keep it up! ⭐",
  "You're doing amazing! ✨",
  "Super brusher! 🌟",
  "Almost there! 💪",
];

export const BrushingTimerGame = ({ isOpen, onClose }: BrushingTimerGameProps) => {
  const { selectedChild } = useQuestProgress();
  const { incrementProgress } = useDailyChallenges(selectedChild?.id);
  
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [countdown, setCountdown] = useState(3);
  const [encouragement, setEncouragement] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [challengeNotification, setChallengeNotification] = useState<{
    show: boolean;
    title: string;
    xp: number;
  } | null>(null);
  const [showDentalChat, setShowDentalChat] = useState(false);

  const currentQuadrant = Math.floor((TOTAL_TIME - timeRemaining) / QUADRANT_TIME);
  const completedQuadrants = Array.from(
    { length: currentQuadrant },
    (_, i) => i
  );
  const progress = ((TOTAL_TIME - timeRemaining) / TOTAL_TIME) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
  }, []);

  const handlePause = useCallback(() => {
    setPhase("paused");
  }, []);

  const handleResume = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleReset = useCallback(() => {
    setPhase("ready");
    setTimeRemaining(TOTAL_TIME);
    setCountdown(3);
    setEncouragement("");
  }, []);

  // Countdown effect
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase("playing");
    }
  }, [phase, countdown]);

  // Main timer effect
  useEffect(() => {
    if (phase !== "playing") return;

    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase("completed");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Track daily challenge progress for brushing
      (async () => {
        const challengeResult = await incrementProgress("brush");
        if (challengeResult?.completed) {
          setTimeout(() => {
            setChallengeNotification({
              show: true,
              title: challengeResult.challengeTitle,
              xp: challengeResult.xpEarned,
            });
          }, 1500);
        }
      })();
    }
  }, [phase, timeRemaining, incrementProgress]);

  // Show encouragement at quadrant transitions
  useEffect(() => {
    if (phase === "playing" && timeRemaining > 0 && timeRemaining % QUADRANT_TIME === 0) {
      const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
      setEncouragement(msg);
      setTimeout(() => setEncouragement(""), 2000);
    }
  }, [timeRemaining, phase]);

  if (!isOpen) return null;

  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />
      <DailyChallengeNotification
        isOpen={challengeNotification?.show || false}
        challengeTitle={challengeNotification?.title || ""}
        xpEarned={challengeNotification?.xp || 0}
        onClose={() => setChallengeNotification(null)}
      />
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-float"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-card"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-0 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              🦷 Brushing Timer
            </h2>
            <p className="text-muted-foreground">
              Brush for 2 minutes to earn your stars!
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {phase === "completed" ? (
              <RewardCelebration 
                onPlayAgain={handleReset} 
                onClose={onClose}
                childName={selectedChild?.name}
                sessionType={new Date().getHours() < 12 ? "morning" : "evening"}
                onChatWithToothy={() => setShowDentalChat(true)}
              />
            ) : (
              <div className="flex flex-col items-center space-y-6">
                {/* Progress Ring with Timer */}
                <ProgressRing progress={progress} size={180}>
                  <div className="text-center">
                    {phase === "countdown" ? (
                      <motion.span
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="font-display text-5xl font-bold text-primary"
                      >
                        {countdown}
                      </motion.span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-bold text-foreground">
                          {formatTime(timeRemaining)}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          remaining
                        </p>
                      </>
                    )}
                  </div>
                </ProgressRing>

                {/* Encouragement message */}
                <AnimatePresence>
                  {encouragement && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="font-display text-xl font-bold text-primary"
                    >
                      {encouragement}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Game area */}
                {(phase === "playing" || phase === "paused") && (
                  <div className="flex items-center justify-center gap-8">
                    <ToothbrushCharacter
                      isActive={phase === "playing"}
                      currentQuadrant={currentQuadrant}
                    />
                    <MouthGrid
                      currentQuadrant={currentQuadrant}
                      completedQuadrants={completedQuadrants}
                    />
                  </div>
                )}

                {/* Ready state illustration */}
                {phase === "ready" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">🪥</div>
                    <p className="text-muted-foreground">
                      Ready to brush? Let's make those teeth sparkle!
                    </p>
                  </motion.div>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                  {phase === "ready" && (
                    <Button
                      onClick={handleStart}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-8 py-6 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Brushing!
                    </Button>
                  )}

                  {phase === "playing" && (
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="rounded-2xl px-6 py-6"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}

                  {phase === "paused" && (
                    <>
                      <Button
                        onClick={handleResume}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-6 py-6"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Resume
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="rounded-2xl px-6 py-6"
                      >
                        Reset
                      </Button>
                    </>
                  )}
                </div>

                {/* Quadrant indicator */}
                {(phase === "playing" || phase === "paused") && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Brushing section {currentQuadrant + 1} of 4
                    </p>
                    <div className="flex gap-2 justify-center mt-2">
                      {[0, 1, 2, 3].map((q) => (
                        <div
                          key={q}
                          className={`w-3 h-3 rounded-full transition-all ${
                            completedQuadrants.includes(q)
                              ? "bg-mint"
                              : q === currentQuadrant
                              ? "bg-primary w-6"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    
    {/* Dental Tips Chatbot */}
    <DentalTipsChatbot 
      isOpen={showDentalChat} 
      onClose={() => setShowDentalChat(false)}
      childName={selectedChild?.name}
    />
    </>
  );
};

export default BrushingTimerGame;
