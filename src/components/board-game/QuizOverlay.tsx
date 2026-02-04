import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuizQuestion } from './types';
import { cn } from '@/lib/utils';

interface QuizOverlayProps {
  quiz: QuizQuestion;
  onAnswer: (selectedIndex: number) => void;
}

export function QuizOverlay({ quiz, onAnswer }: QuizOverlayProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    
    setShowResult(true);
    
    // Delay before closing to show result
    setTimeout(() => {
      onAnswer(selectedIndex);
    }, 1500);
  };

  const isCorrect = selectedIndex === quiz.correctAnswer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-primary/30 animate-in zoom-in-95 duration-300">
        {/* Quiz icon */}
        <div className="text-center mb-4">
          <span className="text-5xl">❓</span>
        </div>

        {/* Question */}
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-foreground">
          {quiz.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {quiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={cn(
                'w-full p-4 rounded-xl border-3 text-left font-medium transition-all',
                'hover:scale-[1.02] active:scale-[0.98]',
                selectedIndex === index
                  ? showResult
                    ? isCorrect && index === quiz.correctAnswer
                      ? 'bg-green-100 dark:bg-green-900/50 border-green-500'
                      : index === selectedIndex && !isCorrect
                        ? 'bg-red-100 dark:bg-red-900/50 border-red-500'
                        : 'bg-muted border-muted-foreground/30'
                    : 'bg-primary/20 border-primary'
                  : showResult && index === quiz.correctAnswer
                    ? 'bg-green-100 dark:bg-green-900/50 border-green-500'
                    : 'bg-muted/50 border-muted-foreground/20 hover:border-primary/50'
              )}
            >
              <span className="mr-2">{['A', 'B', 'C', 'D'][index]}.</span>
              {option}
            </button>
          ))}
        </div>

        {/* Result message */}
        {showResult && (
          <div className={cn(
            'text-center p-4 rounded-xl mb-4',
            isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
          )}>
            <span className="text-3xl mb-2 block">{isCorrect ? '🎉' : '😊'}</span>
            <p className="font-bold">{isCorrect ? 'Correct! +2 Stars!' : 'Nice try!'}</p>
            {quiz.explanation && (
              <p className="text-sm text-muted-foreground mt-1">{quiz.explanation}</p>
            )}
          </div>
        )}

        {/* Submit button */}
        {!showResult && (
          <Button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="w-full rounded-full py-6 text-lg font-bold"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
}
