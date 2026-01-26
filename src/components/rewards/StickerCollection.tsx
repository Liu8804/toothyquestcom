import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEngagementAnalytics } from "@/hooks/useEngagementAnalytics";

interface Sticker {
  id: string;
  emoji: string;
  name: string;
  unlocked: boolean;
  category: "brushing" | "flossing" | "achievement" | "streak";
}

const ALL_STICKERS: Sticker[] = [
  // Brushing stickers
  { id: "brush-champ", emoji: "🪥", name: "Brush Champ", unlocked: false, category: "brushing" },
  { id: "sparkle-teeth", emoji: "✨", name: "Sparkle Teeth", unlocked: false, category: "brushing" },
  { id: "morning-star", emoji: "🌅", name: "Morning Star", unlocked: false, category: "brushing" },
  { id: "night-owl", emoji: "🌙", name: "Night Owl", unlocked: false, category: "brushing" },
  // Flossing stickers
  { id: "floss-boss", emoji: "🦷", name: "Floss Boss", unlocked: false, category: "flossing" },
  { id: "clean-machine", emoji: "🫧", name: "Clean Machine", unlocked: false, category: "flossing" },
  // Achievement stickers
  { id: "super-star", emoji: "⭐", name: "Super Star", unlocked: false, category: "achievement" },
  { id: "champion", emoji: "🏆", name: "Champion", unlocked: false, category: "achievement" },
  { id: "hero", emoji: "🦸", name: "Dental Hero", unlocked: false, category: "achievement" },
  // Streak stickers
  { id: "streak-3", emoji: "🔥", name: "3 Day Streak", unlocked: false, category: "streak" },
  { id: "streak-7", emoji: "💪", name: "7 Day Streak", unlocked: false, category: "streak" },
  { id: "streak-30", emoji: "👑", name: "30 Day King", unlocked: false, category: "streak" },
];

interface StickerCollectionProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedStickerIds?: string[];
}

const StickerCollection = ({ isOpen, onClose, unlockedStickerIds = [] }: StickerCollectionProps) => {
  const { haptic } = useHapticFeedback();
  const { playStickerTap, playStickerUnlock, playSparkle } = useMascotSounds();
  const { trackStickerOpen, trackStickerTap, trackStickerUnlock } = useEngagementAnalytics();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  // Load stickers from localStorage on mount
  useEffect(() => {
    const savedStickers = localStorage.getItem("toothyquest_stickers");
    if (savedStickers) {
      const parsed = JSON.parse(savedStickers) as string[];
      setStickers(
        ALL_STICKERS.map(s => ({
          ...s,
          unlocked: parsed.includes(s.id) || unlockedStickerIds.includes(s.id),
        }))
      );
    } else {
      // Default: first 2 stickers unlocked for new users
      setStickers(
        ALL_STICKERS.map((s, i) => ({
          ...s,
          unlocked: i < 2 || unlockedStickerIds.includes(s.id),
        }))
      );
    }
  }, [unlockedStickerIds]);

  // Track when sticker collection is opened
  useEffect(() => {
    if (isOpen) {
      trackStickerOpen();
    }
  }, [isOpen, trackStickerOpen]);

  // Save to localStorage when stickers change
  useEffect(() => {
    const unlockedIds = stickers.filter(s => s.unlocked).map(s => s.id);
    if (unlockedIds.length > 0) {
      localStorage.setItem("toothyquest_stickers", JSON.stringify(unlockedIds));
    }
  }, [stickers]);

  const handleStickerTap = (sticker: Sticker) => {
    haptic("light");
    if (sticker.unlocked) {
      playStickerTap();
      trackStickerTap(sticker.id);
      setSelectedSticker(sticker);
      playSparkle();
    }
  };

  const unlockedCount = stickers.filter(s => s.unlocked).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-foreground/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-3xl shadow-float overflow-hidden"
        >
          {/* Header */}
          <div className="gradient-warm p-4 flex items-center justify-between text-white">
            <div>
              <h2 className="font-display text-xl font-bold">Sticker Collection</h2>
              <p className="text-sm opacity-90">{unlockedCount}/{stickers.length} collected</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-4 pt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-warm"
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedCount / stickers.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Sticker grid */}
          <div className="p-4 grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
            {stickers.map((sticker, index) => (
              <motion.button
                key={sticker.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleStickerTap(sticker)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
                  sticker.unlocked
                    ? "bg-gradient-to-br from-accent/30 to-secondary/30 hover:shadow-card"
                    : "bg-muted/50"
                }`}
              >
                {sticker.unlocked ? (
                  <>
                    <span className="text-3xl">{sticker.emoji}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                      {sticker.name}
                    </span>
                  </>
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground/50" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Hint */}
          <div className="p-4 pt-0 text-center text-sm text-muted-foreground">
            Complete quests to unlock more stickers! ⭐
          </div>
        </motion.div>

        {/* Selected sticker popup */}
        <AnimatePresence>
          {selectedSticker && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 z-[90] flex items-center justify-center"
              onClick={() => setSelectedSticker(null)}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring" }}
                className="bg-card rounded-3xl p-8 text-center shadow-float"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.span
                  className="text-8xl block mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {selectedSticker.emoji}
                </motion.span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {selectedSticker.name}
                </h3>
                <div className="flex items-center justify-center gap-1 text-star">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Collected!</span>
                </div>
                <Button
                  onClick={() => setSelectedSticker(null)}
                  variant="ghost"
                  className="mt-4"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickerCollection;
