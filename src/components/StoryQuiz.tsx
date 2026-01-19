import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, HelpCircle, ChevronRight, PartyPopper, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { StoryQuiz } from "@/data/stories";
import { useQuizSounds } from "@/hooks/useQuizSounds";
interface StoryQuizProps {
  quiz: StoryQuiz;
  quiz2?: StoryQuiz;
  onComplete: () => void;
  isCompleted: boolean;
}

const StoryQuizComponent = ({ quiz, quiz2, onComplete, isCompleted }: StoryQuizProps) => {
  const { t } = useTranslation();
  const [currentQuiz, setCurrentQuiz] = useState(0); // 0 = first quiz, 1 = second quiz
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quiz1Completed, setQuiz1Completed] = useState(false);
  const [quiz2Completed, setQuiz2Completed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const sparkleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    playCorrectSound, 
    playIncorrectSound, 
    playCelebrationSound,
    playSparkleEffect 
  } = useQuizSounds();
  const totalQuizzes = quiz2 ? 2 : 1;
  const activeQuiz = currentQuiz === 0 ? quiz : quiz2!;

  // Reset state when component mounts or quiz changes
  useEffect(() => {
    if (isCompleted) {
      setQuiz1Completed(true);
      setQuiz2Completed(true);
    }
  }, [isCompleted]);

  // Cleanup sparkle timeout on unmount
  useEffect(() => {
    return () => {
      if (sparkleTimeoutRef.current) {
        clearTimeout(sparkleTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = (index: number) => {
    if (showResult || isCompleted) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === activeQuiz.correctIndex) {
      // Play celebration sounds and show sparkles!
      playCorrectSound();
      setShowSparkles(true);
      
      // Clear sparkles after animation
      sparkleTimeoutRef.current = setTimeout(() => setShowSparkles(false), 2000);
      
      setTimeout(() => {
        if (currentQuiz === 0) {
          setQuiz1Completed(true);
          if (quiz2) {
            // Move to second question
            setSelectedAnswer(null);
            setShowResult(false);
            setShowHint(false);
            setCurrentQuiz(1);
            playSparkleEffect();
          } else {
            // Final celebration!
            setShowCelebration(true);
            playCelebrationSound();
            setTimeout(() => {
              setShowCelebration(false);
              onComplete();
            }, 1500);
          }
        } else {
          setQuiz2Completed(true);
          // Final celebration!
          setShowCelebration(true);
          playCelebrationSound();
          setTimeout(() => {
            setShowCelebration(false);
            onComplete();
          }, 1500);
        }
      }, 1500);
    } else {
      // Play incorrect sound
      playIncorrectSound();
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(true);
  };

  const isCorrect = selectedAnswer === activeQuiz.correctIndex;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/30"
      >
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-display font-bold">{t("stories.quizCompleted")}</span>
          <Sparkles className="w-4 h-4" />
          {totalQuizzes > 1 && (
            <span className="ml-auto text-sm opacity-75">({totalQuizzes}/{totalQuizzes})</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-bubble/30 to-primary/10 border-2 border-primary/20 relative overflow-hidden"
    >
      {/* Sparkle Effects */}
      <AnimatePresence>
        {showSparkles && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: "50%",
                  y: "50%"
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.08,
                  ease: "easeOut"
                }}
                className="absolute pointer-events-none z-10"
              >
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-accent/40 to-primary/40 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <PartyPopper className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-display font-bold text-white drop-shadow-lg"
              >
                🎉 AMAZING! 🎉
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question header with progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/20">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <span className="font-display font-bold text-primary text-lg">{t("stories.questQuestion")}</span>
        {totalQuizzes > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(totalQuizzes)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === 0 && quiz1Completed
                      ? "bg-accent"
                      : i === 1 && quiz2Completed
                      ? "bg-accent"
                      : i === currentQuiz
                      ? "bg-primary animate-pulse"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {currentQuiz + 1}/{totalQuizzes}
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuiz}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-lg font-medium text-foreground mb-4"
        >
          {activeQuiz.question}
        </motion.p>
      </AnimatePresence>

      {/* Answer options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuiz}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-2 mb-4"
        >
          {activeQuiz.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === activeQuiz.correctIndex;
            
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
        </motion.div>
      </AnimatePresence>

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
                  <span className="font-display font-bold text-accent">{t("stories.amazing")}</span>
                  {quiz2 && currentQuiz === 0 && (
                    <div className="ml-auto flex items-center gap-1 text-accent/80 text-sm">
                      <span>Next question</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-foreground/80 text-sm">{activeQuiz.hint}</p>
                
                {/* Parent Tip Section */}
                {activeQuiz.parentTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 pt-3 border-t border-accent/20"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">👨‍👩‍👧</span>
                      <div>
                        <span className="text-xs font-bold text-primary/80 uppercase tracking-wide">
                          Parent Tip
                        </span>
                        <p className="text-foreground/70 text-xs mt-1 leading-relaxed">
                          {activeQuiz.parentTip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
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
                      {t("stories.oopsTryAgain")}
                    </p>
                    {showHint && (
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        <span className="font-bold">{t("stories.hereIsAHint")}</span> {activeQuiz.hint}
                      </p>
                    )}
                    <Button
                      onClick={handleTryAgain}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      {t("stories.tryAgain")}
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