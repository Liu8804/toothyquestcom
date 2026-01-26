import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface MouthwashSplashGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Germ {
  id: number;
  x: number;
  y: number;
  cleaned: boolean;
}

const DIFFICULTY_CONFIG = {
  easy: { germCount: 8, timeLimit: 45, splashRadius: 20 },
  medium: { germCount: 12, timeLimit: 35, splashRadius: 15 },
  hard: { germCount: 18, timeLimit: 30, splashRadius: 12 },
};

const MouthwashSplashGame = ({ game, onComplete }: MouthwashSplashGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [germs, setGerms] = useState<Germ[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const cleanedCount = germs.filter(g => g.cleaned).length;

  const initializeGerms = useCallback((germCount: number) => {
    const newGerms: Germ[] = [];
    for (let i = 0; i < germCount; i++) {
      newGerms.push({
        id: i,
        x: Math.random() * 70 + 15,
        y: Math.random() * 60 + 20,
        cleaned: false,
      });
    }
    setGerms(newGerms);
  }, []);

  const handleSplash = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Play splash sound
    playSound("bounce");
    
    setSplashes(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => {
      setSplashes(prev => prev.slice(1));
    }, 500);

    let hitCount = 0;
    setGerms(prev => prev.map(germ => {
      const distance = Math.sqrt(Math.pow(germ.x - x, 2) + Math.pow(germ.y - y, 2));
      if (distance < config.splashRadius && !germ.cleaned) {
        hitCount++;
        return { ...germ, cleaned: true };
      }
      return germ;
    }));
    
    // Play success sound if we hit germs
    if (hitCount > 0) {
      playSound("success");
    }
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
      const stars = timeLeft > 20 ? 3 : timeLeft > 10 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [cleanedCount, config.germCount, onComplete, gameStarted, timeLeft]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    initializeGerms(cfg.germCount);
    setGameStarted(true);
    startBackgroundMusic("happy");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div 
      className="relative h-full w-full overflow-hidden bg-gradient-to-b from-teal-100 to-cyan-200 dark:from-teal-900 dark:to-cyan-950 cursor-crosshair"
      onClick={handleSplash}
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">💧 {cleanedCount}/{config.germCount}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <p className="text-sm text-muted-foreground">Tap to splash mouthwash!</p>
      </div>

      {/* Splash effects */}
      <AnimatePresence>
        {splashes.map(splash => (
          <motion.div
            key={splash.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-16 h-16 rounded-full bg-cyan-400/50 pointer-events-none"
            style={{
              left: `${splash.x}%`,
              top: `${splash.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Germs */}
      {germs.map(germ => (
        <motion.div
          key={germ.id}
          initial={{ scale: 1 }}
          animate={germ.cleaned ? { scale: 0, opacity: 0 } : { scale: 1 }}
          className="absolute text-3xl pointer-events-none"
          style={{
            left: `${germ.x}%`,
            top: `${germ.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {germ.cleaned ? '✨' : '🦠'}
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl pointer-events-none">
        🧴 Mouthwash Ready!
      </div>
    </div>
  );
};

export default MouthwashSplashGame;
