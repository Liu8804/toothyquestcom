import { motion } from "framer-motion";
import { Star, Lock, Check, Sparkles, Gift } from "lucide-react";
import type { HybridQuest } from "../HybridQuestWorld";

interface Props {
  quest: HybridQuest;
  position: { x: number; y: number };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const HybridQuestNode = ({ quest, position, index, isSelected, onSelect }: Props) => {
  const isInteractive = quest.status !== "locked";
  const delay = index * 0.12;

  return (
    <motion.div
      className="absolute"
      style={{ left: `${position.x}%`, top: `${position.y}%`, zIndex: isSelected ? 20 : 10 }}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -6 - (index % 3) * 3, 0],
        x: [0, (index % 2 === 0 ? 3 : -3), 0],
      }}
      transition={{
        scale: { delay, type: "spring", stiffness: 160 },
        opacity: { delay, duration: 0.4 },
        y: { delay: delay + 0.8, duration: 4.5 + (index % 3), repeat: Infinity, ease: "easeInOut" },
        x: { delay: delay + 1, duration: 5.5 + (index % 2) * 2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {/* Shadow / ground */}
      {quest.status !== "locked" && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-[50%] bg-foreground/8 blur-sm" />
      )}

      <motion.button
        onClick={(e) => { e.stopPropagation(); if (isInteractive) onSelect(); }}
        disabled={!isInteractive}
        className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all ${
          quest.status === "completed"
            ? "bg-gradient-to-br from-star to-accent shadow-glow"
            : quest.status === "active"
            ? "bg-gradient-to-br from-primary to-bubble shadow-playful"
            : quest.status === "unlocked"
            ? "bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-card"
            : "bg-muted/35 backdrop-blur-sm border border-border/40 opacity-55"
        }`}
        whileHover={isInteractive ? { scale: 1.18 } : {}}
        whileTap={isInteractive ? { scale: 0.88 } : {}}
      >
        {quest.status === "completed" ? (
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        ) : quest.status === "locked" ? (
          <Lock className="w-5 h-5 text-muted-foreground/50" />
        ) : (
          <span className="text-3xl drop-shadow-sm">{quest.emoji}</span>
        )}

        {/* Completed star badge */}
        {quest.status === "completed" && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.5, type: "spring" }}
          >
            <Star className="w-5 h-5 text-star fill-star drop-shadow" />
          </motion.div>
        )}

        {/* Reward preview badge */}
        {quest.reward && quest.status !== "completed" && quest.status !== "locked" && (
          <motion.div
            className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-card shadow-card border border-border flex items-center justify-center text-xs"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.6, type: "spring" }}
          >
            {quest.reward}
          </motion.div>
        )}

        {/* Active glow ring */}
        {quest.status === "active" && (
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-primary/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Active sparkles */}
        {quest.status === "active" && (
          <>
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${50 + Math.cos(i * 1.57) * 55}%`,
                  top: `${50 + Math.sin(i * 1.57) * 55}%`,
                }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [0, -10] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
              >
                <Sparkles className="w-3 h-3 text-star" />
              </motion.div>
            ))}
          </>
        )}

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-[-5px] rounded-full border-[3px] border-primary"
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          />
        )}
      </motion.button>

      {/* Title label */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
          quest.status === "completed" ? "bg-star/20 text-star" :
          quest.status === "active" ? "bg-primary/15 text-primary" :
          quest.status === "unlocked" ? "bg-card/70 text-foreground" :
          "bg-muted/25 text-muted-foreground/50"
        }`}>
          {quest.title}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default HybridQuestNode;
