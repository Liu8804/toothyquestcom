import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Lock, Play } from "lucide-react";
import { Game, globalGameText } from "@/data/games";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  game: Game;
  onClick: () => void;
  delay?: number;
  lockReason?: string;
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, onClick, delay = 0, lockReason }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br ${game.color} p-1 bg-3d-scene`}
    >
      <div className="bg-card rounded-xl p-4 h-full flex flex-col image-specular">
        {/* Emoji Icon */}
        <div className="text-5xl mb-3 text-center">{game.emoji}</div>
        
        {/* Game Name */}
        <h3 className="font-display text-lg font-bold text-foreground text-center mb-2">
          {game.name}
        </h3>
        
        {/* Short Description */}
        <p className="text-sm text-muted-foreground text-center mb-4 flex-grow">
          {game.shortDescription}
        </p>
        
        {/* Play Button or Locked */}
        {game.isLocked ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
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
            className={`w-full gap-2 bg-gradient-to-r ${game.color} hover:opacity-90 text-white`}
          >
            <Play className="w-4 h-4" />
            Play Now
          </Button>
        )}
      </div>
    </motion.div>
  );
});

GameCard.displayName = "GameCard";

export default GameCard;
