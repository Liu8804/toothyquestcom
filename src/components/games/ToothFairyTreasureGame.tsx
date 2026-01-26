import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface ToothFairyTreasureGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Chest {
  id: number;
  x: number;
  y: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface Challenge {
  question: string;
  answer: boolean;
}

const challenges: Challenge[] = [
  { question: "Brushing teeth twice a day keeps cavities away!", answer: true },
  { question: "Candy is good for your teeth.", answer: false },
  { question: "Flossing helps clean between teeth.", answer: true },
  { question: "You should visit the dentist every 6 months.", answer: true },
  { question: "Soda is healthy for teeth.", answer: false },
  { question: "Fluoride makes teeth stronger.", answer: true },
  { question: "You only need to brush for 10 seconds.", answer: false },
  { question: "Cheese is good for your teeth.", answer: true },
];

const DIFFICULTY_CONFIG = {
  easy: { chestCount: 4, treasureCount: 3, timeLimit: 60 },
  medium: { chestCount: 6, treasureCount: 4, timeLimit: 50 },
  hard: { chestCount: 8, treasureCount: 5, timeLimit: 45 },
};

const ToothFairyTreasureGame = ({ game, onComplete }: ToothFairyTreasureGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [chests, setChests] = useState<Chest[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [selectedChest, setSelectedChest] = useState<number | null>(null);
  const [treasureFound, setTreasureFound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const { playSound, startBackgroundMusic, stopBackgroundMusic, playWinFanfare } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const initializeChests = (chestCount: number, treasureCount: number) => {
    const newChests: Chest[] = [];
    const treasureIndices = new Set<number>();
    
    while (treasureIndices.size < treasureCount) {
      treasureIndices.add(Math.floor(Math.random() * chestCount));
    }

    for (let i = 0; i < chestCount; i++) {
      newChests.push({
        id: i,
        x: (i % 4) * 25 + 12.5,
        y: Math.floor(i / 4) * 35 + 30,
        isOpen: false,
        hasTreasure: treasureIndices.has(i),
      });
    }
    setChests(newChests);
  };

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(treasureFound >= config.treasureCount, treasureFound >= config.treasureCount ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, treasureFound, config.treasureCount, onComplete, difficulty]);

  useEffect(() => {
    if (treasureFound >= config.treasureCount && gameStarted) {
      const stars = timeLeft > 30 ? 3 : timeLeft > 15 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [treasureFound, config.treasureCount, timeLeft, onComplete, gameStarted]);

  const handleChestClick = (chestId: number) => {
    const chest = chests.find(c => c.id === chestId);
    if (!chest || chest.isOpen) return;

    setSelectedChest(chestId);
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
  };

  const handleAnswer = (answer: boolean) => {
    if (!currentChallenge || selectedChest === null) return;

    const isCorrect = answer === currentChallenge.answer;
    const chest = chests.find(c => c.id === selectedChest);

    if (isCorrect) {
      playSound("correct");
      setChests(prev => prev.map(c => 
        c.id === selectedChest ? { ...c, isOpen: true } : c
      ));
      if (chest?.hasTreasure) {
        setTreasureFound(prev => prev + 1);
        playWinFanfare();
      }
    } else {
      playSound("lose");
    }

    setCurrentChallenge(null);
    setSelectedChest(null);
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    setTimeLeft(cfg.timeLimit);
    initializeChests(cfg.chestCount, cfg.treasureCount);
    setGameStarted(true);
    startBackgroundMusic("adventure");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-yellow-100 to-amber-200 dark:from-yellow-900 dark:to-amber-950 p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">💰 {treasureFound}/{config.treasureCount}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 15 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      {/* Challenge modal */}
      <AnimatePresence>
        {currentChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-card p-6 rounded-2xl max-w-sm text-center"
            >
              <div className="text-4xl mb-4">🧚</div>
              <p className="text-lg font-medium mb-6">{currentChallenge.question}</p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold"
                >
                  ✓ True
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(false)}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold"
                >
                  ✗ False
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chests */}
      <div className="flex flex-wrap justify-center items-center h-full pt-16 gap-4">
        {chests.map(chest => (
          <motion.button
            key={chest.id}
            whileHover={{ scale: chest.isOpen ? 1 : 1.1 }}
            whileTap={{ scale: chest.isOpen ? 1 : 0.9 }}
            onClick={() => handleChestClick(chest.id)}
            disabled={chest.isOpen}
            className="text-5xl"
          >
            {chest.isOpen ? (chest.hasTreasure ? '💎' : '📭') : '📦'}
          </motion.button>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground">Tap chests and answer to find treasures!</p>
      </div>
    </div>
  );
};

export default ToothFairyTreasureGame;
