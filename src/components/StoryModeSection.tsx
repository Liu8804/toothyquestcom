import { useState } from "react";
import { Map, Trophy, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStories } from "@/hooks/useStories";
import StoryCard from "@/components/StoryCard";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";

const StoryModeSection = () => {
  const { t } = useTranslation();
  const stories = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const { questProgress, isQuestCompleted } = useQuestProgress();
  const { isPurchased, isContentLocked } = usePurchase();
  const { playSound } = useGameSounds();
  
  const completedQuestsCount = questProgress.length;
  const progressPercentage = (completedQuestsCount / stories.length) * 100;

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
    <section id="stories" className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
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
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/20">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
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
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              onClick={() => handleOpenStory(index)}
              isCompleted={isQuestCompleted(story.id)}
              isLocked={isContentLocked(index, 'quest')}
            />
          ))}
        </div>

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
