import { useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

interface StickerCollectAnimationProps {
  isOpen: boolean;
  stickerEmoji: string;
  stickerName: string;
  onCollected: () => void;
}

const StickerCollectAnimation = ({ 
  isOpen, 
  stickerEmoji, 
  stickerName, 
  onCollected 
}: StickerCollectAnimationProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const collectionZoneRef = useRef<HTMLDivElement>(null);
  const { haptic, success } = useHapticFeedback();
  const { playStickerUnlock, playSparkle, playCelebrate } = useMascotSounds();

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Check if sticker is dropped in collection zone
    if (collectionZoneRef.current) {
      const zone = collectionZoneRef.current.getBoundingClientRect();
      const stickerX = info.point.x;
      const stickerY = info.point.y;
      
      if (
        stickerX >= zone.left &&
        stickerX <= zone.right &&
        stickerY >= zone.top &&
        stickerY <= zone.bottom
      ) {
        // Successfully collected!
        success();
        haptic("heavy");
        playStickerUnlock();
        setIsCollected(true);
        setShowConfetti(true);
        
        setTimeout(() => {
          playCelebrate();
          playSparkle();
        }, 300);
        
        setTimeout(() => {
          onCollected();
        }, 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-foreground/80 backdrop-blur-md"
        >
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#FF6B6B", "#4ECDC4"][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: -20,
                  }}
                  animate={{
                    y: ["0vh", "100vh"],
                    x: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              New Sticker! 🎉
            </h2>
            <p className="text-white/80">Drag it to your collection!</p>
          </motion.div>

          {/* Collection zone (target) */}
          <motion.div
            ref={collectionZoneRef}
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              borderColor: isDragging ? "hsl(var(--star-gold))" : "rgba(255,255,255,0.3)",
            }}
            className={`w-32 h-32 rounded-3xl border-4 border-dashed flex items-center justify-center mb-8 transition-colors ${
              isCollected ? "bg-star/30 border-star" : "bg-white/10"
            }`}
          >
            {isCollected ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <span className="text-6xl">{stickerEmoji}</span>
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white/50" />
              </motion.div>
            )}
          </motion.div>

          {/* Draggable sticker */}
          {!isCollected && (
            <motion.div
              drag
              dragElastic={0.5}
              onDragStart={() => {
                setIsDragging(true);
                haptic("light");
              }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                y: [0, -10, 0],
              }}
              transition={{ 
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                scale: { type: "spring" },
              }}
              className="cursor-grab active:cursor-grabbing bg-gradient-to-br from-accent/40 to-secondary/40 rounded-3xl p-6 shadow-float"
            >
              <span className="text-7xl block">{stickerEmoji}</span>
              <p className="text-center text-foreground font-bold mt-2">{stickerName}</p>
            </motion.div>
          )}

          {/* Success message */}
          {isCollected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3"
            >
              <motion.img
                src={mascotCelebrating}
                alt="Toothy celebrating"
                className="w-16 h-16 object-contain"
                animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                <p className="text-white font-bold">Added to collection! ⭐</p>
              </div>
            </motion.div>
          )}

          {/* Hint */}
          {!isCollected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 text-white/60 text-sm"
            >
              👆 Drag the sticker up to the sparkle zone!
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickerCollectAnimation;
