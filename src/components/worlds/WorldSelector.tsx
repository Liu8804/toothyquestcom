import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import WorldCard from "./WorldCard";
import PhaseCard from "./PhaseCard";
import PhaseCompletionModal from "./PhaseCompletionModal";
import { WORLDS, World, Phase, getPhaseProgress, isPhaseCompleted } from "@/data/worldsConfig";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useStories } from "@/hooks/useStories";
import { usePurchase } from "@/hooks/usePurchase";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useEntitlementStatus } from "@/hooks/useEntitlementStatus";
import StoryViewer from "@/components/StoryViewer";
import PurchaseModal from "@/components/PurchaseModal";
import { cn } from "@/lib/utils";
import AnimatedVideoBackground from "@/components/ui/AnimatedVideoBackground";
import worldKingdomVideo from "@/assets/marketing/world-kingdom-header.mp4";

interface WorldSelectorProps {
  className?: string;
}

export const WorldSelector = ({ className }: WorldSelectorProps) => {
  const { t, i18n } = useTranslation();
  const { questProgress, selectedChild } = useQuestProgress();
  const stories = useStories();
  const { isPurchased, isCheckingPurchase } = usePurchase();
  const { isAdmin, isAdminLoading } = useAdminStatus();
  const { hasEntitlement, entitlementLoading } = useEntitlementStatus();

  // Wait for all access checks to complete before determining lock status
  const isAccessLoading = isCheckingPurchase || isAdminLoading || entitlementLoading;
  
  // Admin accounts always have full access - this is the primary unlock path
  const isUnlocked = isAdmin || isPurchased || hasEntitlement;

  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [completedPhase, setCompletedPhase] = useState<{ phase: Phase; world: World } | null>(null);
  const previousCompletedPhasesRef = useRef<Set<string>>(new Set());

  const isSpanish = i18n.language === "es";
  const completedQuestIds = questProgress.map(q => q.quest_id);

  // Track phase completions
  useEffect(() => {
    const currentCompletedPhases = new Set<string>();
    
    for (const world of WORLDS) {
      for (const phase of world.phases) {
        if (isPhaseCompleted(phase.id, completedQuestIds)) {
          currentCompletedPhases.add(phase.id);
          
          // Check if this is newly completed
          if (!previousCompletedPhasesRef.current.has(phase.id)) {
            setCompletedPhase({ phase, world });
          }
        }
      }
    }
    
    previousCompletedPhasesRef.current = currentCompletedPhases;
  }, [completedQuestIds]);

  // Get world progress
  const getWorldProgress = (world: World) => {
    if (world.phases.length === 0) return 0;
    const allQuests = world.phases.flatMap(p => p.questIds);
    const completed = allQuests.filter(id => completedQuestIds.includes(id)).length;
    return allQuests.length > 0 ? Math.round((completed / allQuests.length) * 100) : 0;
  };

  // Get stories for a phase
  const getPhaseStories = (phase: Phase) => {
    return phase.questIds
      .map(id => stories.find(s => s.id === id))
      .filter(Boolean);
  };

  // Handle opening a story
  const handleOpenStory = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    // Admin accounts bypass ALL locks - check admin first for consistency
    // If still loading access status, allow the click (optimistic) 
    const shouldBlock = !isUnlocked && !isAccessLoading && !story.isFree;
    if (shouldBlock) {
      setShowPurchaseModal(true);
      return;
    }

    const phaseStories = selectedPhase ? getPhaseStories(selectedPhase) : [];
    const index = phaseStories.findIndex(s => s?.id === storyId);
    setSelectedStoryIndex(index >= 0 ? index : 0);
  };

  // Render phase stories
  const renderPhaseStories = () => {
    if (!selectedPhase) return null;
    const phaseStories = getPhaseStories(selectedPhase);

    return (
      <div className="space-y-3">
        {phaseStories.map((story, index) => {
          if (!story) return null;
          const isCompleted = completedQuestIds.includes(story.id);
          // Never show lock for admin/purchased users, even while loading
          const isLocked = !isUnlocked && !isAccessLoading && !story.isFree;

          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleOpenStory(story.id)}
              className={cn(
                "w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all",
                "border-2 shadow-sm hover:shadow-md",
                isLocked
                  ? "bg-muted/50 border-muted cursor-pointer"
                  : isCompleted
                  ? "bg-mint/10 border-mint/30 hover:border-mint/50"
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              <div className="text-3xl">{story.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold text-foreground truncate">
                    {story.title}
                  </h5>
                  {isCompleted && (
                    <span className="text-xs bg-mint/20 text-mint px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                  {story.isFree && !isCompleted && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {story.lesson}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  // Main render
  return (
    <section id="worlds" className={cn("py-16", className)}>
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* World Selection View */}
          {!selectedWorld && (
            <motion.div
              key="worlds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-12">


                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {isSpanish ? "¡Bienvenido a ToothyQuest!" : "Welcome to ToothyQuest!"}
                </h2>

                <p className="text-muted-foreground max-w-xl mx-auto mb-2">
                  {isSpanish
                    ? "Convierte las visitas dentales en aventuras divertidas."
                    : "Turn dental visits into fun adventures."}
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-mint" />
                    {isSpanish ? "Seguro para niños" : "Kid-safe"}
                  </span>
                  <span>•</span>
                  <span>{isSpanish ? "Sin anuncios" : "No ads"}</span>
                  <span>•</span>
                  <span>{isSpanish ? "Reduce el miedo dental" : "Reduces dental fear"}</span>
                </div>
              </div>

              {/* World Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {WORLDS.map((world) => (
                  <WorldCard
                    key={world.id}
                    id={world.id}
                    name={isSpanish ? world.nameEs : world.name}
                    description={isSpanish ? world.descriptionEs : world.description}
                    emoji={world.emoji}
                    color={world.color}
                    backgroundImage={world.backgroundImage}
                    isLocked={world.isLocked && !isUnlocked && !isAccessLoading}
                    progress={getWorldProgress(world)}
                    onClick={() => setSelectedWorld(world)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase Selection View */}
          {selectedWorld && !selectedPhase && (
            <motion.div
              key="phases"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedWorld(null)}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isSpanish ? "Volver a Mundos" : "Back to Worlds"}
              </Button>

              {/* World Header with Video Background */}
              <AnimatedVideoBackground
                videoSrc={worldKingdomVideo}
                className="rounded-3xl mb-10 -mx-4 md:-mx-6"
                overlayClassName="bg-gradient-to-t from-background via-background/60 to-background/30"
              >
                <div className="text-center py-10 px-4">
                  <div className="text-6xl mb-4">{selectedWorld.emoji}</div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                    {isSpanish ? selectedWorld.nameEs : selectedWorld.name}
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    {isSpanish ? selectedWorld.descriptionEs : selectedWorld.description}
                  </p>
                </div>
              </AnimatedVideoBackground>

              {/* Phase Cards */}
              <div className="space-y-4 max-w-2xl mx-auto">
                {selectedWorld.phases.map((phase, index) => {
                  const progress = getPhaseProgress(phase.id, completedQuestIds);
                  const completed = isPhaseCompleted(phase.id, completedQuestIds);
                  // Unlock next phase if previous is > 50% complete
                  const prevPhase = index > 0 ? selectedWorld.phases[index - 1] : null;
                  const prevProgress = prevPhase
                    ? getPhaseProgress(prevPhase.id, completedQuestIds)
                    : 100;

                  // Admin accounts bypass progression locks. While access is still loading,
                  // keep phases optimistically unlocked to avoid "looks locked" race conditions.
                  const isLocked = !isAdmin && !isAccessLoading && index > 0 && prevProgress < 50;

                  return (
                    <PhaseCard
                      key={phase.id}
                      id={phase.id}
                      name={isSpanish ? phase.nameEs : phase.name}
                      description={isSpanish ? phase.descriptionEs : phase.description}
                      emoji={phase.emoji}
                      badgeName={isSpanish ? phase.badgeNameEs : phase.badgeName}
                      color={phase.color}
                      questCount={phase.questIds.length}
                      completedCount={phase.questIds.filter(id => completedQuestIds.includes(id)).length}
                      isLocked={isLocked}
                      isCompleted={completed}
                      phaseNumber={index + 1}
                      onClick={() => !isLocked && setSelectedPhase(phase)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Quest List View */}
          {selectedWorld && selectedPhase && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Back button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedPhase(null)}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isSpanish ? "Volver a Fases" : "Back to Phases"}
              </Button>

              {/* Phase Header */}
              <div className={cn(
                "rounded-2xl p-6 mb-8",
                selectedPhase.color
              )}>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedPhase.emoji}</div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white mb-1">
                      {isSpanish ? selectedPhase.nameEs : selectedPhase.name}
                    </h2>
                    <p className="text-white/80">
                      {isSpanish ? selectedPhase.descriptionEs : selectedPhase.description}
                    </p>
                    <div className="mt-2 text-sm text-white/70">
                      🏆 {isSpanish ? "Insignia:" : "Badge:"}{" "}
                      <span className="font-semibold text-white">
                        {isSpanish ? selectedPhase.badgeNameEs : selectedPhase.badgeName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quest List */}
              {renderPhaseStories()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Viewer */}
        {selectedStoryIndex !== null && selectedPhase && (
          <StoryViewer
            story={getPhaseStories(selectedPhase)[selectedStoryIndex]!}
            currentIndex={selectedStoryIndex}
            totalStories={getPhaseStories(selectedPhase).length}
            onClose={() => setSelectedStoryIndex(null)}
            onNext={() => {
              const phaseStories = getPhaseStories(selectedPhase);
              if (selectedStoryIndex < phaseStories.length - 1) {
                setSelectedStoryIndex(selectedStoryIndex + 1);
              }
            }}
            onPrevious={() => {
              if (selectedStoryIndex > 0) {
                setSelectedStoryIndex(selectedStoryIndex - 1);
              }
            }}
          />
        )}

        {/* Purchase Modal */}
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />

        {/* Phase Completion Modal */}
        {completedPhase && (
          <PhaseCompletionModal
            isOpen={!!completedPhase}
            onClose={() => setCompletedPhase(null)}
            phaseName={isSpanish ? completedPhase.phase.nameEs : completedPhase.phase.name}
            phaseEmoji={completedPhase.phase.emoji}
            badgeName={isSpanish ? completedPhase.phase.badgeNameEs : completedPhase.phase.badgeName}
            phaseNumber={completedPhase.world.phases.findIndex(p => p.id === completedPhase.phase.id) + 1}
            worldName={isSpanish ? completedPhase.world.nameEs : completedPhase.world.name}
            color={completedPhase.phase.color}
            isSpanish={isSpanish}
          />
        )}
      </div>
    </section>
  );
};

export default WorldSelector;
