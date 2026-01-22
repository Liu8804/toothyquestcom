import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface FlossSequenceGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface SequenceStep {
  id: number;
  emoji: string;
  name: string;
  order: number;
}

const allSteps: Omit<SequenceStep, 'id' | 'order'>[] = [
  { emoji: '🧵', name: 'Get floss' },
  { emoji: '✂️', name: 'Cut 18 inches' },
  { emoji: '👆', name: 'Wrap around fingers' },
  { emoji: '🦷', name: 'Slide between teeth' },
  { emoji: '⬆️', name: 'Move up and down' },
  { emoji: '🔄', name: 'Use clean section' },
  { emoji: '🚿', name: 'Rinse mouth' },
  { emoji: '🗑️', name: 'Throw away floss' },
];

const DIFFICULTY_CONFIG = {
  easy: { stepCount: 4, timeLimit: 60 },
  medium: { stepCount: 6, timeLimit: 50 },
  hard: { stepCount: 8, timeLimit: 40 },
};

const FlossSequenceGame = ({ game, onComplete }: FlossSequenceGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [placedSteps, setPlacedSteps] = useState<SequenceStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<SequenceStep | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const { playSound } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const initializeSteps = (stepCount: number) => {
    const selected = allSteps.slice(0, stepCount).map((step, index) => ({
      ...step,
      id: index,
      order: index,
    }));
    
    // Shuffle for display
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    setSteps(shuffled);
    setPlacedSteps([]);
  };

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

  const handleStepClick = (step: SequenceStep) => {
    if (placedSteps.find(s => s.id === step.id)) return;
    
    const expectedOrder = placedSteps.length;
    
    if (step.order === expectedOrder) {
      playSound("success");
      setPlacedSteps(prev => [...prev, step]);
      
      if (placedSteps.length + 1 === steps.length) {
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setTimeout(() => onComplete(true, stars), 500);
      }
    } else {
      playSound("lose");
      setMistakes(prev => prev + 1);
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    initializeSteps(cfg.stepCount);
    setGameStarted(true);
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-teal-100 to-green-200 dark:from-teal-900 dark:to-green-950 p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">📋 {placedSteps.length}/{steps.length}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">❌ {mistakes}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start h-full pt-16 overflow-auto">
        <h3 className="text-lg font-bold text-foreground mb-4">Put the flossing steps in order!</h3>

        {/* Placed sequence */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-16 p-4 bg-card/50 rounded-xl w-full max-w-md">
          {placedSteps.length === 0 ? (
            <p className="text-muted-foreground text-center w-full">Tap steps in the correct order...</p>
          ) : (
            placedSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg"
              >
                <span className="font-bold">{index + 1}.</span>
                <span>{step.emoji}</span>
              </motion.div>
            ))
          )}
        </div>

        {/* Available steps */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {steps.map(step => {
            const isPlaced = placedSteps.find(s => s.id === step.id);
            return (
              <motion.button
                key={step.id}
                whileHover={{ scale: isPlaced ? 1 : 1.05 }}
                whileTap={{ scale: isPlaced ? 1 : 0.95 }}
                onClick={() => handleStepClick(step)}
                disabled={!!isPlaced}
                className={`p-4 rounded-xl text-center transition-all ${
                  isPlaced
                    ? 'bg-muted text-muted-foreground opacity-50'
                    : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <span className="text-3xl block mb-1">{step.emoji}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlossSequenceGame;
