import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface GermBlasterGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Germ {
  id: number;
  x: number;
  y: number;
  type: 'green' | 'purple' | 'red';
}

const DIFFICULTY_CONFIG = {
  easy: { spawnInterval: 1800, maxGerms: 6, timeLimit: 50, winCondition: 15 },
  medium: { spawnInterval: 1200, maxGerms: 8, timeLimit: 40, winCondition: 22 },
  hard: { spawnInterval: 800, maxGerms: 10, timeLimit: 30, winCondition: 30 },
};

const germEmojis = { green: '🦠', purple: '🧫', red: '👾' };

const GermBlasterGame = ({ game, onComplete }: GermBlasterGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [germs, setGerms] = useState<Germ[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameStarted, setGameStarted] = useState(false);
  const [blasts, setBlasts] = useState<{ id: number; x: number; y: number }[]>([]);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const spawnGerm = useCallback(() => {
    const types: ('green' | 'purple' | 'red')[] = ['green', 'purple', 'red'];
    const newGerm: Germ = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      type: types[Math.floor(Math.random() * types.length)],
    };
    setGerms(prev => [...prev, newGerm]);
  }, []);

  const blastGerm = (germId: number, x: number, y: number) => {
    setBlasts(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => setBlasts(prev => prev.slice(1)), 300);
    
    setGerms(prev => prev.filter(g => g.id !== germId));
    setScore(prev => prev + 1);
    playSound("tap");
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const spawnInterval = setInterval(() => {
      if (germs.length < config.maxGerms) {
        spawnGerm();
      }
    }, config.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, germs.length, spawnGerm, config.spawnInterval, config.maxGerms, difficulty]);

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
    startBackgroundMusic("excited"); // Start background music when game begins
    spawnGerm();
  };

  // Cleanup music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-green-100 to-lime-200 dark:from-green-900 dark:to-lime-950">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">🔫 {score}/{config.winCondition}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      {/* Blast effects */}
      <AnimatePresence>
        {blasts.map(blast => (
          <motion.div
            key={blast.id}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute text-4xl pointer-events-none"
            style={{
              left: `${blast.x}%`,
              top: `${blast.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            💥
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Germs */}
      <AnimatePresence>
        {germs.map(germ => (
          <motion.button
            key={germ.id}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              rotate: [0, 10, -10, 0],
              transition: { rotate: { repeat: Infinity, duration: 0.8 } }
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.5 }}
            onClick={() => blastGerm(germ.id, germ.x, germ.y)}
            className="absolute cursor-crosshair text-5xl transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${germ.x}%`,
              top: `${germ.y}%`,
            }}
          >
            {germEmojis[germ.type]}
          </motion.button>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-3xl">
        🪥 Toothbrush Laser Ready!
      </div>
    </div>
  );
};

export default GermBlasterGame;
