import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import toothyLogo from "@/assets/toothyquest-logo.jpeg";
import MascotWithExpression from "./MascotWithExpression";

const DAILY_REWARDS = [
  { emoji: "🦷", name: "Sparkly Tooth", message: "A shiny tooth just for you!" },
  { emoji: "⭐", name: "Golden Star", message: "You're a star brusher!" },
  { emoji: "🌟", name: "Magic Sparkle", message: "Your smile is magical!" },
  { emoji: "🎀", name: "Pink Ribbon", message: "Looking fabulous today!" },
  { emoji: "🌈", name: "Rainbow Badge", message: "Brighten your day!" },
  { emoji: "🎈", name: "Party Balloon", message: "Let's celebrate!" },
  { emoji: "🍎", name: "Healthy Apple", message: "Great for your teeth!" },
  { emoji: "💎", name: "Diamond Tooth", message: "Precious like your smile!" },
];

const DailyReward = () => {
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState(DAILY_REWARDS[0]);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const lastRewardDate = localStorage.getItem("lastDailyRewardDate");
    const today = new Date().toDateString();

    if (lastRewardDate !== today) {
      // Show reward after 2 seconds
      const timer = setTimeout(() => {
        const randomReward = DAILY_REWARDS[Math.floor(Math.random() * DAILY_REWARDS.length)];
        setReward(randomReward);
        setShowReward(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClaim = () => {
    setClaimed(true);
    localStorage.setItem("lastDailyRewardDate", new Date().toDateString());
    
    // Store collected rewards
    const collected = JSON.parse(localStorage.getItem("collectedRewards") || "[]");
    collected.push({ ...reward, collectedAt: new Date().toISOString() });
    localStorage.setItem("collectedRewards", JSON.stringify(collected));

    // Close after animation
    setTimeout(() => {
      setShowReward(false);
      setClaimed(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {showReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-star via-accent to-secondary rounded-3xl shadow-float p-8 text-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setShowReward(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-20, -150],
                    x: Math.random() * 40 - 20,
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: 0,
                  }}
                >
                  {["✨", "⭐", "🌟"][Math.floor(Math.random() * 3)]}
                </motion.div>
              ))}
            </div>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-4"
            >
              <img
                src={toothyLogo}
                alt="ToothyQuest"
                className="w-16 h-16 rounded-full mx-auto shadow-float border-3 border-white"
              />
            </motion.div>

            {/* Gift icon or mascot */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-4"
            >
              {!claimed ? (
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block"
                >
                  <Gift className="w-20 h-20 text-white drop-shadow-lg" />
                </motion.div>
              ) : (
                <MascotWithExpression expression="celebrating" size="lg" />
              )}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg"
            >
              {claimed ? "Reward Collected!" : "Daily Reward!"}
            </motion.h2>

            {claimed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4"
              >
                <span className="text-5xl block mb-2">{reward.emoji}</span>
                <p className="font-display font-bold text-white">{reward.name}</p>
                <p className="text-white/80 text-sm">{reward.message}</p>
              </motion.div>
            ) : (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/90 mb-6"
                >
                  You came back today! Here's a surprise for you! 🎁
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={handleClaim}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Open Gift!
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyReward;