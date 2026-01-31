import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Sparkles, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useToothyPhrases } from "@/hooks/useToothyPhrases";
import { useAutoSpeak, useTapSpeak } from "@/hooks/useAutoSpeak";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";
import { useMascotEmotionContext } from "@/contexts/MascotEmotionContext";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";

interface InteractiveBrushingQuestProps {
  onComplete: () => void;
  onClose: () => void;
}

// Tooth grid for tapping
const TEETH = [
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 35, y: 25 },
  { id: 3, x: 50, y: 22 },
  { id: 4, x: 65, y: 25 },
  { id: 5, x: 80, y: 30 },
  { id: 6, x: 20, y: 70 },
  { id: 7, x: 35, y: 75 },
  { id: 8, x: 50, y: 78 },
  { id: 9, x: 65, y: 75 },
  { id: 10, x: 80, y: 70 },
];

type QuestPhase = "toothpaste" | "brushing";

const InteractiveBrushingQuest = ({ onComplete, onClose }: InteractiveBrushingQuestProps) => {
  const [phase, setPhase] = useState<QuestPhase>("toothpaste");
  const [toothpasteApplied, setToothpasteApplied] = useState(false);
  const [isDraggingToothpaste, setIsDraggingToothpaste] = useState(false);
  const [showToothpasteSparkle, setShowToothpasteSparkle] = useState(false);
  const toothbrushRef = useRef<HTMLDivElement>(null);
  
  const [cleanedTeeth, setCleanedTeeth] = useState<number[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [mascotReaction, setMascotReaction] = useState<"idle" | "cheering" | "dancing">("idle");
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number }[]>([]);
  const { haptic, success } = useHapticFeedback();
  const { playToothClean, playCheer, playCelebrate, playQuestComplete, playXpGain, playSparkle, playToothTapShine, playDing } = useMascotSounds();
  const { speak: speakTap } = useTapSpeak();
  
  // Toothy's playful phrases for start and completion
  const { sayBrushTogether, sayAllClean, saySparkle, playToothTapDing } = useToothyPhrases();
  
  // Mascot emotion context for reactive feedback
  const { triggerHelp, triggerSuccess, triggerWow } = useMascotEmotionContext();
  
  // Trigger help emotion when quest starts
  useEffect(() => {
    triggerHelp();
  }, [triggerHelp]);

  // Voice-first: Say "Let's brush together!" when toothpaste phase starts
  const { replay: replayToothpasteInstruction } = useAutoSpeak({
    instruction: "Drag the toothpaste onto the toothbrush! Pull it up!",
    delay: 600,
    autoSpeak: false, // We'll use sayBrushTogether instead
  });

  // Say "Let's brush together!" on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      sayBrushTogether();
    }, 800);
    return () => clearTimeout(timeout);
  }, [sayBrushTogether]);

  // Voice-first: Auto-speak instructions for brushing phase  
  useEffect(() => {
    if (phase === "brushing") {
      // Speak brushing instructions when phase changes
      setTimeout(() => {
        speakTap("Great job! Now tap each tooth to make it sparkle!");
      }, 500);
    }
  }, [phase, speakTap]);

  // Handle toothpaste drag end
  const handleToothpasteDragEnd = (_: any, info: PanInfo) => {
    setIsDraggingToothpaste(false);
    
    if (toothbrushRef.current) {
      const brushRect = toothbrushRef.current.getBoundingClientRect();
      const pasteX = info.point.x;
      const pasteY = info.point.y;
      
      // Check if toothpaste dropped on toothbrush
      if (
        pasteX >= brushRect.left - 30 &&
        pasteX <= brushRect.right + 30 &&
        pasteY >= brushRect.top - 30 &&
        pasteY <= brushRect.bottom + 30
      ) {
        // Success! Apply toothpaste
        success();
        haptic("heavy");
        playSparkle();
        setToothpasteApplied(true);
        setShowToothpasteSparkle(true);
        setMascotReaction("cheering");
        playCheer();
        // Trigger success mascot emotion
        triggerSuccess();
        
        // Say "Yay! You made me sparkle!" with sparkle sound
        saySparkle();
        
        setTimeout(() => {
          setMascotReaction("idle");
          setShowToothpasteSparkle(false);
        }, 1500);
        
        // Move to brushing phase after a delay
        setTimeout(() => {
          setPhase("brushing");
        }, 2000);
      }
    }
  };

  const handleToothTap = useCallback((toothId: number, event: React.MouseEvent | React.TouchEvent) => {
    if (cleanedTeeth.includes(toothId)) return;

    // Get tap position for XP popup
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    haptic("light");
    
    // Play quick ding + sparkle sound synced with visual
    playToothTapShine();
    if (Math.random() > 0.5) {
      setTimeout(() => playDing(), 50);
    }
    
    // Add XP popup at tap location
    const popupId = Date.now();
    setXpPopups(prev => [...prev, { id: popupId, x, y }]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== popupId));
    }, 1000);

    setCleanedTeeth(prev => [...prev, toothId]);
    setMascotReaction("cheering");
    playCheer(); // Mascot cheer sound

    // Voice encouragement on some taps (not every one to avoid overwhelming)
    const encouragements = ["Great!", "Sparkle!", "Yay!", "Good job!", "Nice!"];
    if (cleanedTeeth.length % 3 === 0) {
      speakTap(encouragements[cleanedTeeth.length % encouragements.length]);
    }

    // Reset mascot after animation
    setTimeout(() => setMascotReaction("idle"), 800);

    // Check if all teeth cleaned - say "All clean! Woohoo!"
    if (cleanedTeeth.length + 1 >= TEETH.length) {
      success();
      setMascotReaction("dancing");
      playCelebrate();
      
      // Use Toothy's playful phrase for completion
      sayAllClean();
      
      // Trigger wow for quest completion
      triggerWow();
      setTimeout(() => {
        playQuestComplete();
        playXpGain();
        setShowReward(true);
      }, 500);
    }
  }, [cleanedTeeth, haptic, success, playToothTapShine, playDing, playCheer, playCelebrate, playQuestComplete, playXpGain, speakTap, sayAllClean, triggerWow]);

  const handleCollectReward = () => {
    onComplete();
  };

  const progress = (cleanedTeeth.length / TEETH.length) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-card rounded-3xl shadow-float overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* PHASE 1: Toothpaste */}
          {phase === "toothpaste" && (
            <motion.div
              key="toothpaste-phase"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
            >
              {/* Header - Icon-based for non-readers */}
              <div className="gradient-hero p-4 text-center text-white">
                <div className="flex items-center justify-center gap-3 text-4xl mb-1">
                  <span>🧴</span>
                  <motion.span animate={{ x: [0, 10, 0] }} transition={{ duration: 1, repeat: Infinity }}>➡️</motion.span>
                  <span>🪥</span>
                </div>
                {/* Tap mascot to hear instructions */}
                <motion.button
                  onClick={() => replayToothpasteInstruction()}
                  className="mt-2 flex items-center justify-center gap-1 mx-auto bg-white/20 rounded-full px-3 py-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">🔊</span>
                  <span className="text-xs">Tap to hear</span>
                </motion.button>
              </div>

              {/* Toothpaste drag area */}
              <div className="relative h-72 mx-4 my-4 bg-gradient-to-b from-bubble/20 to-primary/10 rounded-2xl overflow-hidden">
                {/* Toothbrush target */}
                <motion.div
                  ref={toothbrushRef}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all ${
                    isDraggingToothpaste ? "scale-110" : ""
                  }`}
                  animate={toothpasteApplied ? { scale: [1, 1.1, 1] } : {}}
                >
                  <div className="relative">
                    {/* Toothbrush body */}
                    <div className="w-48 h-12 bg-gradient-to-r from-primary to-bubble rounded-full shadow-lg flex items-center justify-center">
                      <img src={mascotWaving} alt="Toothy brush" className="w-8 h-8 object-contain" />
                    </div>
                    {/* Toothpaste on brush (when applied) */}
                    {toothpasteApplied && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                      >
                        <div className="w-16 h-4 bg-gradient-to-r from-mint to-white rounded-full shadow-md" />
                      </motion.div>
                    )}
                  </div>
                  {/* Target glow when dragging */}
                  {isDraggingToothpaste && !toothpasteApplied && (
                    <motion.div
                      className="absolute inset-0 -m-4 rounded-full border-4 border-dashed border-star"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Sparkle effect when applied */}
                {showToothpasteSparkle && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-2xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5],
                          x: Math.cos((i * 45 * Math.PI) / 180) * 80,
                          y: Math.sin((i * 45 * Math.PI) / 180) * 80,
                        }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        style={{ left: "50%", top: "50%", marginLeft: -12, marginTop: -12 }}
                      >
                        ✨
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Draggable toothpaste */}
                {!toothpasteApplied && (
                  <motion.div
                    drag
                    dragElastic={0.3}
                    onDragStart={() => {
                      setIsDraggingToothpaste(true);
                      haptic("light");
                    }}
                    onDragEnd={handleToothpasteDragEnd}
                    whileDrag={{ scale: 1.2, rotate: 15 }}
                    initial={{ x: 0, y: 0 }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ y: { duration: 1.5, repeat: Infinity } }}
                    className="absolute left-1/2 bottom-8 -translate-x-1/2 cursor-grab active:cursor-grabbing"
                  >
                  <div className="bg-gradient-to-r from-mint via-white to-mint rounded-2xl p-3 shadow-float flex flex-col items-center">
                    <div className="w-12 h-16 bg-gradient-to-b from-mint to-primary rounded-lg shadow-md" />
                  </div>
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Drag me! ☝️
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Mascot encouragement - Icon-based */}
              <div className="flex justify-center pb-4">
                <motion.button
                  onClick={() => replayToothpasteInstruction()}
                  animate={mascotReaction === "cheering" ? { y: [0, -10, 0] } : { y: [0, -5, 0] }}
                  transition={{ duration: mascotReaction === "cheering" ? 0.5 : 2, repeat: Infinity }}
                  className="flex flex-col items-center gap-2"
                >
                  <img
                    src={toothpasteApplied ? mascotCelebrating : mascotWaving}
                    alt="Toothy"
                    className="w-20 h-20 object-contain"
                  />
                  {/* Visual hint instead of text */}
                  <div className="flex items-center gap-1 text-2xl">
                    {toothpasteApplied ? (
                      <>
                        <span>✅</span>
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>🎉</motion.span>
                      </>
                    ) : (
                      <>
                        <span>👆</span>
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }}>☝️</motion.span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Close button - Icon only */}
              <div className="p-4 pt-0 text-center">
                <Button variant="ghost" onClick={onClose} className="text-muted-foreground text-2xl">
                  ❌
                </Button>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: Brushing */}
          {phase === "brushing" && (
            <motion.div
              key="brushing-phase"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {/* Header - Icon-based for non-readers */}
              <div className="gradient-hero p-4 text-center text-white">
                <div className="flex items-center justify-center gap-3 text-4xl mb-1">
                  <span>👆</span>
                  <span>🦷</span>
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>✨</motion.span>
                </div>
                {/* Tap to hear instructions */}
                <motion.button
                  onClick={() => speakTap("Tap each tooth to make it sparkle!")}
                  className="mt-2 flex items-center justify-center gap-1 mx-auto bg-white/20 rounded-full px-3 py-1"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">🔊</span>
                  <span className="text-xs">Tap to hear</span>
                </motion.button>
              </div>

              {/* Progress bar - Visual only (stars instead of text) */}
              <div className="px-4 pt-4">
                <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full gradient-hero"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Star indicators instead of text */}
                  <div className="absolute inset-0 flex items-center justify-around px-2">
                    {TEETH.map((_, i) => (
                      <motion.span
                        key={i}
                        className="text-xs"
                        animate={cleanedTeeth.length > i ? { scale: [1, 1.3, 1] } : {}}
                      >
                        {cleanedTeeth.length > i ? "⭐" : "○"}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teeth grid */}
              <div className="relative aspect-[4/3] mx-4 my-4 bg-gradient-to-b from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/20 rounded-2xl overflow-hidden">
                {/* Mouth outline */}
                <div className="absolute inset-4 border-4 border-pink-300 dark:border-pink-700 rounded-[50%]" />

                {/* Teeth */}
                {TEETH.map((tooth) => {
                  const isCleaned = cleanedTeeth.includes(tooth.id);
                  return (
                    <motion.button
                      key={tooth.id}
                      className={`absolute w-8 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isCleaned
                          ? "bg-white shadow-lg"
                          : "bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-50"
                      }`}
                      style={{
                        left: `${tooth.x}%`,
                        top: `${tooth.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={(e) => handleToothTap(tooth.id, e)}
                      whileTap={{ scale: 0.9 }}
                      animate={isCleaned ? { scale: [1, 1.2, 1] } : {}}
                    >
                      {isCleaned ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary"
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <span className="text-xs">✨</span>
                      )}
                    </motion.button>
                  );
                })}

                {/* Sparkle effects on tap */}
                <AnimatePresence>
                  {cleanedTeeth.map((id) => {
                    const tooth = TEETH.find(t => t.id === id);
                    if (!tooth) return null;
                    return (
                      <motion.div
                        key={`sparkle-${id}`}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 2, y: -20 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute text-star pointer-events-none"
                        style={{
                          left: `${tooth.x}%`,
                          top: `${tooth.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        ✨
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Floating XP popups */}
                <AnimatePresence>
                  {xpPopups.map((popup) => (
                    <motion.div
                      key={popup.id}
                      initial={{ opacity: 1, y: 0, scale: 0 }}
                      animate={{ opacity: 0, y: -40, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="fixed pointer-events-none z-50 font-bold text-star"
                      style={{ left: popup.x, top: popup.y }}
                    >
                      +2 ⭐
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Mascot - Tappable for voice replay */}
              <div className="flex justify-center pb-4">
                <motion.button
                  onClick={() => speakTap("Tap the teeth to make them sparkle!")}
                  animate={
                    mascotReaction === "cheering"
                      ? { y: [0, -10, 0], scale: [1, 1.1, 1] }
                      : mascotReaction === "dancing"
                      ? { rotate: [0, 10, -10, 0], y: [0, -5, 0] }
                      : { y: [0, -5, 0] }
                  }
                  transition={{
                    duration: mascotReaction === "idle" ? 2 : 0.5,
                    repeat: mascotReaction === "dancing" ? Infinity : mascotReaction === "idle" ? Infinity : 0,
                  }}
                  className="relative"
                >
                  <img
                    src={mascotCelebrating}
                    alt="Toothy"
                    className="w-20 h-20 object-contain"
                  />
                  {mascotReaction !== "idle" && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 text-xl"
                    >
                      {mascotReaction === "cheering" ? "🎉" : "💃"}
                    </motion.span>
                  )}
                  {/* Voice hint */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-star text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🔊
                  </motion.div>
                </motion.button>
              </div>

              {/* Close button - Icon only */}
              <div className="p-4 pt-0 text-center">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground text-2xl"
                >
                  ❌
                </Button>
              </div>

              {/* Reward popup */}
              <AnimatePresence>
                {showReward && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-foreground/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="bg-card rounded-3xl p-6 text-center shadow-float max-w-xs"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <img
                          src={mascotCelebrating}
                          alt="Toothy celebrating"
                          className="w-28 h-28 mx-auto drop-shadow-lg object-contain"
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4"
                      >
                        <Check className="w-12 h-12 text-mint mx-auto mb-2" />
                        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                          Amazing! 🎉
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You cleaned all your teeth! Here's your reward!
                        </p>
                        <div className="flex items-center justify-center gap-2 text-star font-bold text-xl mb-4">
                          <Sparkles className="w-6 h-6" />
                          <span>+25 XP</span>
                        </div>
                        <Button
                          onClick={handleCollectReward}
                          size="lg"
                          className="gradient-hero text-white rounded-full font-display font-bold"
                        >
                          Collect Reward! ⭐
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default InteractiveBrushingQuest;
