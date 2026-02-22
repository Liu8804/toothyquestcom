import { motion, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";
import { Lock, Play, Sparkles, Star } from "lucide-react";
import { Game, globalGameText } from "@/data/games";
import { FloatingNode } from "@/components/hybrid-ui";
import { useGameSounds } from "@/hooks/useGameSounds";

interface GameCardProps {
  game: Game;
  onClick: () => void;
  delay?: number;
  lockReason?: string;
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, onClick, delay = 0, lockReason }, ref) => {
  const isLocked = !!game.isLocked;
  const { playSound } = useGameSounds();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 150 }}
      className="flex flex-col items-center gap-2"
    >
      <FloatingNode
        emoji={game.emoji}
        status={isLocked ? "locked" : "active"}
        delay={delay}
        floatIntensity={isLocked ? 0 : 0.6}
        size="lg"
        onClick={onClick}
        label={game.name.length > 14 ? game.name.slice(0, 14) + "…" : game.name}
        reward={!isLocked ? "⭐" : undefined}
      />

      {/* Description below node */}
      <p className="text-[11px] text-muted-foreground text-center max-w-[100px] leading-tight mt-1">
        {game.shortDescription.length > 40 ? game.shortDescription.slice(0, 40) + "…" : game.shortDescription}
      </p>

      {/* Lock reason */}
      {isLocked && lockReason && (
        <p className="text-[9px] text-muted-foreground/60 text-center max-w-[90px]">
          {lockReason}
        </p>
      )}
    </motion.div>
  );
});

GameCard.displayName = "GameCard";

export default GameCard;
