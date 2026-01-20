import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Heart, Volume2, VolumeX, Loader2, Pause, Play, MessageCircle, Trophy, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useSoundEffects, SOUND_PROMPTS } from "@/hooks/useSoundEffects";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useAuth } from "@/hooks/useAuth";
import { useQuestVoice } from "@/hooks/useQuestVoice";
import { useEffect, useState } from "react";
import type { Story } from "@/data/stories";
import toothyMascot from "@/assets/toothy-mascot.png";
import QuestCompleteCelebration from "./QuestCompleteCelebration";
import ConfettiCelebration from "./ConfettiCelebration";
import DailyChallengeNotification from "./DailyChallengeNotification";
import VoiceSettingsModal from "./VoiceSettingsModal";
import InteractiveQuizWrapper from "./quiz/InteractiveQuizWrapper";
import BracesQuestEffect, { BracesQuestReward, isBracesQuest, getBracesQuestConfig } from "./BracesQuestEffects";
interface StoryViewerProps {
  story: Story;
  currentIndex: number;
  totalStories: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer = ({
  story,
  currentIndex,
  totalStories,
  onClose,
  onNext,
  onPrevious,
}: StoryViewerProps) => {
  const { isPlaying, isLoading, isPaused, error, play, pause, resume, stop } = useStoryNarration();
  const { user } = useAuth();
  const { completeQuest, isQuestCompleted, selectedChild } = useQuestProgress();
  const { playSound } = useSoundEffects();
  const { incrementProgress } = useDailyChallenges(selectedChild?.id);
  const { speakIntro, speakEnding, stop: stopQuestVoice } = useQuestVoice();
  const [showIntro, setShowIntro] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ xp: number; badges: any[] }>({ xp: 10, badges: [] });
  const [isCompleting, setIsCompleting] = useState(false);
  const [challengeNotification, setChallengeNotification] = useState<{
    show: boolean;
    title: string;
    xp: number;
  } | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showBracesEffect, setShowBracesEffect] = useState(false);
  const [showBracesReward, setShowBracesReward] = useState(false);
  const questCompleted = isQuestCompleted(story.id);

  // Reset intro and quiz when story changes and speak intro
  useEffect(() => {
    setShowIntro(true);
    setQuizCompleted(questCompleted); // If already completed, mark quiz as done
    // Speak the intro when story loads
    speakIntro(story.toothyIntro);
  }, [story.id, story.toothyIntro, speakIntro, questCompleted]);

  // Stop narration when story changes or modal closes
  useEffect(() => {
    return () => {
      stop();
      stopQuestVoice();
    };
  }, [story.id, stop]);

  const handlePlayNarration = () => {
    const fullText = `${story.title}. ${story.story} What we learned: ${story.lesson}`;
    play(fullText);
  };

  const handleToggleNarration = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      handlePlayNarration();
    }
  };

  const handleStartStory = async () => {
    stopQuestVoice(); // Stop intro voice
    setShowIntro(false);
    // Play story start sound
    playSound(SOUND_PROMPTS.storyStart, 2);
    
    // Trigger braces quest effect if applicable
    if (isBracesQuest(story.id)) {
      setShowBracesEffect(true);
      setTimeout(() => setShowBracesEffect(false), 4000);
    }
  };
  const handleCompleteQuest = async () => {
    if (!user || !selectedChild || questCompleted || isCompleting) return;
    
    setIsCompleting(true);
    const result = await completeQuest(story.id, 10);
    setIsCompleting(false);
    
    if (result.success) {
      setCelebrationData({ xp: 10, badges: result.newBadges });
      setShowCelebration(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // Play completion sound
      playSound(SOUND_PROMPTS.questComplete, 3);
      // Speak quest ending
      speakEnding(`Quest Complete! ${story.questEnding}`);
      
      // Show braces quest reward popup if applicable
      if (isBracesQuest(story.id)) {
        setTimeout(() => {
          setShowBracesReward(true);
          setTimeout(() => setShowBracesReward(false), 4000);
        }, 500);
      }

      // Track daily challenge progress for stories
      const challengeResult = await incrementProgress("story");
      if (challengeResult?.completed) {
        setTimeout(() => {
          setChallengeNotification({
            show: true,
            title: challengeResult.challengeTitle,
            xp: challengeResult.xpEarned,
          });
        }, 1500);
      }
    }
  };
  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />
      <DailyChallengeNotification
        isOpen={challengeNotification?.show || false}
        challengeTitle={challengeNotification?.title || ""}
        xpEarned={challengeNotification?.xp || 0}
        onClose={() => setChallengeNotification(null)}
      />
    <AnimatePresence mode="wait">
      <motion.div
        key={`story-modal-${story.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-float"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-card"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Toothy Intro Overlay */}
          <AnimatePresence mode="wait">
            {showIntro && (
              <motion.div
                key="intro-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/95 to-accent/95 rounded-3xl"
              >
                {/* Toothy mascot */}
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
                  className="relative mb-6"
                >
                  <img
                    src={toothyMascot}
                    alt="Toothy"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-8 h-8 text-star" />
                  </motion.div>
                </motion.div>

                {/* Speech bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-md bg-white rounded-3xl p-6 shadow-float mb-6"
                >
                  {/* Speech bubble tail */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="font-display font-bold text-primary">Toothy says:</span>
                  </div>
                  <p className="text-lg md:text-xl text-foreground/90 font-medium text-center">
                    "{story.toothyIntro}"
                  </p>
                </motion.div>

                {/* Story title preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-6"
                >
                  <span className="text-5xl mb-2 block">{story.emoji}</span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                    {story.title}
                  </h3>
                </motion.div>

                {/* Start button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={handleStartStory}
                    size="lg"
                    className="rounded-full px-8 py-6 text-lg font-display font-bold bg-white text-primary hover:bg-white/90 shadow-float"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Quest!
                  </Button>
                </motion.div>

                {/* Story counter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm font-display font-bold text-sm text-white"
                >
                  Quest {currentIndex + 1} of {totalStories}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story illustration */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary/20 to-bubble/30">
            <img
              src={story.illustrationPath}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-9xl">
              {story.emoji}
            </div>
            
            {/* Braces Quest Effect */}
            <BracesQuestEffect questId={story.id} isActive={showBracesEffect} />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Story counter */}
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm font-display font-bold text-sm text-foreground shadow-card">
              Quest {currentIndex + 1} of {totalStories}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title and Audio Controls */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{story.emoji}</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {story.title}
                </h2>
              </div>
              
              {/* Audio controls */}
              <div className="flex items-center gap-2">
                {/* Voice settings button */}
                <Button
                  onClick={() => setShowVoiceSettings(true)}
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-9 h-9 p-0"
                  title="Voice Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
                
                {/* Audio narration button */}
                <Button
                  onClick={handleToggleNarration}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className={`rounded-full gap-2 transition-all ${
                    isPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : isPlaying && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span className="hidden sm:inline">Pause</span>
                      {/* Animated sound waves */}
                      <div className="flex items-center gap-0.5 ml-1">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-primary-foreground rounded-full"
                            animate={{ height: [4, 12, 4] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span className="hidden sm:inline">Resume</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Listen</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Enhanced error message with helpful tips */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                    <VolumeX className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-amber-800 dark:text-amber-200 mb-1">
                      Voice narration unavailable
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                      {error.includes("Unusual activity") || error.includes("Free Tier")
                        ? "The voice service requires an upgraded plan. Using browser voice instead!"
                        : error.includes("blocked")
                        ? "Audio playback was blocked by your browser."
                        : error}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(error.includes("blocked") || error.includes("Audio playback")) && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                          💡 Tap "Listen" again
                        </span>
                      )}
                      {(error.includes("Unusual activity") || error.includes("VPN")) && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full">
                          💡 Try disabling VPN
                        </span>
                      )}
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                        ✓ Browser voice active
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Story text */}
            <div className="relative mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl leading-relaxed text-foreground/90 font-sans"
              >
                {story.story}
              </motion.div>
              
              {/* Decorative sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -top-2 -right-2 text-star opacity-60"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </div>

            {/* Mini-Game Instructions (for procedure quests) */}
            {story.miniGameInstructions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-secondary/20 to-bubble/20 border-2 border-secondary/30 mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎮</span>
                  <span className="font-display font-bold text-secondary">Mini-Game:</span>
                </div>
                <p className="text-foreground/80 font-medium">{story.miniGameInstructions}</p>
              </motion.div>
            )}

            {/* Lesson box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-secondary fill-secondary" />
                <span className="font-display font-bold text-primary">What we learned:</span>
              </div>
              <p className="text-foreground/80 font-medium">{story.lesson}</p>
            </motion.div>

            {/* Rewards info (for procedure quests) */}
            {story.rewards && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-star/10 to-accent/10 border-2 border-star/20 mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-display font-bold text-star">Rewards:</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-star/20 text-star font-bold text-sm">
                    +{story.rewards.points} {story.rewards.pointsType}
                  </span>
                  <span className="text-foreground/70 text-sm">{story.rewards.feedback}</span>
                </div>
              </motion.div>
            )}

            {/* Quest ending */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-star/20 to-secondary/20 border-2 border-star/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-star" />
                <span className="font-display font-bold text-star">Quest Complete!</span>
              </div>
              <p className="text-foreground/80 font-medium italic">"{story.questEnding}"</p>
            </motion.div>

            {/* Quiz Section */}
            {story.quiz && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-4"
              >
                <InteractiveQuizWrapper
                  quiz={story.quiz}
                  quiz2={story.quiz2}
                  onComplete={() => setQuizCompleted(true)}
                  isCompleted={quizCompleted}
                />
              </motion.div>
            )}

            {/* Complete Quest Button */}
            {user && selectedChild && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4"
              >
                {questCompleted ? (
                  <div className="flex items-center justify-center gap-2 p-4 bg-accent/20 rounded-2xl text-accent">
                    <Trophy className="w-5 h-5" />
                    <span className="font-display font-bold">Quest Completed! +10 XP</span>
                  </div>
                ) : !quizCompleted ? (
                  <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-2xl text-muted-foreground">
                    <Trophy className="w-5 h-5" />
                    <span className="font-display font-bold">Answer the quiz to complete!</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleCompleteQuest}
                    disabled={isCompleting}
                    className="w-full rounded-2xl font-display font-bold bg-gradient-to-r from-star to-accent text-white hover:opacity-90"
                    size="lg"
                  >
                    {isCompleting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 mr-2" />
                        Complete Quest & Earn 10 XP
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-2xl"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Progress dots */}
              <div className="flex gap-2">
                {Array.from({ length: Math.min(totalStories, 10) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex % 10
                        ? "w-6 bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={onNext}
                disabled={currentIndex === totalStories - 1}
                className="flex items-center gap-2 rounded-2xl"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Celebration Modal */}
      <QuestCompleteCelebration
        isOpen={showCelebration}
        questTitle={story.title}
        questId={story.id}
        xpEarned={celebrationData.xp}
        newBadges={celebrationData.badges}
        onClose={() => setShowCelebration(false)}
      />

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
      
      {/* Braces Quest Reward Popup */}
      <AnimatePresence>
        {showBracesReward && (
          <BracesQuestReward
            questId={story.id}
            isOpen={showBracesReward}
            onClose={() => setShowBracesReward(false)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
    </>
  );
};

export default StoryViewer;
