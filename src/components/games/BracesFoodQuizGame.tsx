import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trophy, RotateCcw, Sparkles } from "lucide-react";
import BraceyMascot from "@/components/BraceyMascot";
import FloatingMicroIcons from "@/components/ui/FloatingMicroIcons";
import { gameImages } from "@/assets/games";

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  isGood: boolean;
  explanation: string;
}

const foodItems: FoodItem[] = [
  { id: "apple", name: "Apple Slices", emoji: "🍎", isGood: true, explanation: "Crunchy and healthy! Just cut into small pieces." },
  { id: "carrot", name: "Carrots", emoji: "🥕", isGood: true, explanation: "Great for teeth! Cut them into sticks." },
  { id: "caramel", name: "Caramel", emoji: "🍮", isGood: false, explanation: "Too sticky! Can pull off brackets." },
  { id: "popcorn", name: "Popcorn", emoji: "🍿", isGood: false, explanation: "Kernels can break brackets. Skip it!" },
  { id: "yogurt", name: "Yogurt", emoji: "🥛", isGood: true, explanation: "Soft and yummy! Great for braces." },
  { id: "gum", name: "Chewing Gum", emoji: "🫧", isGood: false, explanation: "Sticks to everything! Big no-no." },
  { id: "cheese", name: "Cheese", emoji: "🧀", isGood: true, explanation: "Soft and full of calcium! Perfect." },
  { id: "taffy", name: "Taffy", emoji: "🍬", isGood: false, explanation: "Super sticky! Can damage wires." },
  { id: "banana", name: "Banana", emoji: "🍌", isGood: true, explanation: "Soft and delicious! Braces love it." },
  { id: "ice", name: "Ice Cubes", emoji: "🧊", isGood: false, explanation: "Too hard! Can crack brackets." },
  { id: "pasta", name: "Pasta", emoji: "🍝", isGood: true, explanation: "Soft and easy to eat! Great choice." },
  { id: "nuts", name: "Hard Nuts", emoji: "🥜", isGood: false, explanation: "Too crunchy! Can break things." },
  { id: "smoothie", name: "Smoothie", emoji: "🥤", isGood: true, explanation: "No chewing needed! Healthy too." },
  { id: "corn", name: "Corn on Cob", emoji: "🌽", isGood: false, explanation: "Cut it off the cob first!" },
  { id: "meatball", name: "Meatballs", emoji: "🍖", isGood: true, explanation: "Soft and protein-packed! Yum." },
  { id: "hardcandy", name: "Hard Candy", emoji: "🍭", isGood: false, explanation: "Too hard and sugary. Skip it!" },
];

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG = {
  easy: { totalRounds: 5, timePerQuestion: null },
  medium: { totalRounds: 10, timePerQuestion: null },
  hard: { totalRounds: 15, timePerQuestion: 10 },
};

interface BracesFoodQuizGameProps {
  onComplete?: (score: number, total: number) => void;
  onClose?: () => void;
}

