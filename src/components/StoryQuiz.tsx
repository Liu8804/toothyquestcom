import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { StoryQuiz } from "@/data/stories";

interface StoryQuizProps {
  quiz: StoryQuiz;
  onComplete: () => void;
  isCompleted: boolean;
}

const StoryQuizComponent = ({ quiz, onComplete, isCompleted }: StoryQuizProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult || isCompleted) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === quiz.correctIndex) {
      // Correct answer - show success briefly then complete
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(true);
  };

  const isCorrect = selectedAnswer === quiz.correctIndex;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/30"
      >
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-display font-bold">Quiz Completed!</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-bubble/30 to-primary/10 border-2 border-primary/20"
    >
      {/* Question header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/20">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <span className="font-display font-bold text-primary text-lg">Quest Question</span>
      </div>

      {/* Question */}
      <p className="text-lg font-medium text-foreground mb-4">
        {quiz.question}
      </p>

      {/* Answer options */}
      <div className="space-y-2 mb-4">
        {quiz.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === quiz.correctIndex;
          
          let buttonStyle = "bg-card hover:bg-muted border-border";
          if (showResult && isSelected) {
            buttonStyle = isCorrect 
              ? "bg-accent/20 border-accent text-accent" 
              : "bg-destructive/20 border-destructive text-destructive";
          } else if (showResult && isCorrectAnswer && !isCorrect) {
            buttonStyle = "bg-accent/20 border-accent text-accent";
          }

          return (
            <motion.button
              key={index}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-3 rounded-xl border-2 text-left font-medium transition-all ${buttonStyle} ${
                showResult ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive" />
                    )}
                  </motion.div>
                )}
                {showResult && isCorrectAnswer && !isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {isCorrect ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-xl bg-accent/20 border border-accent/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-accent">Amazing! 🎉</span>
                </div>
                <p className="text-foreground/80 text-sm">{quiz.hint}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-display font-bold text-amber-800 dark:text-amber-200 mb-1">
                      Oops! Let's try again! 💪
                    </p>
                    {showHint && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        <span className="font-bold">Hint:</span> {quiz.hint}
                      </p>
                    )}
                    <Button
                      onClick={handleTryAgain}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryQuizComponent;
