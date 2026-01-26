import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

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

const InteractiveBrushingQuest = ({ onComplete, onClose }: InteractiveBrushingQuestProps) => {
  const [cleanedTeeth, setCleanedTeeth] = useState<number[]>([]);
  const [showReward, setShowReward] = useState(false);
  const [mascotReaction, setMascotReaction] = useState<"idle" | "cheering" | "dancing">("idle");
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number }[]>([]);
  const { haptic, success } = useHapticFeedback();
  const { playToothClean, playCheer, playCelebrate, playQuestComplete, playXpGain } = useMascotSounds();

  const handleToothTap = useCallback((toothId: number, event: React.MouseEvent | React.TouchEvent) => {
    if (cleanedTeeth.includes(toothId)) return;

    // Get tap position for XP popup
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    haptic("light");
    playToothClean(); // Sound on each tooth clean
    
    // Add XP popup at tap location
    const popupId = Date.now();
    setXpPopups(prev => [...prev, { id: popupId, x, y }]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== popupId));
    }, 1000);

    setCleanedTeeth(prev => [...prev, toothId]);
    setMascotReaction("cheering");
    playCheer(); // Mascot cheer sound

    // Reset mascot after animation
    setTimeout(() => setMascotReaction("idle"), 800);

    // Check if all teeth cleaned
    if (cleanedTeeth.length + 1 >= TEETH.length) {
      success();
      setMascotReaction("dancing");
      playCelebrate();
      setTimeout(() => {
        playQuestComplete();
        playXpGain();
        setShowReward(true);
      }, 500);
    }
  }, [cleanedTeeth, haptic, success, playToothClean, playCheer, playCelebrate, playQuestComplete, playXpGain]);

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
        {/* Header */}
        <div className="gradient-hero p-4 text-center text-white">
          <h2 className="font-display text-xl font-bold">Tap to Brush! 🪥</h2>
          <p className="text-sm opacity-90">Tap each tooth to make it sparkle!</p>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-hero"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-star" />
            <span>{cleanedTeeth.length}/{TEETH.length} teeth cleaned</span>
          </div>
        </div>

        {/* Teeth grid */}
        <div className="relative aspect-[4/3] mx-4 my-4 bg-gradient-to-b from-pink-100 to-pink-200 rounded-2xl overflow-hidden">
          {/* Mouth outline */}
          <div className="absolute inset-4 border-4 border-pink-300 rounded-[50%]" />

          {/* Teeth */}
          {TEETH.map((tooth) => {
            const isCleaned = cleanedTeeth.includes(tooth.id);
            return (
              <motion.button
                key={tooth.id}
                className={`absolute w-8 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isCleaned
                    ? "bg-white shadow-lg"
                    : "bg-yellow-100 hover:bg-yellow-50"
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

          {/* Floating XP popups on tap */}
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

        {/* Mascot */}
        <div className="flex justify-center pb-4">
          <motion.div
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
              className="w-20 h-20 shadow-card object-contain"
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
          </motion.div>
        </div>

        {/* Close button */}
        <div className="p-4 pt-0 text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Close
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
                    className="w-28 h-28 mx-auto shadow-float object-contain"
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
    </div>
  );
};

export default InteractiveBrushingQuest;
