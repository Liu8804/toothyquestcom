import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import GameImage from "./GameImage";
import { gameImages } from "@/assets/games";

interface SuperSmileMakerGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface HygieneStep {
  id: string;
  emoji: string;
  name: string;
  action: string;
  holdTime: number;
}

const hygieneSteps: HygieneStep[] = [
  { id: 'brush', emoji: '🪥', name: 'Brush teeth', action: 'Hold to brush!', holdTime: 3 },
  { id: 'floss', emoji: '🧵', name: 'Floss between', action: 'Hold to floss!', holdTime: 2 },
  { id: 'rinse', emoji: '💧', name: 'Rinse mouth', action: 'Hold to rinse!', holdTime: 2 },
  { id: 'mouthwash', emoji: '🧴', name: 'Mouthwash', action: 'Hold to swish!', holdTime: 2 },
  { id: 'tongue', emoji: '👅', name: 'Clean tongue', action: 'Hold to clean!', holdTime: 2 },
];

const DIFFICULTY_CONFIG = {
  easy: { steps: 3, timeLimit: 60 },
  medium: { steps: 4, timeLimit: 50 },
  hard: { steps: 5, timeLimit: 45 },
};

const SuperSmileMakerGame = ({ game, onComplete }: SuperSmileMakerGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [activeSteps, setActiveSteps] = useState<HygieneStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [smileShine, setSmileShine] = useState(0);
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
          onComplete(false, 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, onComplete, difficulty]);

  useEffect(() => {
    if (!gameStarted || !isHolding || currentStepIndex >= activeSteps.length) return;

    const currentStep = activeSteps[currentStepIndex];
    const holdInterval = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + (100 / (currentStep.holdTime * 10));
        if (newProgress >= 100) {
          clearInterval(holdInterval);
          handleStepComplete();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(holdInterval);
  }, [gameStarted, isHolding, currentStepIndex, activeSteps]);

  const handleStepComplete = () => {
    const currentStep = activeSteps[currentStepIndex];
    setCompletedSteps(prev => [...prev, currentStep.id]);
    setSmileShine(prev => prev + 20);
    playSound("success");

    if (currentStepIndex + 1 >= activeSteps.length) {
      const stars = timeLeft > config.timeLimit * 0.5 ? 3 : timeLeft > config.timeLimit * 0.25 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 800);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePress = () => {
    if (currentStepIndex >= activeSteps.length) return;
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
    setActiveSteps(hygieneSteps.slice(0, cfg.steps));
    setGameStarted(true);
    startBackgroundMusic("calm");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  const currentStep = activeSteps[currentStepIndex];

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-yellow-100 to-amber-200 dark:from-yellow-900 dark:to-amber-950 p-4">
      {/* Semi-3D watermark */}
      {gameImages[game.id] && (
        <div className="absolute top-16 right-4 opacity-20 pointer-events-none z-0">
          <GameImage src={gameImages[game.id]} alt="" width={80} height={80} enable3D />
        </div>
      )}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">✨ {completedSteps.length}/{activeSteps.length}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full pt-12">
        {/* Smile preview */}
        <motion.div 
          className="relative mb-6"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="text-8xl">😁</div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: smileShine / 100 }}
          >
            <span className="text-6xl">✨</span>
          </motion.div>
        </motion.div>

        {/* Progress steps */}
        <div className="flex gap-3 mb-6">
          {activeSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                completedSteps.includes(step.id)
                  ? 'bg-green-500'
                  : index === currentStepIndex
                  ? 'bg-primary ring-4 ring-primary/30'
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.button
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                onTouchStart={handlePress}
                onTouchEnd={handleRelease}
                className="relative w-36 h-36 rounded-full bg-card shadow-xl flex flex-col items-center justify-center"
                animate={isHolding ? { scale: 0.95 } : { scale: 1 }}
              >
                <span className="text-5xl">{currentStep.emoji}</span>
                <p className="text-sm font-medium mt-2">{currentStep.name}</p>
                
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                  <circle
                    cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={`${holdProgress * 4.27} 427`}
                    className="text-primary"
                  />
                </svg>
              </motion.button>

              <p className="mt-4 text-lg font-medium text-foreground">
                {isHolding ? '🌟 Keep holding!' : currentStep.action}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {completedSteps.length === activeSteps.length && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <span className="text-6xl">🌟</span>
            <p className="text-xl font-bold text-foreground mt-2">Super Smile Complete!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SuperSmileMakerGame;
