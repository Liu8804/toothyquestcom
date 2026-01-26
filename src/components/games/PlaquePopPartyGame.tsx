import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface PlaquePopPartyGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

const DIFFICULTY_CONFIG = {
  easy: { spawnInterval: 1500, maxBubbles: 5, timeLimit: 45, winCondition: 12 },
  medium: { spawnInterval: 1000, maxBubbles: 7, timeLimit: 35, winCondition: 18 },
  hard: { spawnInterval: 700, maxBubbles: 10, timeLimit: 30, winCondition: 25 },
};

const PlaquePopPartyGame = ({ game, onComplete }: PlaquePopPartyGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const spawnBubble = useCallback(() => {
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 100,
      size: Math.random() * 25 + 35,
      speed: Math.random() * 0.5 + 0.3,
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  const popBubble = (bubbleId: number) => {
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setScore(prev => prev + 1);
    playSound("pop");
    
    // Play celebration sound every 5 pops
    if ((score + 1) % 5 === 0) {
      setTimeout(() => playSound("correct"), 100);
    }
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const spawnInterval = setInterval(() => {
      if (bubbles.length < config.maxBubbles) {
        spawnBubble();
      }
    }, config.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, bubbles.length, spawnBubble, config.spawnInterval, config.maxBubbles, difficulty]);

  // Move bubbles up
  useEffect(() => {
    if (!gameStarted) return;

    const moveInterval = setInterval(() => {
      setBubbles(prev => 
        prev.map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -10)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = score >= config.winCondition;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, score, onComplete, config.winCondition, difficulty]);

  useEffect(() => {
    if (score >= config.winCondition && gameStarted) {
      onComplete(true, 3);
    }
  }, [score, config.winCondition, onComplete, gameStarted]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    setGameStarted(true);
    spawnBubble();
    startBackgroundMusic("happy"); // Start fun background music
  };

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-cyan-100 to-blue-200 dark:from-cyan-900 dark:to-blue-950">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">{t("games.score")}: {score}/{config.winCondition}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            whileTap={{ scale: 0.5 }}
            onClick={() => popBubble(bubble.id)}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-300 to-purple-600 opacity-80 shadow-lg flex items-center justify-center text-2xl">
              🫧
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
        🦷🦷🦷
      </div>
    </div>
  );
};

export default PlaquePopPartyGame;
