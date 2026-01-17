import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
interface ToothDefenderGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  isHealthy: boolean;
  emoji: string;
}

const healthyItems = ["🥕", "🍎", "🥛", "🧀", "💧", "🥦"];
const unhealthyItems = ["🍭", "🍫", "🥤", "🍰", "🍬", "🍪"];

const ToothDefenderGame = ({ game, onComplete }: ToothDefenderGameProps) => {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [totalCaught, setTotalCaught] = useState(0);
  const { playSound } = useGameSounds();

  useEffect(() => {
    if (!gameStarted) return;

    const spawnInterval = setInterval(() => {
      const isHealthy = Math.random() > 0.4;
      const itemList = isHealthy ? healthyItems : unhealthyItems;
      const newItem: FallingItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: 0,
        isHealthy,
        emoji: itemList[Math.floor(Math.random() * itemList.length)],
      };
      setItems(prev => [...prev, newItem]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({ ...item, y: item.y + 3 }));
        const remaining = updated.filter(item => {
          if (item.y >= 90) {
            if (item.isHealthy) {
              setLives(l => l - 1);
            }
            return false;
          }
          return true;
        });
        return remaining;
      });
    }, 100);

    return () => clearInterval(moveInterval);
  }, [gameStarted]);

  useEffect(() => {
    if (lives <= 0) {
      onComplete(false, 1);
    }
  }, [lives, onComplete]);

  useEffect(() => {
    if (totalCaught >= 15) {
      onComplete(true, 3);
    }
  }, [totalCaught, onComplete]);

  const handleItemTap = (item: FallingItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (item.isHealthy) {
      setScore(prev => prev + 10);
      setTotalCaught(prev => prev + 1);
      playSound("success");
    } else {
      setLives(prev => prev - 1);
      playSound("lose");
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-4">{game.instructionsKids}</p>
        <div className="flex gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl">✅</div>
            <p className="text-xs text-muted-foreground">Tap healthy!</p>
          </div>
          <div className="text-center">
            <div className="text-2xl">❌</div>
            <p className="text-xs text-muted-foreground">Avoid candy!</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold rounded-full text-xl"
        >
          Start Game!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-950">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">Score: {score}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">
            {"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}
          </span>
        </div>
      </div>

      {/* Tooth at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
        🦷
      </div>

      {/* Falling Items */}
      <AnimatePresence>
        {items.map(item => (
          <motion.button
            key={item.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.5 }}
            onClick={() => handleItemTap(item)}
            className="absolute text-4xl cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {item.emoji}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToothDefenderGame;
