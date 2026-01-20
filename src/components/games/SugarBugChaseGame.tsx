import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";

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

const SugarBugChaseGame = ({ game, onComplete }: SugarBugChaseGameProps) => {
  const { t } = useTranslation();
  const [bugs, setBugs] = useState<SugarBug[]>([]);
  const [score, setScore] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // More time for kids (was 30)

  const spawnBug = useCallback(() => {
    const newBug: SugarBug = {
      id: Date.now() + Math.random(),
      x: Math.random() * 70 + 15, // More centered for easier tapping
      startY: -10,
      speed: Math.random() * 0.2 + 0.15, // Much slower speed (was 0.3-0.8)
    };
    setBugs(prev => [...prev, newBug]);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    // Slower spawn rate - every 1.5 seconds instead of 0.8
    const spawnInterval = setInterval(spawnBug, 1500);
    return () => clearInterval(spawnInterval);
  }, [gameStarted, spawnBug]);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = escaped < 5;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, escaped, onComplete]);

  useEffect(() => {
    if (escaped >= 5) {
      onComplete(false, 1);
    }
  }, [escaped, onComplete]);

  const tapBug = (bugId: number) => {
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setScore(prev => prev + 1);
  };

  const handleBugEscape = (bugId: number) => {
    setBugs(prev => prev.filter(b => b.id !== bugId));
    setEscaped(prev => prev + 1);
  };

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
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold rounded-full text-xl"
        >
          {t("games.startChasing")}
        </motion.button>
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
          <span className="font-bold text-destructive">💀 {escaped}/5</span>
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
      {/* Sugar Bugs - Larger and slower for kids */}
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
              y: { duration: 8 / bug.speed, ease: "linear" }, // Much slower fall (was 4)
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
