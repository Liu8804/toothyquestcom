import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStories } from "@/hooks/useStories";
import StoryCard from "@/components/StoryCard";
import { FloatingNode, TrailPath } from "@/components/hybrid-ui";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";
import BraceyMascot from "@/components/BraceyMascot";
import ThemedSectionWrapper from "@/components/ThemedSectionWrapper";

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
    <ThemedSectionWrapper theme="ocean" id="dental-helpers-world" className="py-12">
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

        {/* Zones as Floating Nodes */}
        <AnimatePresence mode="wait">
          {!selectedZone ? (
            <motion.div
              key="zones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Desktop: Scattered layout */}
              <div className="hidden md:block relative w-full h-[300px]">
                <TrailPath
                  points={[
                    { x: 15, y: 40 },
                    { x: 40, y: 60 },
                    { x: 65, y: 35 },
                    { x: 88, y: 55 },
                  ]}
                  width={100}
                  height={100}
                  variant="rainbow"
                  strokeWidth={2}
                  delay={0.3}
                  showGlowDots={true}
                  className="absolute inset-0 w-full h-full"
                />
                {zones.map((zone, index) => {
                  const positions = [
                    { x: 15, y: 40 },
                    { x: 40, y: 60 },
                    { x: 65, y: 35 },
                    { x: 88, y: 55 },
                  ];
                  const progress = getZoneProgress(zone);
                  const isComplete = progress.completed === progress.total && progress.total > 0;
                  return (
                    <div
                      key={zone.id}
                      className="absolute"
                      style={{
                        left: `${positions[index].x}%`,
                        top: `${positions[index].y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <FloatingNode
                        emoji={zone.id === "braces" ? "😁" : zone.id === "space-makers" ? "⭕" : zone.id === "tooth-protectors" ? "🛡️" : "❤️"}
                        status={isComplete ? "completed" : "active"}
                        delay={index * 0.15}
                        floatIntensity={0.7}
                        size="lg"
                        onClick={() => {
                          playSound("tap");
                          setSelectedZone(zone.id);
                        }}
                        label={zone.name}
                        reward={`${progress.completed}/${progress.total}`}
                        backgroundImage={zone.backgroundImage}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Zigzag trail */}
              <div className="md:hidden space-y-2">
                {zones.map((zone, index) => {
                  const isEven = index % 2 === 0;
                  const progress = getZoneProgress(zone);
                  const isComplete = progress.completed === progress.total && progress.total > 0;
                  return (
                    <div key={zone.id} className="relative">
                      {index < zones.length - 1 && (
                        <motion.div
                          className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 z-0"
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + 0.3 }}
                        >
                          <div className="w-full h-full bg-gradient-to-b from-primary/40 to-primary/10" />
                        </motion.div>
                      )}
                      <motion.div
                        className={`flex items-center gap-4 ${isEven ? "flex-row" : "flex-row-reverse"}`}
                        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.12 }}
                      >
                        <FloatingNode
                          emoji={zone.id === "braces" ? "😁" : zone.id === "space-makers" ? "⭕" : zone.id === "tooth-protectors" ? "🛡️" : "❤️"}
                          status={isComplete ? "completed" : "active"}
                          delay={index * 0.1}
                          floatIntensity={0.5}
                          size="md"
                          onClick={() => {
                            playSound("tap");
                            setSelectedZone(zone.id);
                          }}
                          backgroundImage={zone.backgroundImage}
                        />
                        <motion.div
                          className="flex-1 bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-primary/10"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            playSound("tap");
                            setSelectedZone(zone.id);
                          }}
                        >
                          <h3 className="font-display text-base font-bold text-foreground">{zone.name}</h3>
                          <p className="text-xs text-muted-foreground">{zone.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(progress.completed / Math.max(progress.total, 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary">{progress.completed}/{progress.total}</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
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
          <div className="flex flex-wrap gap-6 justify-center">
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
              const completed = isQuestCompleted(story.id);
              const locked = isContentLocked(storyIndex, 'quest');
              return (
                <div key={questId} className="pb-4">
                  <FloatingNode
                    emoji={story.emoji || "🦷"}
                    status={completed ? "completed" : locked ? "locked" : "active"}
                    delay={index * 0.08}
                    floatIntensity={completed ? 0.3 : 0.6}
                    size="md"
                    onClick={() => handleOpenStory(story.id)}
                    label={story.title.length > 14 ? story.title.slice(0, 14) + "…" : story.title}
                    reward={!completed && !locked ? `+${(index + 1) * 10}` : undefined}
                  />
                </div>
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
    </ThemedSectionWrapper>
  );
};

export default DentalHelpersWorld;
