import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface PlaquePatrolGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface PlaqueBug {
  id: number;
  x: number;
  y: number;
  size: number;
}

const DIFFICULTY_CONFIG = {
  easy: { spawnInterval: 2000, maxBugs: 4, timeLimit: 45, winCondition: 8 },
  medium: { spawnInterval: 1500, maxBugs: 5, timeLimit: 30, winCondition: 10 },
  hard: { spawnInterval: 1000, maxBugs: 6, timeLimit: 25, winCondition: 15 },
};

const PlaquePatrolGame = ({ game, onComplete }: PlaquePatrolGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [bugs, setBugs] = useState<PlaqueBug[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalBugs, setTotalBugs] = useState(10);
  const { playSound } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const spawnBug = useCallback(() => {
    const newBug: PlaqueBug = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      size: Math.random() * 20 + 30,
    };
    setBugs(prev => [...prev, newBug]);
  }, []);

  const tapBug = (bugId: number) => {
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setScore(prev => prev + 1);
    playSound("tap");
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const spawnInterval = setInterval(() => {
      if (bugs.length < config.maxBugs) {
        spawnBug();
      }
    }, config.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, bugs.length, spawnBug, config.spawnInterval, config.maxBugs, difficulty]);

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
    if (score >= totalBugs && gameStarted) {
      onComplete(true, 3);
    }
  }, [score, totalBugs, onComplete, gameStarted]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    setTotalBugs(cfg.winCondition);
    setGameStarted(true);
    spawnBug();
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={game}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setGameStarted(true);
            spawnBug();
          }}
          className="px-8 py-4 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-full text-xl"
        >
          {t("games.startGame")}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">{t("games.score")}: {score}/{totalBugs}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
          <span className="text-xs font-medium text-muted-foreground capitalize">{difficulty}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      {/* Teeth Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="text-9xl">🦷🦷🦷</div>
      </div>

      {/* Plaque Bugs */}
      <AnimatePresence>
        {bugs.map(bug => (
          <motion.button
            key={bug.id}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: [0, 10, -10, 0],
              transition: { rotate: { repeat: Infinity, duration: 0.5 } }
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.5 }}
            onClick={() => tapBug(bug.id)}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{
              left: `${bug.x}%`,
              top: `${bug.y}%`,
              fontSize: `${bug.size}px`,
            }}
          >
            🦠
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PlaquePatrolGame;
