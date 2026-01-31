import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Sparkles, HelpCircle, ChevronRight, Star, Zap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { StoryQuiz } from "@/data/stories";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { QuizCharacterAnimated, getCharacterForStory, CHARACTERS, CHARACTER_DIALOGUES, type CharacterMood, type CharacterId } from "./QuizCharacters";
import QuizCertificate from "./QuizCertificate";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";
import { useMascotEmotionContext } from "@/contexts/MascotEmotionContext";

interface InteractiveQuizWrapperProps {
  quiz: StoryQuiz;
  quiz2?: StoryQuiz;
  onComplete: () => void;
  isCompleted: boolean;
  storyId?: string; // Used to determine which character appears
  childName?: string;
}

// Helper to get character-specific random message
const getRandomMessage = (
  type: "intro" | "thinking" | "correct" | "incorrect" | "hint" | "celebrate" | "nextQuestion",
  characterId: CharacterId
): string => {
  const dialogues = CHARACTER_DIALOGUES[characterId];
  const messages = dialogues[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const InteractiveQuizWrapper = ({
  quiz,
  quiz2,
  onComplete,
  isCompleted,
  storyId = "",
  childName = "Champion",
}: InteractiveQuizWrapperProps) => {
  // Determine which character to use based on story theme
  const characterId = getCharacterForStory(storyId);
  const character = CHARACTERS[characterId];
  const { t } = useTranslation();
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quiz1Completed, setQuiz1Completed] = useState(false);
  const [quiz2Completed, setQuiz2Completed] = useState(false);
  const [characterMood, setCharacterMood] = useState<CharacterMood>("waving");
  const [characterMessage, setCharacterMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [starsEarned, setStarsEarned] = useState(3);

  // Mascot emotion context for reactive feedback
  const { triggerSuccess, triggerWow, triggerError, triggerGotIt } = useMascotEmotionContext();

  const {
    playCorrectSound,
    playIncorrectSound,
    playCelebrationSound,
    playSparkleEffect,
    playSynthSound,
  } = useQuizSounds();

  const totalQuizzes = quiz2 ? 2 : 1;
  const activeQuiz = currentQuiz === 0 ? quiz : quiz2!;

  // Initialize with intro message
  useEffect(() => {
    if (!isCompleted) {
      setCharacterMood("waving");
      setCharacterMessage(getRandomMessage("intro", characterId));
      const timer = setTimeout(() => {
        setCharacterMood("idle");
        setCharacterMessage(getRandomMessage("thinking", characterId));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, characterId]);

  useEffect(() => {
    if (isCompleted) {
      setQuiz1Completed(true);
      setQuiz2Completed(true);
    }
  }, [isCompleted]);

  const handleAnswer = useCallback((index: number) => {
    if (showResult || isCompleted) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    playSynthSound("pop");

    const isCorrect = index === activeQuiz.correctIndex;

    if (isCorrect) {
      playCorrectSound();
      setCharacterMood("celebrating");
      setCharacterMessage(getRandomMessage("correct", characterId));
      setStreak(prev => prev + 1);
      // Trigger success mascot emotion
      triggerSuccess();

      // Show streak bonus for consecutive correct answers
      if (streak > 0) {
        setShowStreakBonus(true);
        setTimeout(() => setShowStreakBonus(false), 2000);
      }

      setTimeout(() => {
        if (currentQuiz === 0) {
          setQuiz1Completed(true);
          if (quiz2) {
            // Move to second question
            setSelectedAnswer(null);
            setShowResult(false);
            setShowHint(false);
            setCurrentQuiz(1);
            setCharacterMood("excited");
            setCharacterMessage(getRandomMessage("nextQuestion", characterId));
            playSparkleEffect();
          } else {
            // Final celebration with confetti and certificate!
            setShowCelebration(true);
            setShowConfetti(true);
            setCharacterMood("dancing");
            setCharacterMessage(getRandomMessage("celebrate", characterId));
            playCelebrationSound();
            // Trigger wow for quiz completion
            triggerWow();
            setTimeout(() => {
              setShowCelebration(false);
              setShowConfetti(false);
              setShowCertificate(true);
            }, 2500);
          }
        } else {
          setQuiz2Completed(true);
          setShowCelebration(true);
          setShowConfetti(true);
          setCharacterMood("dancing");
          setCharacterMessage(getRandomMessage("celebrate", characterId));
          playCelebrationSound();
          // Trigger wow for quiz completion
          triggerWow();
          setTimeout(() => {
            setShowCelebration(false);
            setShowConfetti(false);
            setShowCertificate(true);
          }, 2500);
        }
      }, 2000);
    } else {
      playIncorrectSound();
      setCharacterMood("encouraging");
      setCharacterMessage(getRandomMessage("incorrect", characterId));
      setStreak(0);
      // Trigger oops mascot emotion for wrong answers
      triggerError();
    }
  }, [
    showResult, isCompleted, activeQuiz.correctIndex, currentQuiz, quiz2,
    playCorrectSound, playIncorrectSound, playCelebrationSound, playSparkleEffect,
    playSynthSound, streak, onComplete
  ]);

  const handleTryAgain = useCallback(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(true);
    setCharacterMood("thinking");
    setCharacterMessage(getRandomMessage("hint", characterId));
    playSynthSound("whoosh");
    // Trigger gotIt for understanding
    triggerGotIt();
  }, [playSynthSound, characterId, triggerGotIt]);

  const isCorrect = selectedAnswer === activeQuiz.correctIndex;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/30"
      >
        <div className="flex items-center gap-3">
          <QuizCharacterAnimated characterId={characterId} mood="celebrating" size="sm" showSpeechBubble={false} />
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-display font-bold">{t("stories.quizCompleted")}</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    );
  }

  const handleCertificateClose = () => {
    setShowCertificate(false);
    onComplete();
  };

  return (
    <>
      {/* Confetti Celebration */}
      <ConfettiCelebration isActive={showConfetti} />
      
      {/* Quiz Certificate */}
      <QuizCertificate
        isOpen={showCertificate}
        onClose={handleCertificateClose}
        childName={childName}
        quizTitle={quiz.question.substring(0, 50) + "..."}
        starsEarned={starsEarned}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-bubble/30 to-primary/10 border-2 border-primary/20 relative overflow-hidden"
      >
        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-br from-accent/50 to-primary/50 backdrop-blur-sm"
            >
              <motion.div className="flex flex-col items-center gap-4">
                <QuizCharacterAnimated characterId={characterId} mood="dancing" size="lg" showSpeechBubble={false} enableVoice={false} />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-center"
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-3xl font-display font-bold text-white drop-shadow-lg"
                  >
                    🎉 {t("games.victory") || "SUPER STAR!"} 🎉
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Streak Bonus Popup */}
      <AnimatePresence>
        {showStreakBonus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-yellow-400 rounded-full shadow-lg"
          >
            <Zap className="w-4 h-4 text-yellow-800" />
            <span className="font-bold text-yellow-800 text-sm">
              {streak}x Streak! 🔥
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Section */}
      <div className="p-4 flex justify-center border-b border-primary/10 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
        <QuizCharacterAnimated
          characterId={characterId}
          mood={characterMood}
          message={characterMessage}
          size="md"
          enableVoice={true}
        />
      </div>

      {/* Quiz Content */}
      <div className="p-5">
        {/* Question header with progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-primary/20">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-primary text-lg">
            {t("stories.questQuestion")}
          </span>
          {totalQuizzes > 1 && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(totalQuizzes)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i === currentQuiz ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === 0 && quiz1Completed ? "bg-accent" :
                      i === 1 && quiz2Completed ? "bg-accent" :
                      i === currentQuiz ? "bg-primary" : "bg-muted"
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

        {/* Answer options with enhanced styling */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuiz}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 mb-4"
          >
            {activeQuiz.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === activeQuiz.correctIndex;

              let buttonStyle = "bg-card hover:bg-muted border-border hover:border-primary/50 hover:shadow-md";
              if (showResult && isSelected) {
                buttonStyle = isCorrect
                  ? "bg-accent/20 border-accent text-accent shadow-lg shadow-accent/20"
                  : "bg-destructive/20 border-destructive text-destructive";
              } else if (showResult && isCorrectAnswer && !isCorrect) {
                buttonStyle = "bg-accent/20 border-accent text-accent";
              }

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={!showResult ? { scale: 1.02, x: 5 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${buttonStyle} ${
                    showResult ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={isSelected && isCorrect ? { 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                        isSelected && showResult
                          ? isCorrect ? "bg-accent text-white" : "bg-destructive text-white"
                          : "bg-muted"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </motion.span>
                    <span className="flex-1">{option}</span>
                    {showResult && isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
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
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: 3, duration: 0.3 }}
                    >
                      <Sparkles className="w-5 h-5 text-accent" />
                    </motion.div>
                    <span className="font-display font-bold text-accent">
                      {t("stories.amazing")}
                    </span>
                    {quiz2 && currentQuiz === 0 && (
                      <div className="ml-auto flex items-center gap-1 text-accent/80 text-sm">
                        <span>Next question</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-foreground/80 text-sm">{activeQuiz.hint}</p>

                  {/* Bonus Stars */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Parent Tip */}
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-amber-700 dark:text-amber-300 mb-3"
                        >
                          <span className="font-bold">{t("stories.hereIsAHint")}</span>{" "}
                          {activeQuiz.hint}
                        </motion.p>
                      )}
                      <Button
                        onClick={handleTryAgain}
                        size="sm"
                        className="rounded-full bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        ✨ {t("stories.tryAgain")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};

export default InteractiveQuizWrapper;
