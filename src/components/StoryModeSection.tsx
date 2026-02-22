import { useState } from "react";
import { Map, Trophy, Lock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useStories } from "@/hooks/useStories";
import StoryCard from "@/components/StoryCard";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";
import { RewardBurst } from "@/components/hybrid-ui";

const INITIAL_STORY_COUNT = 8;

const StoryModeSection = () => {
  const { t } = useTranslation();
  const stories = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_STORY_COUNT);
  const [showRewardBurst, setShowRewardBurst] = useState(false);
  const { questProgress, isQuestCompleted } = useQuestProgress();
  const { isPurchased, isContentLocked } = usePurchase();
  const { playSound } = useGameSounds();
  
  const completedQuestsCount = questProgress.length;
  const progressPercentage = (completedQuestsCount / stories.length) * 100;
  
  // Find the first uncompleted quest index for "current" indicator
  const currentQuestIndex = stories.findIndex((s) => !isQuestCompleted(s.id));

  const handleOpenStory = (index: number) => {
    if (isContentLocked(index, 'quest')) {
      playSound("locked");
      setShowPurchaseModal(true);
      return;
    }
    playSound("tap");
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      const nextIndex = selectedStoryIndex + 1;
      if (isContentLocked(nextIndex, 'quest')) {
        playSound("locked");
        setShowPurchaseModal(true);
        handleCloseStory();
        return;
      }
      playSound("tap");
      setSelectedStoryIndex(nextIndex);
    }
  };

  const handlePreviousStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  return (
    <section id="stories" className="py-12 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("storyMode.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t("storyMode.subtitle")}
          </p>
          
          {/* Epic Tooth Quest Hero Image */}
          <div className="max-w-2xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-card">
            <img 
              src="/quiz/epic-tooth-quest.webp" 
              alt="Epic Tooth Quest Adventure" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Quest progress bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Map className="w-4 h-4 text-primary" />
                {t("storyMode.questProgress")}
              </span>
              <span className="flex items-center gap-1 font-bold text-primary">
                <Trophy className="w-4 h-4" />
                {completedQuestsCount}/{stories.length} {t("storyMode.complete")}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/20 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
              {/* Glowing dot at progress tip */}
              {progressPercentage > 0 && progressPercentage < 100 && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-glow"
                  style={{ left: `${progressPercentage}%` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            
            {/* Free quests indicator */}
            {!isPurchased && completedQuestsCount < FREE_QUEST_LIMIT && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>{FREE_QUEST_LIMIT - completedQuestsCount} {t("storyMode.freeQuestsRemaining")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.slice(0, visibleCount).map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              onClick={() => handleOpenStory(index)}
              isCompleted={isQuestCompleted(story.id)}
              isLocked={isContentLocked(index, 'quest')}
              isCurrent={index === currentQuestIndex}
            />
          ))}
        </div>

        {/* Show More / Show Less */}
        {stories.length > INITIAL_STORY_COUNT && (
          <div className="mt-8 text-center">
            {visibleCount < stories.length ? (
              <button
                onClick={() => setVisibleCount(v => Math.min(v + 8, stories.length))}
                className="px-8 py-3 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                Show More ({stories.length - visibleCount} remaining)
              </button>
            ) : (
              <button
                onClick={() => setVisibleCount(INITIAL_STORY_COUNT)}
                className="px-8 py-3 rounded-2xl border-2 border-muted-foreground text-muted-foreground font-bold hover:bg-muted transition-colors duration-200"
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {/* Fun stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-center">
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-primary">{stories.length}</div>
            <div className="text-sm text-muted-foreground">{t("storyMode.funStories")}</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-secondary">{completedQuestsCount}</div>
            <div className="text-sm text-muted-foreground">{t("storyMode.questsCompleted")}</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-accent">∞</div>
            <div className="text-sm text-muted-foreground">{t("storyMode.smilesCreated")}</div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          story={stories[selectedStoryIndex]}
          currentIndex={selectedStoryIndex}
          totalStories={stories.length}
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}
      
      {/* Purchase Modal */}
      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </section>
  );
};

export default StoryModeSection;
