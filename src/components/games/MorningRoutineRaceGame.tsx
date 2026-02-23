import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import GameImage from "./GameImage";
import { gameImages } from "@/assets/games";

interface MorningRoutineRaceGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface RoutineStep {
  id: string;
  emoji: string;
  name: string;
  duration: number; // seconds to complete
}

const routineSteps: RoutineStep[] = [
  { id: 'rinse', emoji: '💧', name: 'Rinse mouth', duration: 3 },
  { id: 'paste', emoji: '🧴', name: 'Add toothpaste', duration: 2 },
  { id: 'brush-top', emoji: '⬆️', name: 'Brush top teeth', duration: 5 },
  { id: 'brush-bottom', emoji: '⬇️', name: 'Brush bottom teeth', duration: 5 },
  { id: 'brush-front', emoji: '😁', name: 'Brush front teeth', duration: 4 },
  { id: 'tongue', emoji: '👅', name: 'Clean tongue', duration: 3 },
  { id: 'floss', emoji: '🧵', name: 'Floss teeth', duration: 4 },
  { id: 'mouthwash', emoji: '🥤', name: 'Mouthwash rinse', duration: 3 },
];

const DIFFICULTY_CONFIG = {
  easy: { steps: 4, timeLimit: 45, holdTime: 1.5 },
  medium: { steps: 6, timeLimit: 50, holdTime: 2 },
  hard: { steps: 8, timeLimit: 55, holdTime: 2.5 },
};

const MorningRoutineRaceGame = ({ game, onComplete }: MorningRoutineRaceGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeSteps, setActiveSteps] = useState<RoutineStep[]>([]);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = completedSteps.length >= activeSteps.length;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, completedSteps.length, activeSteps.length, onComplete, difficulty]);

  useEffect(() => {
    if (!gameStarted || !isHolding) return;

    const holdInterval = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + (100 / (config.holdTime * 10));
        if (newProgress >= 100) {
          clearInterval(holdInterval);
          handleStepComplete();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(holdInterval);
  }, [gameStarted, isHolding, config.holdTime]);

  const handleStepComplete = () => {
    const currentStep = activeSteps[currentStepIndex];
    setCompletedSteps(prev => [...prev, currentStep.id]);
    playSound("success");

    if (currentStepIndex + 1 >= activeSteps.length) {
      const stars = timeLeft > config.timeLimit * 0.5 ? 3 : timeLeft > config.timeLimit * 0.25 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 500);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePress = () => {
    if (completedSteps.length >= activeSteps.length) return;
    setIsHolding(true);
    playSound("tap");
  };

  const handleRelease = () => {
    setIsHolding(false);
    setHoldProgress(0);
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    setActiveSteps(routineSteps.slice(0, cfg.steps));
    setGameStarted(true);
    startBackgroundMusic("happy");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  const currentStep = activeSteps[currentStepIndex];

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-orange-100 to-pink-200 dark:from-orange-900 dark:to-pink-950 p-4">
      {/* Semi-3D watermark */}
      {gameImages[game.id] && (
        <div className="absolute top-16 right-4 opacity-20 pointer-events-none z-0">
          <GameImage src={gameImages[game.id]} alt="" width={80} height={80} enable3D />
        </div>
      )}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">🌅 {completedSteps.length}/{activeSteps.length}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full pt-12">
        {/* Progress indicators */}
        <div className="flex gap-2 mb-6">
          {activeSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                completedSteps.includes(step.id)
                  ? 'bg-green-500'
                  : index === currentStepIndex
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
              animate={index === currentStepIndex ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {step.emoji}
            </motion.div>
          ))}
        </div>

        {currentStep && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.button
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                onTouchStart={handlePress}
                onTouchEnd={handleRelease}
                className="relative w-40 h-40 rounded-full bg-card shadow-xl flex flex-col items-center justify-center"
                animate={isHolding ? { scale: 0.95 } : { scale: 1 }}
              >
                <span className="text-6xl">{currentStep.emoji}</span>
                <p className="text-sm font-medium mt-2">{currentStep.name}</p>
                
                {/* Circular progress */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${holdProgress * 4.77} 477`}
                    className="text-primary"
                  />
                </svg>
              </motion.button>

              <p className="mt-6 text-lg font-medium text-foreground">
                {isHolding ? '🪥 Keep holding!' : '👆 Hold to complete step!'}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MorningRoutineRaceGame;
