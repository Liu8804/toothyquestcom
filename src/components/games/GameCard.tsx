import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Lock, Play, Sparkles } from "lucide-react";
import { Game, globalGameText } from "@/data/games";
import { Button } from "@/components/ui/button";
import { GlowBeacon } from "@/components/hybrid-ui";

interface GameCardProps {
  game: Game;
  onClick: () => void;
  delay?: number;
  lockReason?: string;
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, onClick, delay = 0, lockReason }, ref) => {
  const isLocked = !!game.isLocked;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 150 }}
      whileHover={!isLocked ? { scale: 1.06, y: -6 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      className={`relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br ${game.color} p-1`}
    >
      {/* Floating bob animation */}
      <motion.div
        animate={!isLocked ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="bg-card rounded-xl p-4 h-full flex flex-col relative overflow-hidden">
          {/* Subtle sparkle background for unlocked games */}
          {!isLocked && (
            <motion.div
              className="absolute top-2 right-2 pointer-events-none"
              animate={{ rotate: [0, 180, 360], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-star/30" />
            </motion.div>
          )}

          {/* Emoji Icon with floating effect */}
          <motion.div
            className="text-5xl mb-3 text-center"
            animate={!isLocked ? { y: [0, -3, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {game.emoji}
          </motion.div>

          {/* Game Name */}
          <h3 className="font-display text-lg font-bold text-foreground text-center mb-2">
            {game.name}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground text-center mb-4 flex-grow">
            {game.shortDescription}
          </p>

          {/* Play Button or Locked */}
          {isLocked ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm opacity-55">
                <Lock className="w-4 h-4" />
                <span>Locked</span>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {globalGameText.lockedGame}
              </p>
              {!!lockReason && (
                <p className="text-[11px] leading-snug text-center text-muted-foreground">
                  <span className="font-semibold">Reason:</span> {lockReason}
                </p>
              )}
            </div>
          ) : (
            <Button
              onClick={onClick}
              className={`w-full gap-2 bg-gradient-to-r ${game.color} hover:opacity-90 text-white shadow-playful`}
            >
              <Play className="w-4 h-4" />
              Play Now
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";

export default GameCard;
