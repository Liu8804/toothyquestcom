import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import DifficultySelector, { Difficulty, DifficultySettings } from "./DifficultySelector";

interface SugarBugChaseGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface SugarBug {
  id: number;
  x: number;
  startY: number;
  speed: number;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings & { maxEscaped: number; bugSpeedMin: number; bugSpeedMax: number }> = {
  easy: { spawnInterval: 2000, fallSpeed: 8, timeLimit: 60, winCondition: 10, maxEscaped: 8, bugSpeedMin: 0.2, bugSpeedMax: 0.4 },
  medium: { spawnInterval: 1000, fallSpeed: 5, timeLimit: 45, winCondition: 15, maxEscaped: 5, bugSpeedMin: 0.3, bugSpeedMax: 0.5 },
  hard: { spawnInterval: 600, fallSpeed: 3, timeLimit: 30, winCondition: 20, maxEscaped: 3, bugSpeedMin: 0.5, bugSpeedMax: 0.8 },
};

const SugarBugChaseGame = ({ game, onComplete }: SugarBugChaseGameProps) => {
  const { t } = useTranslation();
  const [bugs, setBugs] = useState<SugarBug[]>([]);
  const [score, setScore] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);

  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : null;

  const spawnBug = useCallback(() => {
    if (!settings) return;
    const newBug: SugarBug = {
      id: Date.now() + Math.random(),
      x: Math.random() * 70 + 15,
      startY: -10,
      speed: Math.random() * (settings.bugSpeedMax - settings.bugSpeedMin) + settings.bugSpeedMin,
    };
    setBugs(prev => [...prev, newBug]);
  }, [settings]);

  useEffect(() => {
    if (!gameStarted || !settings) return;

    const spawnInterval = setInterval(spawnBug, settings.spawnInterval);
    return () => clearInterval(spawnInterval);
  }, [gameStarted, spawnBug, settings]);

  useEffect(() => {
    if (!gameStarted || !settings) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = escaped < settings.maxEscaped;
          const stars = won ? (difficulty === "hard" ? 3 : difficulty === "medium" ? 3 : 2) : 1;
          onComplete(won, stars);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, escaped, onComplete, settings, difficulty]);

  useEffect(() => {
    if (settings && escaped >= settings.maxEscaped) {
      onComplete(false, 1);
    }
  }, [escaped, onComplete, settings]);

  const tapBug = (bugId: number) => {
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setScore(prev => prev + 1);
  };

  const handleBugEscape = (bugId: number) => {
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setEscaped(prev => prev + 1);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setTimeLeft(DIFFICULTY_SETTINGS[diff].timeLimit);
    setGameStarted(true);
  };

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <DifficultySelector onSelect={handleDifficultySelect} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">🎯 {score}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-destructive">💀 {escaped}/{settings?.maxEscaped}</span>
        </div>
      </div>

      {/* Tooth to protect at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🦷
        </motion.div>
        <p className="text-center text-xs text-muted-foreground mt-1">{t("games.protectMe")}</p>
      </div>

      {/* Sugar Bugs */}
      <AnimatePresence>
        {bugs.map(bug => (
          <motion.button
            key={bug.id}
            initial={{ y: "-10%", x: `${bug.x}%`, scale: 0 }}
            animate={{ 
              y: "85%", 
              scale: 1,
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              y: { duration: settings!.fallSpeed / bug.speed, ease: "linear" },
              rotate: { repeat: Infinity, duration: 0.8 },
              scale: { duration: 0.3 }
            }}
            exit={{ scale: 0, opacity: 0 }}
            onAnimationComplete={() => handleBugEscape(bug.id)}
            whileTap={{ scale: 0.7 }}
            onClick={() => tapBug(bug.id)}
            className="absolute text-5xl md:text-6xl cursor-pointer transform -translate-x-1/2 p-2 select-none touch-manipulation"
            style={{ 
              left: `${bug.x}%`,
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
          >
            🐛
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SugarBugChaseGame;
