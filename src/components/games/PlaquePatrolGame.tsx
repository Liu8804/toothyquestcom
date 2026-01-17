import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";

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

const PlaquePatrolGame = ({ game, onComplete }: PlaquePatrolGameProps) => {
  const [bugs, setBugs] = useState<PlaqueBug[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalBugs] = useState(15);
  const { playSound } = useGameSounds();

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
    if (!gameStarted) return;

    // Spawn bugs periodically
    const spawnInterval = setInterval(() => {
      if (bugs.length < 5) {
        spawnBug();
      }
    }, 1500);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, bugs.length, spawnBug]);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = score >= 10;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, score, onComplete]);

  useEffect(() => {
    if (score >= totalBugs) {
      onComplete(true, 3);
    }
  }, [score, totalBugs, onComplete]);

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
          Start Game!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">Score: {score}/{totalBugs}</span>
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
