import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import { Button } from "@/components/ui/button";

interface HealthyFoodSortGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface FoodItem {
  id: string;
  emoji: string;
  name: string;
  isHealthy: boolean;
}

const ALL_FOODS: FoodItem[] = [
  // Healthy foods
  { id: "apple", emoji: "🍎", name: "Apple", isHealthy: true },
  { id: "carrot", emoji: "🥕", name: "Carrot", isHealthy: true },
  { id: "cheese", emoji: "🧀", name: "Cheese", isHealthy: true },
  { id: "milk", emoji: "🥛", name: "Milk", isHealthy: true },
  { id: "broccoli", emoji: "🥦", name: "Broccoli", isHealthy: true },
  { id: "water", emoji: "💧", name: "Water", isHealthy: true },
  { id: "nuts", emoji: "🥜", name: "Nuts", isHealthy: true },
  { id: "celery", emoji: "🥬", name: "Celery", isHealthy: true },
  { id: "strawberry", emoji: "🍓", name: "Strawberry", isHealthy: true },
  { id: "egg", emoji: "🥚", name: "Egg", isHealthy: true },
  
  // Unhealthy foods (for teeth)
  { id: "candy", emoji: "🍬", name: "Candy", isHealthy: false },
  { id: "soda", emoji: "🥤", name: "Soda", isHealthy: false },
  { id: "lollipop", emoji: "🍭", name: "Lollipop", isHealthy: false },
  { id: "cookie", emoji: "🍪", name: "Cookie", isHealthy: false },
  { id: "cake", emoji: "🎂", name: "Cake", isHealthy: false },
  { id: "icecream", emoji: "🍦", name: "Ice Cream", isHealthy: false },
  { id: "donut", emoji: "🍩", name: "Donut", isHealthy: false },
  { id: "chocolate", emoji: "🍫", name: "Chocolate", isHealthy: false },
  { id: "gummy", emoji: "🐻", name: "Gummy Bear", isHealthy: false },
  { id: "juice", emoji: "🧃", name: "Juice Box", isHealthy: false },
];

const DIFFICULTY_SETTINGS: Record<Difficulty, { totalRounds: number; timeLimit: number | null }> = {
  easy: { totalRounds: 8, timeLimit: null },
  medium: { totalRounds: 12, timeLimit: 60 },
  hard: { totalRounds: 16, timeLimit: 45 },
};

