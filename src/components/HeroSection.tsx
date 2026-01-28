import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import FloatingBubbles from "@/components/FloatingBubbles";
import FirstTapCelebration from "@/components/FirstTapCelebration";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import FloatingSparkles from "@/components/FloatingSparkles";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEngagementAnalytics } from "@/hooks/useEngagementAnalytics";
import { useDailyGreeting } from "@/hooks/useDailyGreeting";
import { useQuestVoice } from "@/hooks/useQuestVoice";
import toothyQuestLogo from "@/assets/toothyquest-logo.png";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";

export const HeroSection = () => {
  const { success } = useHapticFeedback();
  const { playWave, playCheer, playQuestStart, playQuestComplete } = useMascotSounds();
  const { 
    trackFirstTap, 
    trackCTAHover, 
    trackMascotInteraction,
    trackCelebration,
    trackSessionStart 
  } = useEngagementAnalytics();
  const { greeting, isCompleted, markComplete } = useDailyGreeting();
  const { speak: speakGreeting } = useQuestVoice();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuestCelebration, setShowQuestCelebration] = useState(false);
  const [hasCompletedFirstTap, setHasCompletedFirstTap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "waving" | "cheering" | "wiggle">("idle");
  
  // Show celebration briefly when quest was just completed this session
  const [justCompleted, setJustCompleted] = useState(false);
  
  // Idle timer for wiggle animation
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);
  
  // Track if greeting has been spoken this session
  const hasSpokenGreetingRef = useRef(false);
  
  // Track if user has interacted (needed for audio unlock)
  const hasInteractedRef = useRef(false);

  // Speak greeting after first user interaction (respects browser autoplay policy)
  const speakGreetingOnce = useCallback(() => {
    if (hasSpokenGreetingRef.current || isCompleted) return;
    const onboardingComplete = localStorage.getItem("toothyquest_onboarding_complete");
    if (!onboardingComplete) return;
    
    hasSpokenGreetingRef.current = true;
    // Short delay after interaction to let audio context unlock
    setTimeout(() => {
      speakGreeting(greeting.message, "curious");
    }, 300);
  }, [greeting.message, speakGreeting, isCompleted]);

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
  
  // Listen for first user interaction to trigger greeting voice
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;
      speakGreetingOnce();
    };
    
    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [speakGreetingOnce]);

  // Reset idle timer whenever user interacts
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setIsWiggling(false);
    
    // Only set wiggle timer if quest is not completed
    if (!isCompleted) {
      idleTimerRef.current = setTimeout(() => {
        setIsWiggling(true);
        setMascotMood("wiggle");
        playWave(); // Play a gentle sound to get attention
        trackMascotInteraction("idle_wiggle");
        
        // Stop wiggling after 3 seconds (extended for better visibility)
        setTimeout(() => {
          setIsWiggling(false);
          if (!isCompleted) setMascotMood("idle");
        }, 3000);
      }, 5000); // 5 seconds of inactivity
    }
  }, [isCompleted, playWave, trackMascotInteraction]);

  // Start idle timer on mount and reset on any interaction
  useEffect(() => {
    resetIdleTimer();
    
    // Add global interaction listeners
    const handleInteraction = () => resetIdleTimer();
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [resetIdleTimer]);

  // Play completion sound when quest is completed
  useEffect(() => {
    if (isCompleted && justCompleted) {
      playQuestComplete();
    }
  }, [isCompleted, justCompleted, playQuestComplete]);

  // Mascot wave animation when hovering CTA
  useEffect(() => {
    if (isHoveringCTA && !isCompleted) {
      setMascotMood("waving");
      playWave();
      trackMascotInteraction("wave");
    } else if (!isCompleted && !isWiggling) {
      setMascotMood("idle");
    }
  }, [isHoveringCTA, isCompleted, isWiggling, playWave, trackMascotInteraction]);

  // Set cheering mood when quest is completed
  useEffect(() => {
    if (isCompleted) {
      setMascotMood("cheering");
    }
  }, [isCompleted]);

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
      // Scroll to adventures section to start the quest
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
    setMascotMood("idle");
    
    // Scroll to adventures section
    setTimeout(() => {
      const adventuresSection = document.getElementById('adventures');
      if (adventuresSection) {
        adventuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
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
      
      {/* Quest Completion Celebration */}
      <ConfettiCelebration isActive={showQuestCelebration || justCompleted} duration={3000} particleCount={60} />

      <section className="relative min-h-screen gradient-sky overflow-hidden flex items-center justify-center">
        <FloatingBubbles />
        
        {/* Floating sparkles when completed */}
        {isCompleted && <FloatingSparkles count={20} />}
        
        {/* ToothyQuest Logo - Top left corner */}
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
        
        {/* Decorative floating elements - reduced for cleaner look */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["✨", "⭐", "🌟", "💫"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl md:text-3xl"
              style={{
                left: `${15 + (i * 20)}%`,
                top: `${10 + (i % 2) * 15}%`,
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
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            
            {/* Main Mascot - Large and central with before/after states */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-4"
            >
              {/* Dull overlay for "before" state - shows when not completed */}
              {!isCompleted && !isWiggling && (
                <div className="absolute inset-0 pointer-events-none z-10 mix-blend-multiply opacity-20 bg-gray-400 rounded-full" />
              )}
              
              {/* Enhanced wiggle glow effect - attention grabbing */}
              <AnimatePresence>
                {isWiggling && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0.4, 0.8, 0.4], 
                      scale: [1, 1.3, 1],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary/50 via-yellow-300/40 to-pink-300/50 blur-3xl"
                  />
                )}
              </AnimatePresence>
              
              {/* Secondary pulsing ring during wiggle */}
              <AnimatePresence>
                {isWiggling && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: [0, 0.6, 0], 
                      scale: [0.9, 1.4, 1.6],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 -z-20 rounded-full border-4 border-primary/40"
                  />
                )}
              </AnimatePresence>
              
              {/* Shiny glow for "after" state */}
              {isCompleted && (
                <motion.div
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-yellow-200/60 via-white/40 to-primary/30 blur-2xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <motion.img
                src={isCompleted ? mascotCelebrating : mascotMood === "cheering" ? mascotCelebrating : mascotMood === "waving" ? mascotWaving : mascotMain}
                alt="Toothy - Your friendly dental buddy"
                className={`w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-xl cursor-pointer transition-all duration-300 ${
                  isCompleted ? "brightness-110 saturate-110" : isWiggling ? "brightness-105 saturate-105" : "brightness-95 saturate-90"
                }`}
                animate={
                  isWiggling
                    ? { 
                        rotate: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0], 
                        scale: [1, 1.08, 1.06, 1.08, 1.06, 1.04, 1.04, 1.02, 1.02, 1],
                        y: [0, -5, 5, -5, 5, -3, 3, 0]
                      }
                    : isCompleted || mascotMood === "cheering"
                    ? { y: [0, -12, 0], scale: [1, 1.08, 1] }
                    : mascotMood === "waving"
                    ? { rotate: [0, -8, 8, -8, 0] }
                    : { y: [0, -6, 0], scale: [1, 1.01, 1] }
                }
                transition={{
                  duration: isWiggling ? 1.2 : mascotMood === "cheering" || isCompleted ? 0.8 : 2.5,
                  repeat: isWiggling ? 2 : Infinity,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  trackMascotInteraction("tap");
                  setMascotMood("cheering");
                  playCheer();
                  resetIdleTimer();
                  setTimeout(() => {
                    if (!isCompleted) setMascotMood("idle");
                  }, 2000);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              
              {/* Attention-grabbing sparkles during wiggle */}
              <AnimatePresence>
                {isWiggling && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={`wiggle-sparkle-${i}`}
                        className="absolute pointer-events-none text-2xl"
                        style={{
                          top: `${10 + (i * 12)}%`,
                          left: i % 2 === 0 ? `${-15 - (i % 3) * 5}%` : `${90 + (i % 3) * 5}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0.3, 1.3, 1, 0.3],
                          y: [0, -20, -30],
                          rotate: [0, 180, 360],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 1,
                          repeat: 2,
                          delay: i * 0.1,
                        }}
                      >
                        {i % 3 === 0 ? "✨" : i % 3 === 1 ? "⭐" : "💫"}
                      </motion.span>
                    ))}
                  </>
                )}
              </AnimatePresence>
              
              {/* Sparkle effects around mascot when completed */}
              <AnimatePresence>
                {isCompleted && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={`sparkle-${i}`}
                        className="absolute pointer-events-none text-2xl"
                        style={{
                          top: `${10 + (i * 15)}%`,
                          left: i % 2 === 0 ? "-10%" : "85%",
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [-5, -15, -5],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        ✨
                      </motion.span>
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Greeting emoji indicator */}
              <motion.div
                key={greeting.emoji}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 text-4xl"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {greeting.emoji}
                </motion.span>
              </motion.div>

              {/* Cheering sparkle effects */}
              <AnimatePresence>
                {mascotMood === "cheering" && !isCompleted && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute pointer-events-none text-xl"
                        style={{
                          top: `${5 + Math.random() * 90}%`,
                          left: `${5 + Math.random() * 90}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [-5, -25],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      >
                        {i % 2 === 0 ? "✨" : "⭐"}
                      </motion.span>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Today's Mission Label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded-full border border-primary/20">
                🦷 {isCompleted ? "Quest Complete!" : "Today's Brushing Quest"}
              </span>
            </motion.div>

            {/* Speech Bubble with Dynamic Greeting */}
            <motion.div
              key={greeting.message}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative mb-8 px-6 py-4 bg-card rounded-3xl shadow-lg border-2 border-primary/20 max-w-md"
            >
              {/* Speech bubble pointer */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-card" />
              <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                {greeting.message}
              </p>
            </motion.div>

            {/* Primary CTA - HELP TOOTHY or Completed State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="relative"
            >
              {!isCompleted ? (
                <>
                  {/* Pulsing glow behind button */}
                  <motion.div
                    className="absolute inset-0 gradient-hero rounded-3xl blur-xl opacity-50"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={handleStartQuest}
                    onMouseEnter={handleCTAHover}
                    onMouseLeave={() => setIsHoveringCTA(false)}
                    className="relative text-2xl md:text-3xl px-12 md:px-16 py-7 md:py-8 shadow-2xl hover:shadow-3xl font-extrabold"
                  >
                    <motion.span 
                      className="text-3xl mr-3"
                      animate={{ rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🦷
                    </motion.span>
                    HELP TOOTHY
                    <motion.span
                      className="ml-3 text-3xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </Button>
                </>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* Shiny trophy with glow */}
                  <motion.div
                    className="relative"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-yellow-300/40 rounded-full blur-xl -z-10"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-6xl">🏆</span>
                  </motion.div>
                  
                  <p className="text-lg text-foreground font-bold">
                    Quest complete! See you tomorrow! 💙
                  </p>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const adventuresSection = document.getElementById('adventures');
                      if (adventuresSection) {
                        adventuresSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="mt-2"
                  >
                    Explore more games 🎮
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Trust indicators - minimal */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 mt-8"
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
                  Ages 3-7
                </span>
              </motion.div>
            )}
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
