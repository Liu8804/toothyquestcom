import { motion } from "framer-motion";
import { Sparkles, Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";
import { useQuestVoice } from "@/hooks/useQuestVoice";
import { useEffect, useState } from "react";
import { isBracesQuest, getBracesQuestConfig } from "./BracesQuestEffects";
import { usePositiveSounds } from "@/hooks/usePositiveSounds";

// Personalized celebration messages
const CELEBRATION_MESSAGES = [
  "You're a superstar! 🌟",
  "Amazing job, champ! 🏆",
  "Wow! You did it! 🎉",
  "Your smile is shining! ✨",
  "Keep up the great work! 💪",
  "You make brushing look easy! 😄",
  "Toothy is SO proud of you! ⭐",
];

interface Badge {
  name: string;
  emoji: string;
  description: string;
}

interface QuestCompleteCelebrationProps {
  isOpen: boolean;
  questTitle: string;
  questId?: string;
  xpEarned: number;
  newBadges: Badge[];
  onClose: () => void;
}

const confettiColors = [
  "hsl(var(--primary))",
  "hsl(var(--star-gold))",
  "hsl(var(--candy-pink))",
  "hsl(var(--mint-fresh))",
  "hsl(var(--bubble-blue))",
  "hsl(var(--secondary))",
];

const QuestCompleteCelebration = ({
  isOpen,
  questTitle,
  questId,
  xpEarned,
  newBadges,
  onClose,
}: QuestCompleteCelebrationProps) => {
  const { speakQuestComplete, speakBadgeEarned, stop } = useQuestVoice();
  const { playQuestComplete, playRewardUnlocked } = usePositiveSounds();
  const bracesConfig = questId ? getBracesQuestConfig(questId) : null;
  const isBraces = questId ? isBracesQuest(questId) : false;

  // Play sounds and speak celebration when opened
  useEffect(() => {
    if (isOpen) {
      // Play positive sound effect
      playQuestComplete();
      
      // Speak celebration
      speakQuestComplete(questTitle, xpEarned);
      
      // Speak badge names and play reward sounds after a delay
      if (newBadges.length > 0) {
        const timeout = setTimeout(() => {
          playRewardUnlocked();
          newBadges.forEach((badge, index) => {
            setTimeout(() => speakBadgeEarned(badge.name), index * 1500);
          });
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
    
    return () => stop();
  }, [isOpen, questTitle, xpEarned, newBadges, speakQuestComplete, speakBadgeEarned, stop, playQuestComplete, playRewardUnlocked]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl shadow-float p-8 text-center overflow-hidden ${
          isBraces 
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600'
            : 'bg-gradient-to-br from-star via-primary to-accent'
        }`}
      >
        {/* Confetti explosion */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                left: "50%",
                top: "40%",
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: [1, 1, 0],
                rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </div>

        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * 300 - 150,
                y: Math.random() * 300 - 150,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
              }}
              className="absolute top-1/2 left-1/2 text-2xl"
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Celebrating Mascot with crown glow & cape flutter */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 right-4"
        >
          {/* Crown glow effect */}
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)",
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.3, 0.9],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Cape flutter particles */}
          {[...Array(4)].map((_, i) => (
            <motion.span
              key={`cape-${i}`}
              className="absolute pointer-events-none text-sm"
              style={{ bottom: `${10 + i * 8}%`, right: `-${5 + i * 4}px` }}
              animate={{
                x: [0, 8, -4, 0],
                opacity: [0, 0.8, 0],
                rotate: [0, 20, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              ✨
            </motion.span>
          ))}
          <MascotEmotionState
            emotion="greatJob"
            size="md"
            showSparkles={true}
          />
        </motion.div>

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="relative"
        >
          {isBraces ? (
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {bracesConfig?.emoji || "🦷"}
            </motion.div>
          ) : (
            <Trophy className="w-20 h-20 mx-auto text-white mb-4 drop-shadow-lg" />
          )}
        </motion.div>

        <h2 className="font-display text-3xl font-bold text-white mb-2 drop-shadow-lg">
          {isBraces ? `${bracesConfig?.rewardMessage || 'Quest Complete!'} 🎉` : 'Quest Complete! 🎉'}
        </h2>
        <p className="text-white/90 text-lg mb-6">{questTitle}</p>

        {/* XP earned - chunky 3D card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border-2 border-white/30 shadow-[0_4px_0_0_rgba(0,0,0,0.15)]"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Star className="w-8 h-8 text-star fill-star" />
            </motion.div>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: 3 }}
              className="font-display text-4xl font-bold text-white"
            >
              +{xpEarned} XP
            </motion.span>
            <motion.div animate={{ rotate: [0, -360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Star className="w-8 h-8 text-star fill-star" />
            </motion.div>
          </div>
        </motion.div>

        {/* New badges */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-white/80 text-sm mb-3">New Badges Earned!</p>
            <div className="flex justify-center gap-3">
              {newBadges.map((badge, i) => (
                <motion.div
                  key={badge.name}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  className="bg-white rounded-2xl p-3 shadow-card"
                >
                  <motion.span
                    className="text-3xl block mb-1"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {badge.emoji}
                  </motion.span>
                  <span className="text-xs font-medium text-foreground">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mascot with personalized message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6 relative"
        >
          <motion.div
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 max-w-[200px] mx-auto"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white text-sm font-medium text-center">
              {CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]}
            </p>
          </motion.div>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onClose}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Continue Adventure
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuestCompleteCelebration;
