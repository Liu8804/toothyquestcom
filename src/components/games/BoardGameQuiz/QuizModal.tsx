import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StoryQuiz } from '@/data/stories';

interface QuizModalProps {
  quiz: StoryQuiz;
  isOpen: boolean;
  onAnswer: (isCorrect: boolean) => void;
}

export function QuizModal({ quiz, isOpen, onAnswer }: QuizModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === quiz.correctIndex;
    
    // Auto-close after showing result
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      onAnswer(isCorrect);
    }, 2000);
  };

  if (!isOpen) return null;

  const isCorrect = selectedAnswer === quiz.correctIndex;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-primary/30"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">❓</span>
            <h3 className="text-xl font-bold text-primary">Quiz Time!</h3>
          </div>

          {/* Question */}
          <p className="text-lg font-medium mb-6">{quiz.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {quiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === quiz.correctIndex;
              
              let buttonStyle = 'bg-muted hover:bg-muted/80 border-border';
              if (showResult && isSelected) {
                buttonStyle = isCorrect
                  ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300';
              } else if (showResult && isCorrectAnswer && !isCorrect) {
                buttonStyle = 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300';
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showResult}
                  variant="outline"
                  className={cn(
                    'w-full h-auto py-3 px-4 text-left justify-start rounded-xl border-2 transition-all',
                    buttonStyle
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center font-bold text-sm shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-wrap">{option}</span>
                    {showResult && isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </motion.div>
                    )}
                    {showResult && isCorrectAnswer && !isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl text-center"
              >
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-bold text-lg">🎉 Correct! +2 Stars!</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400">
                    <span className="font-bold text-lg">Not quite! Keep learning!</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
