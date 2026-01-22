import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface PlaqueDetectiveGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface HiddenPlaque {
  id: number;
  x: number;
  y: number;
  found: boolean;
  size: 'small' | 'medium' | 'large';
}

const DIFFICULTY_CONFIG = {
  easy: { plaqueCount: 6, timeLimit: 45, hintInterval: 8000 },
  medium: { plaqueCount: 10, timeLimit: 40, hintInterval: 12000 },
  hard: { plaqueCount: 14, timeLimit: 35, hintInterval: 0 },
};

const PlaqueDetectiveGame = ({ game, onComplete }: PlaqueDetectiveGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [plaques, setPlaques] = useState<HiddenPlaque[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { playSound } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const foundCount = plaques.filter(p => p.found).length;

  const initializePlaques = useCallback((count: number) => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const newPlaques: HiddenPlaque[] = [];
    
    for (let i = 0; i < count; i++) {
      newPlaques.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        found: false,
        size: sizes[Math.floor(Math.random() * sizes.length)],
      });
    }
    setPlaques(newPlaques);
  }, []);

  const handlePlaqueClick = (plaqueId: number) => {
    setPlaques(prev => prev.map(p => 
      p.id === plaqueId ? { ...p, found: true } : p
    ));
    playSound("success");
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = foundCount >= config.plaqueCount;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, foundCount, config.plaqueCount, onComplete, difficulty]);

  // Hint system
  useEffect(() => {
    if (!gameStarted || !difficulty || config.hintInterval === 0) return;

    const hintTimer = setInterval(() => {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 1500);
    }, config.hintInterval);

    return () => clearInterval(hintTimer);
  }, [gameStarted, difficulty, config.hintInterval]);

  useEffect(() => {
    if (foundCount >= config.plaqueCount && gameStarted) {
      const stars = timeLeft > 25 ? 3 : timeLeft > 15 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [foundCount, config.plaqueCount, timeLeft, onComplete, gameStarted]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    initializePlaques(cfg.plaqueCount);
    setGameStarted(true);
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  const getSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'text-xl opacity-40';
      case 'medium': return 'text-2xl opacity-50';
      case 'large': return 'text-3xl opacity-60';
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900">
      {/* Teeth background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-8xl"
            style={{
              left: `${(i % 4) * 25 + 5}%`,
              top: `${Math.floor(i / 4) * 50 + 20}%`,
            }}
          >
            🦷
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">🔎 {foundCount}/{config.plaqueCount}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground">🔍 Find all the hidden plaque!</p>
      </div>

      {/* Hidden plaques */}
      <AnimatePresence>
        {plaques.map(plaque => (
          <motion.button
            key={plaque.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: plaque.found ? 0 : (showHint ? 1 : 0.3),
              scale: plaque.found ? 0 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => !plaque.found && handlePlaqueClick(plaque.id)}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getSizeClass(plaque.size)}`}
            style={{
              left: `${plaque.x}%`,
              top: `${plaque.y}%`,
            }}
          >
            {plaque.found ? '✨' : '🦠'}
          </motion.button>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground">
          {showHint ? '👀 Quick! I see some plaque!' : 'Look carefully for hidden plaque...'}
        </p>
      </div>
    </div>
  );
};

export default PlaqueDetectiveGame;
