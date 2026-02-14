import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStories } from "@/hooks/useStories";
import StoryCard from "@/components/StoryCard";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";
import BraceyMascot from "@/components/BraceyMascot";

interface Zone {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  questIds: string[];
  backgroundImage: string;
}

const zones: Zone[] = [
  {
    id: "braces",
    name: "Braces Zone",
    description: "Braces help guide teeth into the right place!",
    icon: <span className="text-3xl">😁</span>,
    color: "from-pink-500 to-purple-500",
    questIds: ["braces-helpers"],
    backgroundImage: "/dental-helpers/braces-zone.webp",
  },
  {
    id: "space-makers",
    name: "Space Makers",
    description: "Some tools gently make space so teeth can grow properly.",
    icon: <span className="text-3xl">⭕</span>,
    color: "from-blue-500 to-cyan-500",
    questIds: ["tooth-separators", "dental-expanders"],
    backgroundImage: "/dental-helpers/space-makers.webp",
  },
  {
    id: "tooth-protectors",
    name: "Tooth Protectors",
    description: "These helpers protect teeth during play and accidents.",
    icon: <Shield className="w-8 h-8 text-white" />,
    color: "from-green-500 to-emerald-500",
    questIds: ["mouthguards-hero", "dental-trauma"],
    backgroundImage: "/dental-helpers/tooth-protectors.webp",
  },
  {
    id: "mouth-habits",
    name: "Mouth Habits",
    description: "Healthy habits help teeth grow straight and strong.",
    icon: <Heart className="w-8 h-8 text-white" />,
    color: "from-orange-500 to-amber-500",
    questIds: ["mouth-habits"],
    backgroundImage: "/dental-helpers/mouth-habits.webp",
  },
];

const DentalHelpersWorld = () => {
  const { t } = useTranslation();
  const stories = useStories();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const { isQuestCompleted } = useQuestProgress();
  const { isContentLocked } = usePurchase();
  const { playSound } = useGameSounds();

  // Get all dental helpers world stories
  const dentalHelpersStories = stories.filter(s => s.world === "dental-helpers");
  
  // Get stories for selected zone
  const getZoneStories = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return [];
    return zone.questIds.map(id => stories.find(s => s.id === id)).filter(Boolean);
  };

  const handleOpenStory = (storyId: string) => {
    const storyIndex = stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;
    
    if (isContentLocked(storyIndex, 'quest')) {
      playSound("locked");
      setShowPurchaseModal(true);
      return;
    }
    playSound("tap");
    setSelectedStoryIndex(storyIndex);
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

  const getZoneProgress = (zone: Zone) => {
    const zoneStories = getZoneStories(zone.id);
    const completed = zoneStories.filter(s => s && isQuestCompleted(s.id)).length;
    return { completed, total: zoneStories.length };
  };

  return (
    <section id="dental-helpers-world" className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 overflow-hidden relative">
      {/* Floating decorations removed for cleaner look */}

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Bracey mascot */}
          <div className="flex justify-center mb-6">
            <BraceyMascot 
              mood="excited" 
              size="lg" 
              message="Welcome to Dental Helpers! 🎉"
              showMessage={true}
            />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dental Helpers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet the friendly tools that help teeth grow straight, strong, and safe! 
            Learn about braces, expanders, separators, and mouthguards in a fun and gentle way.
          </p>
        </div>

        {/* Zones Grid */}
        <AnimatePresence mode="wait">
          {!selectedZone ? (
            <motion.div
              key="zones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {zones.map((zone) => {
                const progress = getZoneProgress(zone);
                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      playSound("tap");
                      setSelectedZone(zone.id);
                    }}
                    className="cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div 
                      className="relative rounded-3xl p-6 shadow-lg overflow-hidden min-h-[200px]"
                      style={{
                        backgroundImage: `url(${zone.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* Gradient overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full justify-end mt-16">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            {zone.icon}
                          </div>
                          <h3 className="font-display text-xl font-bold text-white drop-shadow-lg">
                            {zone.name}
                          </h3>
                        </div>
                        <p className="text-white/90 text-sm mb-3 drop-shadow-md">
                          {zone.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-bold flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {progress.completed}/{progress.total}
                          </span>
                          <ChevronRight className="w-5 h-5 text-white/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="quests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  playSound("tap");
                  setSelectedZone(null);
                }}
                className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Back to Zones
              </motion.button>

              {/* Zone title */}
              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {zones.find(z => z.id === selectedZone)?.name}
                </h3>
                <p className="text-muted-foreground">
                  {zones.find(z => z.id === selectedZone)?.description}
                </p>
              </div>

              {/* Zone quests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {getZoneStories(selectedZone).map((story, index) => {
                  if (!story) return null;
                  const storyIndex = stories.findIndex(s => s.id === story.id);
                  return (
                    <StoryCard
                      key={story.id}
                      story={story}
                      index={storyIndex}
                      onClick={() => handleOpenStory(story.id)}
                      isCompleted={isQuestCompleted(story.id)}
                      isLocked={isContentLocked(storyIndex, 'quest')}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All quests in order - shown at bottom */}
        <div className="mt-16">
          <h3 className="font-display text-2xl font-bold text-center text-foreground mb-6">
            All Dental Helpers Quests
          </h3>
          <p className="text-center text-muted-foreground mb-8">
            Complete all quests in order for the full learning adventure!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              "braces-helpers",
              "tooth-separators", 
              "dental-expanders",
              "mouthguards-hero",
              "dental-trauma",
              "mouth-habits"
            ].map((questId, index) => {
              const story = stories.find(s => s.id === questId);
              if (!story) return null;
              const storyIndex = stories.findIndex(s => s.id === questId);
              return (
                <StoryCard
                  key={questId}
                  story={story}
                  index={storyIndex}
                  onClick={() => handleOpenStory(story.id)}
                  isCompleted={isQuestCompleted(story.id)}
                  isLocked={isContentLocked(storyIndex, 'quest')}
                />
              );
            })}
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

export default DentalHelpersWorld;
