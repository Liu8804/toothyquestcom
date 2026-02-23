import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MascotEmotionState, { MascotEmotion } from "@/components/mascot/MascotEmotionState";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import FloatingMicroIcons from "@/components/ui/FloatingMicroIcons";

interface DashboardMascotGreetingProps {
  childName?: string;
  taskCompleted?: boolean;
  className?: string;
}

const getGreeting = (childName?: string): string => {
  const hour = new Date().getHours();
  const name = childName || "superstar";
  if (hour < 12) return `Good morning, ${name}! ☀️`;
  if (hour < 17) return `Hey ${name}! Ready to play? 🌟`;
  return `Good evening, ${name}! 🌙`;
};

const DashboardMascotGreeting = ({
  childName,
  taskCompleted,
  className = "",
}: DashboardMascotGreetingProps) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasWaved, setHasWaved] = useState(false);
  const [emotion, setEmotion] = useState<MascotEmotion>("idle");
  const { playGreetingWave, playHappy } = useMascotSounds();

  // Wave greeting on first visit of the day
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastGreeting = localStorage.getItem("mascot_greeting_date");

    if (lastGreeting !== today) {
      setEmotion("waving");
      setShowGreeting(true);
      setHasWaved(true);
      playGreetingWave();
      localStorage.setItem("mascot_greeting_date", today);

      const timer = setTimeout(() => {
        setShowGreeting(false);
        setEmotion(taskCompleted ? "greatJob" : "letsPlay");
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setEmotion(taskCompleted ? "greatJob" : "idle");
    }
  }, [taskCompleted]);

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Greeting speech bubble */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="bg-card text-foreground px-4 py-2 rounded-2xl text-sm font-bold shadow-card border border-border/50 max-w-[200px]"
          >
            {getGreeting(childName)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot with subtle idle breathing */}
      <motion.div
        className="relative"
        initial={hasWaved ? { scale: 0, rotate: -15 } : undefined}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        onClick={() => {
          setEmotion("celebrating");
          setShowGreeting(true);
          playHappy();
          setTimeout(() => {
            setShowGreeting(false);
            setEmotion(taskCompleted ? "greatJob" : "idle");
          }, 2500);
        }}
      >
        <FloatingMicroIcons
          icons={taskCompleted ? ["⭐", "✨", "🌟"] : ["🦷", "✨", "💧"]}
          count={3}
          speed={1.5}
          iconSize="xs"
        />
        <MascotEmotionState
          emotion={emotion}
          size="sm"
          showSparkles={taskCompleted}
        />
      </motion.div>
    </div>
  );
};

export default DashboardMascotGreeting;
