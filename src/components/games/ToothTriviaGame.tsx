import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface ToothTriviaGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const triviaQuestions: Question[] = [
  { question: "How many times a day should you brush your teeth?", options: ["Once", "Twice", "Three times", "Never"], correctIndex: 1 },
  { question: "What helps make teeth strong?", options: ["Candy", "Fluoride", "Soda", "Chips"], correctIndex: 1 },
  { question: "How long should you brush your teeth?", options: ["10 seconds", "30 seconds", "2 minutes", "10 minutes"], correctIndex: 2 },
  { question: "What is the outer layer of teeth called?", options: ["Dentin", "Enamel", "Pulp", "Root"], correctIndex: 1 },
  { question: "Which food is good for your teeth?", options: ["Candy", "Cheese", "Soda", "Ice cream"], correctIndex: 1 },
  { question: "What should you do after eating sweets?", options: ["Sleep", "Rinse your mouth", "Eat more", "Nothing"], correctIndex: 1 },
  { question: "How often should you visit the dentist?", options: ["Every week", "Once a year", "Every 6 months", "Never"], correctIndex: 2 },
  { question: "What removes food between teeth?", options: ["Toothbrush", "Floss", "Water only", "Gum"], correctIndex: 1 },
  { question: "What helps keep breath fresh?", options: ["Onions", "Mouthwash", "Garlic", "Coffee"], correctIndex: 1 },
  { question: "What color are healthy gums?", options: ["White", "Red", "Pink", "Blue"], correctIndex: 2 },
];

const DIFFICULTY_CONFIG = {
  easy: { questionCount: 5, timePerQuestion: 20 },
  medium: { questionCount: 7, timePerQuestion: 15 },
  hard: { questionCount: 10, timePerQuestion: 10 },
};

const ToothTriviaGame = ({ game, onComplete }: ToothTriviaGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const { playSound, startBackgroundMusic, stopBackgroundMusic, playWinFanfare } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1); // Time's up
          return config.timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, currentQuestionIndex, difficulty]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound("correct");
    } else {
      // Gentle "try again" - no harsh sounds
      playSound("progress");
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 >= questions.length) {
        const finalScore = isCorrect ? score + 1 : score;
        const percentage = finalScore / questions.length;
        const stars = percentage >= 0.9 ? 3 : percentage >= 0.7 ? 2 : percentage >= 0.5 ? 1 : 0;
        onComplete(percentage >= 0.5, stars);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(config.timePerQuestion);
      }
    }, 1500);
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const cfg = DIFFICULTY_CONFIG[selectedDifficulty];
    const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, cfg.questionCount);
    setQuestions(shuffled);
    setTimeLeft(cfg.timePerQuestion);
    setGameStarted(true);
    startBackgroundMusic("puzzle");
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-950 p-6">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">❓ {currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">⭐ {score}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full pt-12">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            {currentQuestion.question}
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-xl text-lg font-medium transition-all ${
                showResult
                  ? index === currentQuestion.correctIndex
                    ? 'bg-green-500 text-white'
                    : selectedAnswer === index
                    ? 'bg-red-500 text-white'
                    : 'bg-card text-foreground opacity-50'
                  : 'bg-card text-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToothTriviaGame;
