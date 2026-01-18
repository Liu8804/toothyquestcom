import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Lock, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { usePurchase, FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { useStories } from "@/hooks/useStories";
import PurchaseModal from "@/components/PurchaseModal";

interface AdventureMapProps {
  onSelectQuest?: (questId: string) => void;
  className?: string;
}

const AdventureMap = ({ onSelectQuest, className = "" }: AdventureMapProps) => {
  const { t } = useTranslation();
  const stories = useStories();
  const { questProgress, isQuestCompleted } = useQuestProgress();
  const { isPurchased, isContentLocked } = usePurchase();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const completedCount = questProgress.length;
  const totalQuests = stories.length;

  // Create path points for quests with purchase-based locking
  const questPoints = stories.slice(0, 10).map((story, index) => {
    const isCompleted = isQuestCompleted(story.id);
    const progressUnlocked = index === 0 || isQuestCompleted(stories[index - 1]?.id);
    const purchaseLocked = isContentLocked(index, 'quest');
    const isUnlocked = progressUnlocked && !purchaseLocked;
    const isCurrent = isUnlocked && !isCompleted;

    return {
      id: story.id,
      title: story.title,
      emoji: story.emoji,
      isCompleted,
      isUnlocked,
      isCurrent,
      isPurchaseLocked: purchaseLocked,
      x: 10 + (index % 2 === 0 ? 20 : 60),
      y: 10 + index * 9,
    };
  });

  const handleQuestClick = (quest: typeof questPoints[0]) => {
    if (quest.isPurchaseLocked) {
      setShowPurchaseModal(true);
    } else if (quest.isUnlocked) {
      onSelectQuest?.(quest.id);
    }
  };

  return (
    <>
      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
      <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Map background */}
      <div className="relative bg-gradient-to-b from-mint/20 via-bubble/20 to-primary/20 rounded-3xl p-6 min-h-[500px] overflow-hidden shadow-card">
        {/* Floating decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg opacity-30"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {["🌟", "✨", "🌈", "☁️", "🦷"][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>

        {/* Progress header */}
        <div className="relative z-10 text-center mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{t("adventures.questMap")}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} {t("adventures.of")} {totalQuests} {t("adventures.questsCompleted")}
          </p>
        </div>

        {/* Path SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--star-gold))" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <motion.path
            d={questPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ')}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Quest nodes */}
        {questPoints.map((quest, index) => (
          <motion.div
            key={quest.id}
            className="absolute z-10"
            style={{
              left: `${quest.x}%`,
              top: `${quest.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 * index, type: "spring" }}
          >
            <motion.button
              onClick={() => handleQuestClick(quest)}
              disabled={!quest.isUnlocked && !quest.isPurchaseLocked}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-card transition-all ${
                quest.isCompleted
                  ? "bg-gradient-to-br from-star to-accent"
                  : quest.isCurrent
                  ? "bg-gradient-to-br from-primary to-bubble ring-4 ring-primary/30"
                  : quest.isUnlocked
                  ? "bg-card hover:bg-muted"
                  : "bg-muted/50 cursor-not-allowed"
              }`}
              whileHover={quest.isUnlocked ? { scale: 1.1 } : {}}
              whileTap={quest.isUnlocked ? { scale: 0.95 } : {}}
              animate={quest.isCurrent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: quest.isCurrent ? Infinity : 0 }}
            >
              {quest.isCompleted ? (
                <Check className="w-6 h-6 text-white" />
              ) : !quest.isUnlocked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <span className="text-2xl">{quest.emoji}</span>
              )}

              {/* Current quest indicator */}
              {quest.isCurrent && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <MapPin className="w-5 h-5 text-secondary fill-secondary" />
                </motion.div>
              )}

              {/* Stars for completed */}
              {quest.isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                >
                  <Star className="w-5 h-5 text-star fill-star" />
                </motion.div>
              )}
            </motion.button>

            {/* Quest title */}
            <div className={`absolute ${index % 2 === 0 ? "left-16" : "right-16"} top-1/2 -translate-y-1/2 whitespace-nowrap`}>
              <span className={`text-xs font-medium ${quest.isCompleted ? "text-star" : quest.isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {quest.title.length > 15 ? quest.title.slice(0, 15) + "..." : quest.title}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Finish flag */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card">
            <Sparkles className="w-4 h-4 text-star" />
            <span className="text-sm font-display font-bold text-foreground">
              {t("adventures.finishLine")}
            </span>
            <span className="text-lg">🏆</span>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default AdventureMap;