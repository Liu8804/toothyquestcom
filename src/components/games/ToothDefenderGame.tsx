import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty, DifficultySettings } from "./DifficultySelector";

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

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: { spawnInterval: 2000, fallSpeed: 1.5, timeLimit: 60, winCondition: 10, lives: 5 },
  medium: { spawnInterval: 1200, fallSpeed: 2.5, timeLimit: 45, winCondition: 15, lives: 3 },
  hard: { spawnInterval: 800, fallSpeed: 3.5, timeLimit: 30, winCondition: 20, lives: 2 },
};

const ToothDefenderGame = ({ game, onComplete }: ToothDefenderGameProps) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [totalCaught, setTotalCaught] = useState(0);
  const { playSound, startBackgroundMusic, stopBackgroundMusic, playWinFanfare, playLoseSound } = useGameSounds();

  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : null;

  useEffect(() => {
    if (!gameStarted || !settings) return;

    const spawnInterval = setInterval(() => {
      const isHealthy = Math.random() > 0.4;
      const itemList = isHealthy ? healthyItems : unhealthyItems;
      const newItem: FallingItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * 70 + 15,
        y: 0,
        isHealthy,
        emoji: itemList[Math.floor(Math.random() * itemList.length)],
      };
      setItems(prev => [...prev, newItem]);
    }, settings.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, settings]);

  useEffect(() => {
    if (!gameStarted || !settings) return;

    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({ ...item, y: item.y + settings.fallSpeed }));
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
  }, [gameStarted, settings]);

  useEffect(() => {
    if (lives <= 0) {
      const stars = difficulty === "hard" ? 2 : 1;
      onComplete(false, stars);
    }
  }, [lives, onComplete, difficulty]);

  useEffect(() => {
    if (settings && totalCaught >= settings.winCondition) {
      playWinFanfare();
      const stars = difficulty === "hard" ? 3 : difficulty === "medium" ? 3 : 2;
      onComplete(true, stars);
    }
  }, [totalCaught, onComplete, settings, difficulty, playWinFanfare]);

  const handleItemTap = (item: FallingItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    if (item.isHealthy) {
      setScore(prev => prev + 10);
      setTotalCaught(prev => prev + 1);
      playSound("correct");
    } else {
      setLives(prev => prev - 1);
      playSound("progress"); // Gentle feedback instead of harsh lose sound
    }
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setLives(DIFFICULTY_SETTINGS[diff].lives || 3);
    setGameStarted(true);
    startBackgroundMusic("excited"); // Start exciting background music
  };

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={handleDifficultySelect} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-950">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">{t("games.score")}: {score}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg text-xs">
          <span className="font-bold text-foreground">{totalCaught}/{settings?.winCondition}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">
            {"❤️".repeat(lives)}{"🖤".repeat((settings?.lives || 3) - lives)}
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
            whileTap={{ scale: 0.7 }}
            onClick={() => handleItemTap(item)}
            className="absolute text-5xl md:text-6xl cursor-pointer transform -translate-x-1/2 -translate-y-1/2 p-2 select-none touch-manipulation"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
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
