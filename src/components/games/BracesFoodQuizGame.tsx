import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, Trophy, RotateCcw, Sparkles } from "lucide-react";
import BraceyMascot from "@/components/BraceyMascot";

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

interface BracesFoodQuizGameProps {
  onComplete?: (score: number, total: number) => void;
  onClose?: () => void;
}

const BracesFoodQuizGame = ({ onComplete, onClose }: BracesFoodQuizGameProps) => {
  const [gameState, setGameState] = useState<"playing" | "result" | "complete">("playing");
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<FoodItem[]>([]);
  const totalRounds = 10;

  // Shuffle and pick items on mount
  useEffect(() => {
    const shuffled = [...foodItems].sort(() => Math.random() - 0.5).slice(0, totalRounds);
    setShuffledItems(shuffled);
  }, []);

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
    }
  };

  const resetGame = () => {
    const shuffled = [...foodItems].sort(() => Math.random() - 0.5).slice(0, totalRounds);
    setShuffledItems(shuffled);
    setCurrentRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameState("playing");
  };

  const getBraceyMood = () => {
    if (gameState === "complete") {
      return score >= 8 ? "celebrating" : score >= 5 ? "encouraging" : "thinking";
    }
    if (gameState === "result") {
      return selectedAnswer === currentFood?.isGood ? "excited" : "encouraging";
    }
    return "happy";
  };

  const getBraceyMessage = () => {
    if (gameState === "complete") {
      if (score >= 8) return `Amazing! ${score}/${totalRounds}! You're a braces food expert! 🌟`;
      if (score >= 5) return `Good job! ${score}/${totalRounds}! Keep learning! 💪`;
      return `${score}/${totalRounds}. Let's practice more! You'll get better! 🦷`;
    }
    if (gameState === "result") {
      return selectedAnswer === currentFood?.isGood 
        ? "That's right! You're so smart! ✨" 
        : "Oops! Now you know for next time! 💪";
    }
    return "Is this food good or bad for braces? 🤔";
  };

  if (!currentFood && gameState !== "complete") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-6 shadow-card max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦷</span>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Braces Food Quiz</h3>
            <p className="text-xs text-muted-foreground">Can you eat this with braces?</p>
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
          <span>Score: {score} ⭐</span>
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
                  {score >= (i + 1) * 3 ? "⭐" : "☆"}
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
                animate={!showExplanation ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
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
