import { useState } from "react";
import { motion } from "framer-motion";
import { Map, Sparkles, Compass, Trophy, Lock } from "lucide-react";
import { stories } from "@/data/stories";
import StoryCard from "@/components/StoryCard";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";

const StoryModeSection = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const { questProgress, isQuestCompleted } = useQuestProgress();
  const { isPurchased, isContentLocked } = usePurchase();
  const { playSound } = useGameSounds();
  
  const completedQuestsCount = questProgress.length;
  const progressPercentage = (completedQuestsCount / stories.length) * 100;

  const handleOpenStory = (index: number) => {
    // Check if content is locked
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
      // Check if next story is locked
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary px-5 py-2 rounded-full text-sm font-bold mb-4 border border-primary/30"
          >
            <Compass className="w-4 h-4" />
            <span>🗺️ Quest Mode</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Epic Tooth Quests
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Embark on legendary adventures with Toothy! Complete quests, earn XP, and become a Dental Hero! ⚔️✨
          </p>
          
          {/* Quest progress bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-md mx-auto mt-6"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Map className="w-4 h-4 text-primary" />
                Quest Progress
              </span>
              <span className="flex items-center gap-1 font-bold text-primary">
                <Trophy className="w-4 h-4" />
                {completedQuestsCount}/{stories.length} Complete
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/20">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
            
            {/* Free quests indicator */}
            {!isPurchased && completedQuestsCount < FREE_QUEST_LIMIT && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Lock className="w-3 h-3" />
                <span>{FREE_QUEST_LIMIT - completedQuestsCount} free quests remaining</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-primary">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Fun Stories</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-secondary">{completedQuestsCount}</div>
            <div className="text-sm text-muted-foreground">Quests Completed</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-accent">∞</div>
            <div className="text-sm text-muted-foreground">Smiles Created</div>
          </div>
        </motion.div>
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