const BracesFoodQuizGame = ({ onComplete, onClose }: BracesFoodQuizGameProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameState, setGameState] = useState<"playing" | "result" | "complete">("playing");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<FoodItem[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const totalRounds = config.totalRounds;

  // Shuffle and pick items when difficulty is selected
  useEffect(() => {
    if (difficulty) {
      const shuffled = [...foodItems].sort(() => Math.random() - 0.5).slice(0, totalRounds);
      setShuffledItems(shuffled);
      if (config.timePerQuestion) {
        setTimeLeft(config.timePerQuestion);
      }
    }
  }, [difficulty, totalRounds]);

  // Timer for hard mode
  useEffect(() => {
    if (difficulty !== "hard" || gameState !== "playing" || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleAnswer(false); // Auto-wrong if time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, difficulty]);

  const currentFood = shuffledItems[currentRound];
  const progress = ((currentRound) / totalRounds) * 100;

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null || !currentFood) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentFood.isGood;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    setShowExplanation(true);
    setGameState("result");
  };

  const handleNext = () => {
    if (currentRound + 1 >= totalRounds) {
      setGameState("complete");
      onComplete?.(score, totalRounds);
    } else {
      setCurrentRound((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setGameState("playing");
      if (config.timePerQuestion) {
        setTimeLeft(config.timePerQuestion);
      }
    }
  };

  const resetGame = () => {
    setDifficulty(null);
    setCurrentRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameState("playing");
    setTimeLeft(null);
  };

  const getBraceyMood = () => {
    if (gameState === "complete") {
      return score >= totalRounds * 0.8 ? "celebrating" : score >= totalRounds * 0.5 ? "encouraging" : "thinking";
    }
    if (gameState === "result") {
      return selectedAnswer === currentFood?.isGood ? "excited" : "encouraging";
    }
    return "happy";
  };

  const getBraceyMessage = () => {
    if (gameState === "complete") {
      if (score >= totalRounds * 0.8) return `Amazing! ${score}/${totalRounds}! You're a braces food expert! 🌟`;
      if (score >= totalRounds * 0.5) return `Good job! ${score}/${totalRounds}! Keep learning! 💪`;
      return `${score}/${totalRounds}. Let's practice more! You'll get better! 🦷`;
    }
    if (gameState === "result") {
      return selectedAnswer === currentFood?.isGood 
        ? "That's right! You're so smart! ✨" 
        : "Oops! Now you know for next time! 💪";
    }
    return "Is this food good or bad for braces? 🤔";
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-6 shadow-card max-w-lg mx-auto">
        <div className="text-center py-8">
          {gameImages['braces_food_quiz'] ? (
            <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.3)] image-3d-card">
              <img src={gameImages['braces_food_quiz']} alt="Braces Food Quiz" className="w-full h-full object-cover" />
            </div>
          ) : (
            <span className="text-6xl mb-4 block">🦷</span>
          )}
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Braces Food Quiz</h3>
          <p className="text-muted-foreground mb-6">Choose your difficulty level!</p>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("easy")}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg"
            >
              🌱 Easy (5 questions)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("medium")}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg"
            >
              ⭐ Medium (10 questions)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDifficulty("hard")}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-400 to-rose-500 text-white font-bold text-lg"
            >
              🔥 Hard (15 questions + timer!)
            </motion.button>
          </div>

          {onClose && (
            <Button variant="ghost" onClick={onClose} className="mt-4">
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!currentFood && gameState !== "complete") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-6 shadow-card max-w-lg mx-auto">
      {/* Ambient floating micro-icons */}
      <FloatingMicroIcons
        icons={["🦷", "🎀", "✨", "🍎"]}
        count={3}
        speed={1.4}
        iconSize="xs"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦷</span>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Braces Food Quiz</h3>
            <p className="text-xs text-muted-foreground capitalize">{difficulty} mode</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            ✕
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Question {Math.min(currentRound + 1, totalRounds)} of {totalRounds}</span>
          <div className="flex items-center gap-3">
            {difficulty === "hard" && timeLeft !== null && gameState === "playing" && (
              <span className={`font-bold ${timeLeft <= 3 ? 'text-destructive animate-pulse' : ''}`}>
                ⏱️ {timeLeft}s
              </span>
            )}
            <span>Score: {score} ⭐</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Game content */}
      <AnimatePresence mode="wait">
        {gameState === "complete" ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            {/* Bracey celebration */}
            <div className="flex justify-center mb-6">
              <BraceyMascot mood={getBraceyMood()} size="lg" message={getBraceyMessage()} />
            </div>

            {/* Score display */}
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-3 rounded-full shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
                <span className="text-2xl font-bold text-white">{score}/{totalRounds}</span>
              </div>
            </motion.div>

            {/* Stars based on score */}
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-3xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                >
                  {score >= (i + 1) * (totalRounds / 3) ? "⭐" : "☆"}
                </motion.span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="gap-2 rounded-full">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose} className="rounded-full">
                  Done
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Bracey helper */}
            <div className="flex justify-center mb-4">
              <BraceyMascot 
                mood={getBraceyMood()} 
                size="sm" 
                message={getBraceyMessage()}
                showMessage={true}
              />
            </div>

            {/* Food card */}
            <motion.div
              className={`relative bg-white rounded-2xl p-8 shadow-lg mb-6 text-center ${
                showExplanation
                  ? selectedAnswer === currentFood.isGood
                    ? "ring-4 ring-green-400"
                    : "ring-4 ring-red-400"
                  : ""
              }`}
              animate={showExplanation ? { scale: [1, 1.02, 1] } : {}}
            >
              {/* Food emoji */}
              <motion.div
                className="text-7xl mb-4"
                animate={!showExplanation ? { rotate: [0, 3, -3, 0], y: [0, -4, 0] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {currentFood.emoji}
              </motion.div>

              {/* Food name */}
              <h4 className="text-2xl font-bold text-foreground mb-2">{currentFood.name}</h4>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      currentFood.isGood 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {currentFood.isGood ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {currentFood.isGood ? "Good for braces!" : "Bad for braces!"}
                      </span>
                    </div>
                    <p className="mt-3 text-muted-foreground">{currentFood.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result indicator overlay */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      selectedAnswer === currentFood.isGood
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedAnswer === currentFood.isGood ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <X className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Answer buttons or Next button */}
            {!showExplanation ? (
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="w-full h-16 text-lg gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl"
                  >
                    <Check className="w-6 h-6" />
                    Good! 👍
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => handleAnswer(false)}
                    className="w-full h-16 text-lg gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                    Bad! 👎
                  </Button>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button
                  onClick={handleNext}
                  className="gap-2 px-8 py-6 text-lg rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {currentRound + 1 >= totalRounds ? (
                    <>
                      <Trophy className="w-5 h-5" />
                      See Results!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Next Food!
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-3 -left-3 text-2xl"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        🦷
      </motion.div>
      <motion.div
        className="absolute -bottom-3 -right-3 text-2xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✨
      </motion.div>
    </div>
  );
};

export default BracesFoodQuizGame;
