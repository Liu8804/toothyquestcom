import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface NighttimeBrushQuestGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface SleepyGerm {
  id: number;
  x: number;
  y: number;
  isAsleep: boolean;
}

const DIFFICULTY_CONFIG = {
  easy: { germCount: 8, timeLimit: 50, brushRadius: 18 },
  medium: { germCount: 12, timeLimit: 45, brushRadius: 15 },
  hard: { germCount: 16, timeLimit: 40, brushRadius: 12 },
};

const NighttimeBrushQuestGame = ({ game, onComplete }: NighttimeBrushQuestGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [germs, setGerms] = useState<SleepyGerm[]>([]);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameStarted, setGameStarted] = useState(false);
  const [brushPosition, setBrushPosition] = useState({ x: 50, y: 50 });
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const cleanedCount = germs.filter(g => g.isAsleep).length;

  const initializeGerms = useCallback((germCount: number) => {
    const newGerms: SleepyGerm[] = [];
    for (let i = 0; i < germCount; i++) {
      newGerms.push({
        id: i,
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 20,
        isAsleep: false,
      });
    }
    setGerms(newGerms);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setBrushPosition({ x, y });

    setGerms(prev => prev.map(germ => {
      const distance = Math.sqrt(Math.pow(germ.x - x, 2) + Math.pow(germ.y - y, 2));
      if (distance < config.brushRadius && !germ.isAsleep) {
        playSound("tap");
        return { ...germ, isAsleep: true };
      }
      return germ;
    }));
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = cleanedCount >= config.germCount;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, cleanedCount, onComplete, config.germCount, difficulty]);

  useEffect(() => {
    if (cleanedCount >= config.germCount && gameStarted) {
      const stars = timeLeft > 25 ? 3 : timeLeft > 15 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [cleanedCount, config.germCount, onComplete, gameStarted, timeLeft]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    initializeGerms(cfg.germCount);
    setGameStarted(true);
    startBackgroundMusic("calm");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div 
      className="relative h-full w-full overflow-hidden bg-gradient-to-b from-indigo-900 to-purple-950"
      onMouseMove={handleMouseMove}
      style={{ cursor: 'none' }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/30 text-xs"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: Math.random() * 2 }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">😴 {cleanedCount}/{config.germCount}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-white/70">🌙 Move your toothbrush to put germs to sleep!</p>
      </div>

      {/* Germs */}
      {germs.map(germ => (
        <motion.div
          key={germ.id}
          initial={{ scale: 1 }}
          animate={germ.isAsleep ? { scale: 0.5, opacity: 0.5 } : { scale: [1, 1.1, 1] }}
          transition={germ.isAsleep ? {} : { repeat: Infinity, duration: 0.8 }}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: `${germ.x}%`,
            top: `${germ.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {germ.isAsleep ? '😴' : '👾'}
        </motion.div>
      ))}

      {/* Toothbrush cursor */}
      <motion.div
        className="absolute text-4xl pointer-events-none z-20"
        style={{
          left: `${brushPosition.x}%`,
          top: `${brushPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        🪥
        <motion.div
          className="absolute inset-0 rounded-full bg-cyan-400/20"
          style={{
            width: `${config.brushRadius * 4}px`,
            height: `${config.brushRadius * 4}px`,
            transform: 'translate(-30%, -30%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <span className="text-4xl">🌙</span>
        <p className="text-sm mt-1">Sweet dreams await!</p>
      </div>
    </div>
  );
};

export default NighttimeBrushQuestGame;
