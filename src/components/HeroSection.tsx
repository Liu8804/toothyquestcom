import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingBubbles from "@/components/FloatingBubbles";
import FirstTapCelebration from "@/components/FirstTapCelebration";
import SwipeHint from "@/components/SwipeHint";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEngagementAnalytics } from "@/hooks/useEngagementAnalytics";
import toothyQuestLogo from "@/assets/toothyquest-logo.png";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

export const HeroSection = () => {
  const { success } = useHapticFeedback();
  const { playWave, playCheer, playQuestStart } = useMascotSounds();
  const { 
    trackFirstTap, 
    trackCTAHover, 
    trackMascotInteraction,
    trackCelebration,
    trackSessionStart 
  } = useEngagementAnalytics();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hasCompletedFirstTap, setHasCompletedFirstTap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "waving" | "cheering">("idle");

  // Check if onboarding is complete and start session tracking
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("toothyquest_onboarding_complete");
    const firstTapComplete = localStorage.getItem("toothyquest_first_tap");
    
    // Track session start
    trackSessionStart();
    
    if (!onboardingComplete) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
    
    if (firstTapComplete) {
      setHasCompletedFirstTap(true);
    }
  }, [trackSessionStart]);

  // Mascot wave animation when hovering CTA
  useEffect(() => {
    if (isHoveringCTA) {
      setMascotMood("waving");
      playWave();
      trackMascotInteraction("wave");
    } else {
      setMascotMood("idle");
    }
  }, [isHoveringCTA, playWave, trackMascotInteraction]);

  const handleStartQuest = useCallback(() => {
    success(); // Haptic feedback
    playQuestStart(); // Sound effect
    
    if (!hasCompletedFirstTap) {
      // First time tap - show celebration
      setShowCelebration(true);
      setMascotMood("cheering");
      playCheer();
      trackFirstTap();
      trackCelebration("first_tap");
      localStorage.setItem("toothyquest_first_tap", "true");
    } else {
      // Scroll to adventures section
      const adventuresSection = document.getElementById('adventures');
      if (adventuresSection) {
        adventuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hasCompletedFirstTap, success, playQuestStart, playCheer, trackFirstTap, trackCelebration]);

  const handleCTAHover = useCallback(() => {
    setIsHoveringCTA(true);
    trackCTAHover();
  }, [trackCTAHover]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setHasCompletedFirstTap(true);
    setShowSwipeHint(true);
    setMascotMood("idle");
    
    // Hide swipe hint after a few seconds and scroll
    setTimeout(() => {
      setShowSwipeHint(false);
      const adventuresSection = document.getElementById('adventures');
      if (adventuresSection) {
        adventuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return (
    <>
      {/* Onboarding Flow */}
      <OnboardingFlow isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      
      {/* First Tap Celebration */}
      <FirstTapCelebration isActive={showCelebration} onComplete={handleCelebrationComplete} />
      
      {/* Swipe Hint */}
      <SwipeHint isVisible={showSwipeHint} />

      <section className="relative min-h-screen gradient-sky overflow-hidden flex items-center justify-center">
        <FloatingBubbles />
        
        {/* ToothyQuest Logo - Top left corner, smaller */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 z-20"
        >
          <img
            src={toothyQuestLogo}
            alt="ToothyQuest"
            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
          />
        </motion.div>
        
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["✨", "⭐", "🌟", "💫", "🎮", "🏆", "🎉"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl md:text-3xl"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3 + (i * 0.5),
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            
            {/* Main Mascot - Kid-friendly sticker character */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-6"
            >
              <motion.img
                src={mascotMood === "cheering" ? mascotCelebrating : mascotWaving}
                alt="Toothy - Your friendly dental buddy"
                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-xl cursor-pointer"
                animate={
                  mascotMood === "cheering" 
                    ? { y: [0, -15, 0], scale: [1, 1.1, 1] } 
                    : mascotMood === "waving"
                    ? { rotate: [0, -5, 5, 0] }
                    : { y: [0, -8, 0] }
                }
                transition={{
                  duration: mascotMood === "cheering" ? 0.5 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  trackMascotInteraction("tap");
                  setMascotMood("cheering");
                  playCheer();
                  setTimeout(() => setMascotMood("idle"), 2000);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              
              {/* Mood indicator */}
              <AnimatePresence>
                {mascotMood !== "idle" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 text-3xl"
                  >
                    {mascotMood === "waving" ? "👋" : "🎉"}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sparkle effect when cheering */}
              <AnimatePresence>
                {mascotMood === "cheering" && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute pointer-events-none text-xl"
                        style={{
                          top: `${10 + Math.random() * 80}%`,
                          left: `${10 + Math.random() * 80}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [-5, -20],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        {i % 2 === 0 ? "✨" : "⭐"}
                      </motion.span>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Clear Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Turn brushing & flossing into a{" "}
                <span className="text-gradient-hero">fun daily game</span>{" "}
                for kids
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg mx-auto">
                ToothyQuest helps kids build healthy dental habits through fun quests and rewards.
              </p>
            </motion.div>

            {/* Trust indicators - minimal and subtle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                ✅ Kid-Safe
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                🚫 No Ads
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Ages 3-9
              </span>
            </motion.div>

            {/* Single Primary CTA - Most visible element with pulse animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="relative"
            >
              {/* Pulsing glow behind button */}
              <motion.div
                className="absolute inset-0 gradient-hero rounded-3xl blur-xl opacity-50"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <Button
                variant="hero"
                size="xl"
                onClick={handleStartQuest}
                onMouseEnter={handleCTAHover}
                onMouseLeave={() => setIsHoveringCTA(false)}
                className="relative text-xl md:text-2xl px-10 md:px-14 py-6 md:py-8 shadow-2xl hover:shadow-3xl"
              >
                <motion.span 
                  className="text-2xl mr-2"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎮
                </motion.span>
                Start Today's Quest
                <motion.span
                  className="ml-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </Button>
            </motion.div>

            {/* Subtle helper text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              No sign-up required • Start playing instantly
            </motion.p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
