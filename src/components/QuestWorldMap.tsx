import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Map, Trophy, Lock, ChevronDown, ChevronUp, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStories } from "@/hooks/useStories";
import StoryViewer from "@/components/StoryViewer";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import PurchaseModal from "@/components/PurchaseModal";
import { FloatingNode, TrailPath, RewardBurst, GlowBeacon, WorldTrailConnector, ProgressionMinimap, WorldCompletionCelebration } from "@/components/hybrid-ui";
import { WORLDS, type World, type Phase } from "@/data/worldsConfig";
import type { Story } from "@/data/stories";

const QuestWorldMap = () => {
  const { t, i18n } = useTranslation();
  const stories = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [expandedWorld, setExpandedWorld] = useState<string | null>("dental-castle");
  const [showRewardBurst, setShowRewardBurst] = useState(false);
  const [celebratingWorld, setCelebratingWorld] = useState<string | null>(null);
  const [previouslyCompleted, setPreviouslyCompleted] = useState<Set<string>>(new Set());

  const { questProgress, isQuestCompleted } = useQuestProgress();
  const { isPurchased, isContentLocked } = usePurchase();
  const { playSound } = useGameSounds();
  const isEs = i18n.language === "es";

  const completedQuestIds = useMemo(
    () => questProgress.map((q) => q.quest_id),
    [questProgress]
  );

  // Detect newly completed worlds
  useEffect(() => {
    const completedWorldIds = new Set<string>();
    WORLDS.forEach((w) => {
      const allQuests = w.phases.flatMap((p) => p.questIds);
      if (allQuests.length > 0 && allQuests.every((id) => completedQuestIds.includes(id))) {
        completedWorldIds.add(w.id);
      }
    });
    completedWorldIds.forEach((id) => {
      if (!previouslyCompleted.has(id)) {
        setCelebratingWorld(id);
      }
    });
    setPreviouslyCompleted(completedWorldIds);
  }, [completedQuestIds]);

  const storyMap = useMemo(() => {
    const map: Record<string, { story: Story; index: number }> = {};
    stories.forEach((s, i) => { map[s.id] = { story: s, index: i }; });
    return map;
  }, [stories]);

  const getWorldProgress = (world: World) => {
    const allQuests = world.phases.flatMap((p) => p.questIds);
    if (allQuests.length === 0) return 0;
    const completed = allQuests.filter((id) => completedQuestIds.includes(id)).length;
    return Math.round((completed / allQuests.length) * 100);
  };

  const getPhaseProgress = (phase: Phase) => {
    if (phase.questIds.length === 0) return 0;
    const completed = phase.questIds.filter((id) => completedQuestIds.includes(id)).length;
    return Math.round((completed / phase.questIds.length) * 100);
  };

  const handleOpenStory = (storyId: string) => {
    const entry = storyMap[storyId];
    if (!entry) return;

    if (isContentLocked(entry.index, "quest")) {
      playSound("locked");
      setShowPurchaseModal(true);
      return;
    }
    playSound("tap");
    setSelectedStoryIndex(entry.index);
  };

  const handleCloseStory = () => setSelectedStoryIndex(null);

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      const nextIdx = selectedStoryIndex + 1;
      if (isContentLocked(nextIdx, "quest")) {
        playSound("locked");
        setShowPurchaseModal(true);
        handleCloseStory();
        return;
      }
      playSound("tap");
      setSelectedStoryIndex(nextIdx);
    }
  };

  const handlePreviousStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  // Generate node positions for a phase (zigzag pattern)
  const getNodePositions = (count: number) => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const isEvenRow = row % 2 === 0;
      positions.push({
        x: isEvenRow ? 12 + col * 25 : 87 - col * 25,
        y: 20 + row * 35,
      });
    }
    return positions;
  };

  const totalCompleted = completedQuestIds.length;
  const totalQuests = WORLDS.reduce(
    (sum, w) => sum + w.phases.reduce((s, p) => s + p.questIds.length, 0),
    0
  );

  const worldMinimapData = WORLDS.map((w) => ({
    id: w.id,
    emoji: w.emoji,
    name: isEs ? w.nameEs : w.name,
    progress: getWorldProgress(w),
  }));

  const handleMinimapClick = (worldId: string) => {
    setExpandedWorld(worldId);
    document.getElementById(`world-${worldId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="stories" className="py-12 bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Progression Minimap */}
      <ProgressionMinimap
        worlds={worldMinimapData}
        activeWorldId={expandedWorld}
        onWorldClick={handleMinimapClick}
      />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("storyMode.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t("storyMode.subtitle")}
          </p>

          {/* Hero Image */}
          <div className="max-w-2xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-card">
            <img
              src="/quiz/epic-tooth-quest.webp"
              alt="Epic Tooth Quest Adventure"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Overall progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Map className="w-4 h-4 text-primary" />
                {t("storyMode.questProgress")}
              </span>
              <span className="flex items-center gap-1 font-bold text-primary">
                <Trophy className="w-4 h-4" />
                {totalCompleted}/{totalQuests}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/20 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${(totalCompleted / Math.max(totalQuests, 1)) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* World Accordion Map */}
        <div className="space-y-0 max-w-5xl mx-auto">
          {WORLDS.map((world, worldIdx) => {
            const isExpanded = expandedWorld === world.id;
            const progress = getWorldProgress(world);
            const prevProgress = worldIdx > 0 ? getWorldProgress(WORLDS[worldIdx - 1]) : 0;

            return (
              <div key={world.id}>
                {/* Inter-world trail connector */}
                {worldIdx > 0 && (
                  <WorldTrailConnector
                    fromProgress={prevProgress}
                    toProgress={progress}
                    index={worldIdx}
                    fromEmoji={WORLDS[worldIdx - 1].emoji}
                    toEmoji={world.emoji}
                  />
                )}
                <motion.div
                  id={`world-${world.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl overflow-hidden shadow-card border border-border/50"
                >
                {/* World Header */}
                <motion.button
                  onClick={() => setExpandedWorld(isExpanded ? null : world.id)}
                  className={`w-full flex items-center gap-4 p-5 bg-gradient-to-r ${world.color} text-white relative overflow-hidden`}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Background image overlay with parallax */}
                  {world.backgroundImage && (
                    <>
                      <motion.div
                        className="absolute inset-[-20%] bg-cover bg-center opacity-25"
                        style={{
                          backgroundImage: `url(${world.backgroundImage})`,
                          backgroundAttachment: "scroll",
                        }}
                        initial={{ y: 0 }}
                        whileInView={{ y: -10 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
                    </>
                  )}

                  <span className="text-4xl relative z-10">{world.emoji}</span>
                  <div className="flex-1 text-left relative z-10">
                    <h3 className="font-display text-xl font-bold">
                      {isEs ? world.nameEs : world.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {isEs ? world.descriptionEs : world.description}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden max-w-xs">
                      <motion.div
                        className="h-full bg-white/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="font-bold text-sm">{progress}%</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </motion.button>

                {/* Expanded Phases */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-card"
                    >
                      {world.phases.map((phase, phaseIdx) => {
                        const phaseProgress = getPhaseProgress(phase);
                        const isPhaseComplete = phaseProgress === 100;
                        const positions = getNodePositions(phase.questIds.length);
                        const firstIncomplete = phase.questIds.findIndex(
                          (id) => !completedQuestIds.includes(id)
                        );

                        return (
                          <div
                            key={phase.id}
                            className="border-b border-border/30 last:border-b-0"
                          >
                            {/* Phase Header */}
                            <div className="flex items-center gap-3 px-5 py-3 bg-muted/30">
                              <span className="text-2xl">{phase.emoji}</span>
                              <div className="flex-1">
                                <h4 className="font-display font-bold text-foreground text-sm">
                                  {isEs ? phase.nameEs : phase.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all duration-500"
                                      style={{ width: `${phaseProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground font-bold">
                                    {phaseProgress}%
                                  </span>
                                  {isPhaseComplete && (
                                    <Star className="w-4 h-4 text-star fill-star" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Quest Nodes Grid */}
                            <div className="px-4 py-4">
                              <div className="flex flex-wrap gap-4 justify-center">
                                {phase.questIds.map((questId, qIdx) => {
                                  const entry = storyMap[questId];
                                  const isCompleted = completedQuestIds.includes(questId);
                                  const isCurrent = qIdx === firstIncomplete;
                                  const isLocked =
                                    entry && isContentLocked(entry.index, "quest");
                                  const questStatus = isCompleted
                                    ? "completed"
                                    : isCurrent
                                    ? "active"
                                    : isLocked
                                    ? "locked"
                                    : "unlocked";

                                  return (
                                    <div key={questId} className="relative pb-8">
                                      <FloatingNode
                                        emoji={entry?.story.emoji || "❓"}
                                        status={questStatus as any}
                                        delay={qIdx * 0.08}
                                        floatIntensity={isCurrent ? 1.2 : 0.4}
                                        size="md"
                                        onClick={() => handleOpenStory(questId)}
                                        label={
                                          entry?.story.title
                                            ? entry.story.title.length > 12
                                              ? entry.story.title.slice(0, 12) + "…"
                                              : entry.story.title
                                            : questId
                                        }
                                        reward={
                                          !isCompleted && entry
                                            ? `+${(entry.index + 1) * 10}`
                                            : undefined
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </div>
            );
          })}
        </div>

        {/* Fun stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-center">
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-primary">{totalQuests}</div>
            <div className="text-sm text-muted-foreground">{t("storyMode.funStories")}</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-secondary">{totalCompleted}</div>
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

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
      <RewardBurst isActive={showRewardBurst} emoji="🌟" />

      {/* World Completion Celebration */}
      {(() => {
        const worldIdx = WORLDS.findIndex((w) => w.id === celebratingWorld);
        const world = worldIdx >= 0 ? WORLDS[worldIdx] : null;
        const nextWorld = worldIdx >= 0 && worldIdx < WORLDS.length - 1 ? WORLDS[worldIdx + 1] : null;
        return (
          <WorldCompletionCelebration
            isOpen={!!celebratingWorld}
            worldName={world ? (isEs ? world.nameEs : world.name) : ""}
            worldEmoji={world?.emoji || "🏆"}
            nextWorldName={nextWorld ? (isEs ? nextWorld.nameEs : nextWorld.name) : undefined}
            nextWorldEmoji={nextWorld?.emoji}
            onClose={() => setCelebratingWorld(null)}
            onGoToNextWorld={
              nextWorld
                ? () => {
                    setExpandedWorld(nextWorld.id);
                    document.getElementById(`world-${nextWorld.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                : undefined
            }
          />
        );
      })()}
    </section>
  );
};

export default QuestWorldMap;
