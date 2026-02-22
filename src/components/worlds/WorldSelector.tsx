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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {phaseStories.map((story, index) => {
          if (!story) return null;
          const isCompleted = completedQuestIds.includes(story.id);
          const isLocked = !isUnlocked && !isAccessLoading && !story.isFree;

          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleOpenStory(story.id)}
              whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              className={cn(
                "relative rounded-2xl overflow-hidden aspect-square shadow-md transition-all",
                "border-2",
                isLocked
                  ? "border-muted opacity-60 grayscale"
                  : isCompleted
                  ? "border-mint/50 shadow-mint/20"
                  : "border-primary/30 hover:border-primary/60 hover:shadow-lg"
              )}
            >
              {/* Quest Image */}
              <img
                src={story.illustrationPath}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Completed checkmark */}
              {isCompleted && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-mint flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              )}

              {/* Lock overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              )}

              {/* FREE badge */}
              {story.isFree && !isCompleted && !isLocked && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  FREE
                </div>
              )}

              {/* Title at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-bold drop-shadow-lg line-clamp-2 leading-tight">
                  {story.title}
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
                  {isSpanish ? "🏰 Reino Dental" : "🏰 Tooth Kingdom"}
                </h2>

                <p className="text-muted-foreground max-w-xl mx-auto mb-2">
                  {isSpanish
                    ? "Explora mundos mágicos y completa misiones dentales."
                    : "Explore magical worlds and complete dental quests."}
                </p>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-mint" />
                    {isSpanish ? "74+ Misiones" : "74+ Quests"}
                  </span>
                  <span>•</span>
                  <span>{isSpanish ? "Sin anuncios" : "No ads"}</span>
                  <span>•</span>
                  <span>{isSpanish ? "Edades 3-9" : "Ages 3-9"}</span>
                </div>
              </div>

              {/* World Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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

              {/* World Header */}
              <div className="text-center mb-10">
                <div className="text-6xl mb-4">{selectedWorld.emoji}</div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  {isSpanish ? selectedWorld.nameEs : selectedWorld.name}
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {isSpanish ? selectedWorld.descriptionEs : selectedWorld.description}
                </p>
              </div>

              {/* Phase Cards with Animated Trail */}
              <div className="relative max-w-2xl mx-auto">
                {/* Animated Trail Line connecting phases */}
                <div className="absolute left-8 top-0 bottom-0 w-1 z-0">
                  <div className="h-full w-full bg-gradient-to-b from-primary/20 via-secondary/20 to-star/20 rounded-full" />
                  <motion.div
                    className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-secondary to-star rounded-full"
                    initial={{ height: "0%" }}
                    animate={{ height: `${Math.min(100, selectedWorld.phases.reduce((acc, p, i) => {
                      const prog = getPhaseProgress(p.id, completedQuestIds);
                      return acc + (prog / selectedWorld.phases.length);
                    }, 0))}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                  {/* Animated traveler dot */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-star shadow-lg shadow-star/50 z-10"
                    animate={{ 
                      top: ["0%", "100%", "0%"],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-star/50"
                      animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                </div>

                <div className="space-y-4">
                {selectedWorld.phases.map((phase, index) => {
                  const progress = getPhaseProgress(phase.id, completedQuestIds);
                  const completed = isPhaseCompleted(phase.id, completedQuestIds);
                  const prevPhase = index > 0 ? selectedWorld.phases[index - 1] : null;
                  const prevProgress = prevPhase
                    ? getPhaseProgress(prevPhase.id, completedQuestIds)
                    : 100;

                  const isLocked = !isAdmin && !isAccessLoading && index > 0 && prevProgress < 50;

                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="relative pl-12"
                    >
                      {/* Trail node */}
                      <div className="absolute left-6 top-6 z-10">
                        <motion.div
                          className={cn(
                            "w-5 h-5 rounded-full border-3 shadow-md",
                            completed 
                              ? "bg-mint border-mint shadow-mint/30" 
                              : isLocked 
                              ? "bg-muted border-muted-foreground/30"
                              : "bg-primary border-primary shadow-primary/30"
                          )}
                          animate={!isLocked && !completed ? {
                            scale: [1, 1.2, 1],
                            boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 8px rgba(var(--primary), 0.15)", "0 0 0 0 rgba(var(--primary), 0)"]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {completed && (
                            <span className="flex items-center justify-center text-xs text-white">✓</span>
                          )}
                        </motion.div>
                      </div>

                      <PhaseCard
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
                    </motion.div>
                  );
                })}
                </div>

                {/* Trail end marker */}
                <div className="flex justify-center mt-4 text-2xl">🏁</div>
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
