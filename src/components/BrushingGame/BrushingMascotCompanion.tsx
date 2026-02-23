import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MascotEmotionState, { MascotEmotion } from "@/components/mascot/MascotEmotionState";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import FloatingMicroIcons from "@/components/ui/FloatingMicroIcons";

interface BrushingMascotCompanionProps {
  phase: "ready" | "countdown" | "playing" | "paused" | "completed";
  timeRemaining: number;
  totalTime: number;
  currentQuadrant: number;
}

const BRUSHING_PHRASES = [
  { text: "Scrub scrub scrub! 🪥", emoji: "🪥" },
  { text: "You're doing great! ⭐", emoji: "⭐" },
  { text: "Keep going, champ! 💪", emoji: "💪" },
  { text: "Those teeth are sparkling! ✨", emoji: "✨" },
  { text: "Almost there! 🌟", emoji: "🌟" },
];

const QUADRANT_PHRASES = [
  "Top right — let's go! 🦷",
  "Now top left! Great job! ✨",
  "Bottom right — keep brushing! 💫",
  "Last one! Bottom left! 🎉",
];

const BrushingMascotCompanion = ({
  phase,
  timeRemaining,
  totalTime,
  currentQuadrant,
}: BrushingMascotCompanionProps) => {
  const [speechBubble, setSpeechBubble] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const { playEncourageChime, playQuadrantChange, playWoohoo } = useMascotSounds();

  // Determine mascot emotion based on phase
  const getEmotion = (): MascotEmotion => {
    switch (phase) {
      case "ready": return "letsPlay";
      case "countdown": return "wow";
      case "playing": {
        const progress = (totalTime - timeRemaining) / totalTime;
        if (progress > 0.75) return "celebrating";
        if (progress > 0.5) return "greatJob";
        return "gotIt";
      }
      case "paused": return "help";
      case "completed": return "levelUp";
      default: return "idle";
    }
  };

  // Show encouragement every 15 seconds during brushing
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeRemaining % 15 === 0 && timeRemaining > 0 && timeRemaining < totalTime) {
      const phrase = BRUSHING_PHRASES[Math.floor(Math.random() * BRUSHING_PHRASES.length)];
      setSpeechBubble(phrase.text);
      setShowBubble(true);
      playEncourageChime();
      const timer = setTimeout(() => setShowBubble(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, phase, totalTime, playEncourageChime]);

  // Show quadrant transition message
  useEffect(() => {
    if (phase === "playing" && currentQuadrant < QUADRANT_PHRASES.length) {
      setSpeechBubble(QUADRANT_PHRASES[currentQuadrant]);
      setShowBubble(true);
      playQuadrantChange();
      const timer = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentQuadrant, phase, playQuadrantChange]);

  // Show message on phase change
  useEffect(() => {
    if (phase === "ready") {
      setSpeechBubble("Ready to brush? Let's go! 🦷");
      setShowBubble(true);
    } else if (phase === "paused") {
      setSpeechBubble("Taking a break? That's okay! 😊");
      setShowBubble(true);
    } else if (phase === "completed") {
      setSpeechBubble("AMAZING! Your teeth are sparkling! 🎉✨");
      setShowBubble(true);
      playWoohoo();
    }
  }, [phase, playWoohoo]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-card text-foreground px-3 py-2 rounded-2xl text-xs font-bold shadow-card whitespace-nowrap border border-border/50 z-10"
          >
            {speechBubble}
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot with subtle idle sway */}
      <motion.div
        className="relative"
        animate={
          phase === "playing"
            ? { y: [0, -3, 0] }
            : phase === "completed"
            ? { y: [0, -8, 0], scale: [1, 1.05, 1] }
            : {}
        }
        transition={
          phase === "playing"
            ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            : phase === "completed"
            ? { duration: 1.2, repeat: 2, ease: "easeOut" }
            : {}
        }
      >
        {/* Floating dental micro-icons around mascot */}
        {phase === "playing" && (
          <FloatingMicroIcons
            icons={["🪥", "🦷", "✨", "💧", "⭐"]}
            count={4}
            speed={1.2}
            iconSize="xs"
          />
        )}
        {phase === "completed" && (
          <FloatingMicroIcons
            icons={["🎉", "⭐", "✨", "🏆", "👑"]}
            count={5}
            speed={0.8}
            iconSize="sm"
          />
        )}
        <MascotEmotionState
          emotion={getEmotion()}
          size="md"
          showSparkles={phase === "completed"}
        />
      </motion.div>
    </div>
  );
};

export default BrushingMascotCompanion;
