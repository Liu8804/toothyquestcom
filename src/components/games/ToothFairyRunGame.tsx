import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface ToothFairyRunGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: "tooth" | "cavity" | "star";
  emoji: string;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, { spawnInterval: number; fallSpeed: number; targetScore: number; lives: number }> = {
  easy: { spawnInterval: 1200, fallSpeed: 2, targetScore: 10, lives: 5 },
  medium: { spawnInterval: 900, fallSpeed: 3, targetScore: 15, lives: 4 },
  hard: { spawnInterval: 600, fallSpeed: 4, targetScore: 20, lives: 3 },
};

const ToothFairyRunGame = ({ game, onComplete }: ToothFairyRunGameProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [fairyX, setFairyX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [isJumping, setIsJumping] = useState(false);
  const [fairyY, setFairyY] = useState(0);
  const itemIdRef = useRef(0);
  const { playSound } = useGameSounds();

  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : DIFFICULTY_SETTINGS.easy;

  // Spawn items
  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const spawnItem = () => {
      const types: Array<{ type: "tooth" | "cavity" | "star"; emoji: string; weight: number }> = [
        { type: "tooth", emoji: "🦷", weight: 50 },
        { type: "cavity", emoji: "🦠", weight: 35 },
        { type: "star", emoji: "⭐", weight: 15 },
      ];
      
      const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedType = types[0];
      
      for (const t of types) {
        random -= t.weight;
        if (random <= 0) {
          selectedType = t;
          break;
        }
      }

      const newItem: FallingItem = {
        id: itemIdRef.current++,
        x: Math.random() * 80 + 10,
        y: -10,
        type: selectedType.type,
        emoji: selectedType.emoji,
      };
      setItems(prev => [...prev, newItem]);
    };

    const interval = setInterval(spawnItem, settings.spawnInterval);
    return () => clearInterval(interval);
  }, [gameStarted, difficulty, settings.spawnInterval]);

  // Move items and check collisions
  useEffect(() => {
    if (!gameStarted) return;

    const moveInterval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({ ...item, y: item.y + settings.fallSpeed }));
        
        // Check collisions with fairy
        updated.forEach(item => {
          const fairyBottom = 85 - fairyY;
          const fairyTop = fairyBottom - 15;
          const itemBottom = item.y + 8;
          
          if (
            itemBottom >= fairyTop &&
            item.y <= fairyBottom &&
            Math.abs(item.x - fairyX) < 15
          ) {
            if (item.type === "tooth") {
              setScore(s => s + 1);
              playSound("success");
              item.y = 200; // Remove by moving off screen
            } else if (item.type === "star") {
              setScore(s => s + 3);
              playSound("star");
              item.y = 200;
            } else if (item.type === "cavity") {
              setLives(l => l - 1);
              playSound("lose");
              item.y = 200;
            }
          }
        });
        
        return updated.filter(item => item.y < 110);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [gameStarted, fairyX, fairyY, settings.fallSpeed, playSound]);

  // Jump mechanic
  const handleJump = useCallback(() => {
    if (isJumping) return;
    setIsJumping(true);
    playSound("tap");
    
    // Jump up
    let jumpHeight = 0;
    const jumpUp = setInterval(() => {
      jumpHeight += 4;
      setFairyY(jumpHeight);
      if (jumpHeight >= 30) {
        clearInterval(jumpUp);
        // Fall down
        const fallDown = setInterval(() => {
          jumpHeight -= 4;
          setFairyY(Math.max(0, jumpHeight));
          if (jumpHeight <= 0) {
            clearInterval(fallDown);
            setIsJumping(false);
          }
        }, 30);
      }
    }, 30);
  }, [isJumping, playSound]);

  // Move fairy with touch/mouse
  const handleMove = useCallback((clientX: number, containerWidth: number) => {
    const percentage = (clientX / containerWidth) * 100;
    setFairyX(Math.max(10, Math.min(90, percentage)));
  }, []);

  // Check win/lose
  useEffect(() => {
    if (!gameStarted) return;
    
    if (lives <= 0) {
      const stars = score >= settings.targetScore / 2 ? 1 : 0;
      onComplete(false, stars);
    } else if (score >= settings.targetScore) {
      const stars = lives >= settings.lives ? 3 : lives >= settings.lives / 2 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [lives, score, gameStarted, settings.targetScore, settings.lives, onComplete]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setLives(DIFFICULTY_SETTINGS[selectedDifficulty].lives);
    setGameStarted(true);
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700 rounded-2xl overflow-hidden touch-none select-none"
      onMouseMove={(e) => handleMove(e.clientX - e.currentTarget.getBoundingClientRect().left, e.currentTarget.clientWidth)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX - e.currentTarget.getBoundingClientRect().left, e.currentTarget.clientWidth);
      }}
      onClick={handleJump}
      onTouchStart={handleJump}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/30 text-xs"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <span className="text-white font-bold">{score}/{settings.targetScore}</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1">
          {Array.from({ length: settings.lives }).map((_, i) => (
            <span key={i} className={`text-xl ${i < lives ? "" : "opacity-30"}`}>
              {i < lives ? "💖" : "🖤"}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-0 right-0 text-center text-white/70 text-sm">
        Move to catch teeth! Tap to jump! Avoid germs! 🧚
      </div>

      {/* Falling items */}
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            className="absolute text-4xl pointer-events-none"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: item.type === "cavity" ? [0, 10, -10, 0] : 0 }}
            exit={{ scale: 0 }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-600 to-green-500 flex items-end justify-around pb-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="text-lg">🌸</span>
        ))}
      </div>

      {/* Tooth Fairy */}
      <motion.div
        className="absolute text-6xl"
        style={{ 
          left: `${fairyX}%`, 
          bottom: `${15 + fairyY}%`,
          transform: "translateX(-50%)"
        }}
        animate={{ 
          y: isJumping ? -10 : [0, -5, 0],
          rotate: isJumping ? [0, -10, 10, 0] : 0
        }}
        transition={{ 
          y: { duration: 0.5, repeat: isJumping ? 0 : Infinity },
          rotate: { duration: 0.3 }
        }}
      >
        🧚
        {/* Wings effect */}
        <motion.span
          className="absolute -left-2 -top-1 text-2xl"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          ✨
        </motion.span>
      </motion.div>
    </div>
  );
};

export default ToothFairyRunGame;