const HealthyFoodSortGame = ({ game, onComplete }: HealthyFoodSortGameProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const { playSound } = useGameSounds();

  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : DIFFICULTY_SETTINGS.easy;
  const currentFood = foods[currentIndex];
  const progress = currentIndex / settings.totalRounds;

  // Initialize game
  useEffect(() => {
    if (gameStarted && difficulty) {
      // Shuffle and pick foods
      const shuffled = [...ALL_FOODS].sort(() => Math.random() - 0.5);
      setFoods(shuffled.slice(0, settings.totalRounds));
      setTimeLeft(settings.timeLimit);
    }
  }, [gameStarted, difficulty, settings.totalRounds, settings.timeLimit]);

  // Timer
  useEffect(() => {
    if (!gameStarted || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t === null) return null;
        if (t <= 1) {
          // Time's up - end game
          const stars = score >= settings.totalRounds * 0.7 ? 3 : score >= settings.totalRounds * 0.5 ? 2 : 1;
          onComplete(score >= settings.totalRounds * 0.5, stars);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, score, settings.totalRounds, onComplete]);

  const handleSort = useCallback((sortedAsHealthy: boolean) => {
    if (!currentFood || feedback) return;

    const isCorrect = currentFood.isHealthy === sortedAsHealthy;
    
    if (isCorrect) {
      setScore(s => s + 1);
      playSound("success");
      setFeedback("correct");
    } else {
      playSound("lose");
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      setDragPosition({ x: 0, y: 0 });
      
      if (currentIndex + 1 >= settings.totalRounds) {
        // Game complete
        const finalScore = isCorrect ? score + 1 : score;
        const stars = finalScore >= settings.totalRounds * 0.9 ? 3 : finalScore >= settings.totalRounds * 0.7 ? 2 : 1;
        onComplete(finalScore >= settings.totalRounds * 0.5, stars);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 800);
  }, [currentFood, currentIndex, feedback, score, settings.totalRounds, playSound, onComplete]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      // Dragged right - healthy
      handleSort(true);
    } else if (info.offset.x < -threshold) {
      // Dragged left - unhealthy
      handleSort(false);
    } else {
      // Reset position
      setDragPosition({ x: 0, y: 0 });
    }
  }, [handleSort]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  if (!gameStarted || !currentFood) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold mb-2">{game.name}</h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <Button onClick={() => setGameStarted(true)} size="lg">
          Start Sorting!
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-900 dark:to-green-900 rounded-2xl overflow-hidden">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="font-bold text-foreground">Score: {score}/{settings.totalRounds}</span>
        </div>
        {timeLeft !== null && (
          <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 ${timeLeft <= 10 ? "animate-pulse text-red-500" : ""}`}>
            <span className="font-bold">⏱️ {timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute top-16 left-4 right-4">
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Sorting zones */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
        {/* Unhealthy zone */}
        <motion.div
          className={`w-32 h-32 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-colors ${
            dragPosition.x < -40 ? "bg-red-200 border-red-500" : "bg-red-100/50 border-red-300"
          }`}
          animate={{ scale: dragPosition.x < -40 ? 1.1 : 1 }}
        >
          <span className="text-4xl">😢</span>
          <span className="text-sm font-bold text-red-600 mt-1">Bad for Teeth</span>
        </motion.div>

        {/* Healthy zone */}
        <motion.div
          className={`w-32 h-32 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-colors ${
            dragPosition.x > 40 ? "bg-green-200 border-green-500" : "bg-green-100/50 border-green-300"
          }`}
          animate={{ scale: dragPosition.x > 40 ? 1.1 : 1 }}
        >
          <span className="text-4xl">😁</span>
          <span className="text-sm font-bold text-green-600 mt-1">Good for Teeth</span>
        </motion.div>
      </div>

      {/* Current food card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFood.id}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDrag={(_, info) => setDragPosition({ x: info.offset.x, y: info.offset.y })}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ 
              scale: 1, 
              rotate: dragPosition.x * 0.1,
              x: dragPosition.x,
              y: dragPosition.y,
            }}
            exit={{ 
              scale: 0, 
              x: feedback === "correct" ? (currentFood.isHealthy ? 200 : -200) : 0,
              rotate: feedback === "correct" ? 20 : -20
            }}
            className={`relative w-48 h-64 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none ${
              feedback === "correct" ? "ring-4 ring-green-500" : feedback === "wrong" ? "ring-4 ring-red-500" : ""
            }`}
            style={{ touchAction: "none" }}
          >
            <span className="text-8xl mb-4">{currentFood.emoji}</span>
            <span className="text-xl font-bold text-foreground">{currentFood.name}</span>
            
            {feedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-4 -right-4 text-5xl ${
                  feedback === "correct" ? "" : ""
                }`}
              >
                {feedback === "correct" ? "✅" : "❌"}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          👈 Drag left for BAD foods | Drag right for GOOD foods 👉
        </p>
      </div>

      {/* Quick sort buttons for accessibility */}
      <div className="absolute bottom-40 left-4 right-4 flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSort(false)}
          className="bg-red-100 hover:bg-red-200 border-red-300"
          disabled={!!feedback}
        >
          👎 Bad
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSort(true)}
          className="bg-green-100 hover:bg-green-200 border-green-300"
          disabled={!!feedback}
        >
          👍 Good
        </Button>
      </div>
    </div>
  );
};

export default HealthyFoodSortGame;
