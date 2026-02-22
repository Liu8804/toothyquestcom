import { motion } from "framer-motion";
import { X, Sparkles, Trophy, ChevronRight } from "lucide-react";
import type { HybridQuest } from "../HybridQuestWorld";

interface Props {
  quest: HybridQuest;
  onClose: () => void;
  onPlay: () => void;
}

const HybridDetailSheet = ({ quest, onClose, onPlay }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.92 }}
    className="fixed inset-x-4 bottom-6 z-50 max-w-md mx-auto bg-card/95 backdrop-blur-lg rounded-3xl p-5 shadow-float border border-border"
    onClick={(e) => e.stopPropagation()}
  >
    <button onClick={onClose} className="absolute top-3 right-4 text-muted-foreground hover:text-foreground">
      <X className="w-5 h-5" />
    </button>

    <div className="flex items-center gap-4 mb-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
        quest.status === "completed" ? "bg-gradient-to-br from-star/30 to-accent/20" :
        quest.status === "active" ? "bg-gradient-to-br from-primary/20 to-bubble/15" :
        "bg-muted/50"
      }`}>
        {quest.emoji}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-foreground text-lg">{quest.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-star" />
          <span>{quest.xp} XP</span>
          {quest.reward && (
            <>
              <span className="mx-1">•</span>
              <span>Reward: {quest.reward}</span>
            </>
          )}
        </div>
      </div>
    </div>

    {quest.status === "completed" && (
      <div className="flex items-center justify-center gap-2 py-2 text-star font-display font-bold text-sm">
        <Trophy className="w-4 h-4" /> Quest Complete — Great job! ⭐
      </div>
    )}

    {quest.status === "active" && (
      <motion.button
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-primary-foreground gradient-hero shadow-playful text-base flex items-center justify-center gap-2"
      >
        Play Now ✨
      </motion.button>
    )}

    {quest.status === "unlocked" && (
      <motion.button
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-foreground bg-muted hover:bg-muted/80 shadow-card text-base flex items-center justify-center gap-2"
      >
        Start Quest <ChevronRight className="w-4 h-4" />
      </motion.button>
    )}
  </motion.div>
);

export default HybridDetailSheet;
