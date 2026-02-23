import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import FloatingBubbles from "@/components/FloatingBubbles";
import FirstTapCelebration from "@/components/FirstTapCelebration";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import FloatingSparkles from "@/components/FloatingSparkles";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import AdventureStartModal from "@/components/AdventureStartModal";
import TapSparkleArea from "@/components/kid/TapSparkleArea";
import PlayfulBackground from "@/components/kid/PlayfulBackground";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";
import { useMascotEmotionContext } from "@/contexts/MascotEmotionContext";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEngagementAnalytics } from "@/hooks/useEngagementAnalytics";
import { useDailyGreeting } from "@/hooks/useDailyGreeting";
import { useToothyPhrases } from "@/hooks/useToothyPhrases";
import { useTapSpeak } from "@/hooks/useAutoSpeak";
import { useHomeMusic } from "@/hooks/useHomeMusic";
import { useButtonSounds } from "@/hooks/useButtonSounds";
import { unlockAudioContext } from "@/hooks/useAudioManager";
import toothyQuestLogo from "@/assets/toothyquest-logo.png";
import brushingBanner from "@/assets/marketing/banner-brushing-adventures.jpeg";

export const HeroSection = () => {
  const { success } = useHapticFeedback();
  const { playWave, playCheer, playQuestStart, playQuestComplete, playIntroHello } = useMascotSounds();
  const { playTap } = useButtonSounds();
  const { 
    trackFirstTap, 
    trackCTAHover, 
    trackMascotInteraction,
    trackCelebration,
    trackSessionStart 
  } = useEngagementAnalytics();
  const { greeting, isCompleted } = useDailyGreeting();
  const { sayWelcome } = useToothyPhrases();
  
  // Home screen background music
  const {
    start: startMusic,
    stop: stopMusic,
    isPlaying: isMusicPlaying,
    isMuted: musicMuted,
    toggleMute: toggleMusicMute,
  } = useHomeMusic();
  
  // Global mascot emotion context
  const { 
    emotion: globalEmotion, 
    triggerWow, 
    triggerLetsPlay,
  } = useMascotEmotionContext();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuestCelebration, setShowQuestCelebration] = useState(false);
  const [hasCompletedFirstTap, setHasCompletedFirstTap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "waving" | "cheering" | "wiggle">("waving");
  
  // Kid mode: show dirty-to-clean mascot for first-time users
  const [showAdventureModal, setShowAdventureModal] = useState(false);
  
  // Show celebration briefly when quest was just completed this session
  const [justCompleted, setJustCompleted] = useState(false);
  
  // Idle timer for wiggle animation (reduced for performance)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);
  
  // Intro wave animation state
  const [isIntroWaving, setIsIntroWaving] = useState(true);
  const introWaveCompletedRef = useRef(false);
  
  // Track when user left the page (for return detection)
  const lastVisibleTimeRef = useRef<number>(Date.now());
  const RETURN_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes away triggers re-wave
  
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
    // Use the new Toothy phrases hook for consistent cheerful voice
    sayWelcome(greeting.message);
  }, [greeting.message, sayWelcome, isCompleted]);

  // Check if onboarding is complete and start session tracking
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("toothyquest_onboarding_complete");
    const firstTapComplete = localStorage.getItem("toothyquest_first_tap");
    const kidMascotComplete = localStorage.getItem("toothyquest_kid_mascot_done");
    
    // Track session start
    trackSessionStart();
    
    if (!onboardingComplete) {
      // Don't auto-show onboarding - let users start immediately
      localStorage.setItem("toothyquest_onboarding_complete", "true");
    }
    
    if (firstTapComplete) {
      setHasCompletedFirstTap(true);
    }
  }, [trackSessionStart, isCompleted]);

  // Intro wave animation - Toothy waves when first appearing
  useEffect(() => {
    if (introWaveCompletedRef.current || isCompleted) {
      setIsIntroWaving(false);
      return;
    }
    
    const onboardingComplete = localStorage.getItem("toothyquest_onboarding_complete");
    if (!onboardingComplete) {
      // Don't show intro wave during onboarding
      setIsIntroWaving(false);
      return;
    }

    // Play intro hello sound after a short delay (only if user has interacted)
    const soundTimer = setTimeout(() => {
      if (hasInteractedRef.current) {
        playIntroHello();
      }
    }, 400);

    // Transition from waving to idle after 2.5 seconds
    const transitionTimer = setTimeout(() => {
      introWaveCompletedRef.current = true;
      setIsIntroWaving(false);
      setMascotMood("idle");
    }, 2500);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(transitionTimer);
    };
  }, [isCompleted, playIntroHello]);

  // Detect when user returns after being away (visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left - record timestamp
        lastVisibleTimeRef.current = Date.now();
      } else {
        // User returned - check how long they were away
        const timeAway = Date.now() - lastVisibleTimeRef.current;
        
        if (timeAway >= RETURN_THRESHOLD_MS && !isCompleted) {
          const onboardingComplete = localStorage.getItem("toothyquest_onboarding_complete");
          if (onboardingComplete) {
            // Trigger intro wave again
            introWaveCompletedRef.current = false;
            setIsIntroWaving(true);
            setMascotMood("waving");
            
            // Play intro sound if user has interacted before
            if (hasInteractedRef.current) {
              setTimeout(() => playIntroHello(), 400);
            }
            
            // Reset greeting spoken flag so it can speak again
            hasSpokenGreetingRef.current = false;
            
            // Transition back to idle after animation
            setTimeout(() => {
              introWaveCompletedRef.current = true;
              setIsIntroWaving(false);
              setMascotMood("idle");
            }, 2500);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isCompleted, playIntroHello]);
  
  // Listen for first user interaction to trigger greeting voice
  useEffect(() => {
    const handleFirstInteraction = () => {
      // IMPORTANT:
      // We intentionally do NOT use `{ once: true }` here.
      // If the very first tap happens during onboarding, the greeting can't be spoken yet
      // (because onboarding isn't complete), and we still need a later user gesture to
      // trigger the greeting.

      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        // Best-effort unlock as early as possible.
        unlockAudioContext();
      }

      // IMPORTANT: Retry music start on subsequent gestures until it actually starts.
      // Some browsers can still block the first attempt even if it was gesture-triggered.
      if (!musicMuted && !isMusicPlaying) {
        startMusic();
      }

      speakGreetingOnce();

      // Once the greeting has actually been spoken, we can remove listeners.
      if (hasSpokenGreetingRef.current) {
        window.removeEventListener("pointerdown", handleFirstInteraction, true);
        window.removeEventListener("touchstart", handleFirstInteraction, true);
        window.removeEventListener("keydown", handleFirstInteraction, true);
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      capture: true,
      passive: true,
    });
    window.addEventListener("touchstart", handleFirstInteraction, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", handleFirstInteraction, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction, true);
      window.removeEventListener("touchstart", handleFirstInteraction, true);
      window.removeEventListener("keydown", handleFirstInteraction, true);
    };
  }, [speakGreetingOnce, startMusic, isMusicPlaying, musicMuted]);

  // Reset idle timer whenever user interacts - increased delay for performance
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setIsWiggling(false);
    
    // Only set wiggle timer if quest is not completed - increased to 10 seconds
    if (!isCompleted) {
      idleTimerRef.current = setTimeout(() => {
        setIsWiggling(true);
        setMascotMood("wiggle");
        if (hasInteractedRef.current) {
          playWave();
        }
        trackMascotInteraction("idle_wiggle");
        
        setTimeout(() => {
          setIsWiggling(false);
          if (!isCompleted) setMascotMood("idle");
        }, 2500);
      }, 10000); // Increased from 5000 to 10000
    }
  }, [isCompleted, playWave, trackMascotInteraction]);

  // Start idle timer on mount - use passive listeners
  useEffect(() => {
    resetIdleTimer();
    
    const handleInteraction = () => resetIdleTimer();
    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    
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
      // First time tap - show adventure choice modal
      setShowAdventureModal(true);
      localStorage.setItem("toothyquest_first_tap", "true");
      setHasCompletedFirstTap(true);
      trackFirstTap();
    } else {
      // Show adventure modal for returning users too
      setShowAdventureModal(true);
    }
  }, [hasCompletedFirstTap, success, playQuestStart, trackFirstTap]);

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
    // If the first tap happened during onboarding, re-attempt the greeting now
    hasInteractedRef.current = true;
    unlockAudioContext();
    startMusic();
    speakGreetingOnce();
  }, [isCompleted, speakGreetingOnce, startMusic]);


  return (
    <>
      {/* Onboarding Flow */}
      <OnboardingFlow isOpen={showOnboarding} onComplete={handleOnboardingComplete} />

      {/* Adventure Start Modal - Kid/Parent choice */}
      <AdventureStartModal isOpen={showAdventureModal} onClose={() => setShowAdventureModal(false)} />
      
      {/* First Tap Celebration */}
      <FirstTapCelebration isActive={showCelebration} onComplete={handleCelebrationComplete} />
      
      {/* Quest Completion Celebration */}
      <ConfettiCelebration isActive={showQuestCelebration || justCompleted} duration={3000} particleCount={60} />

      <TapSparkleArea className="relative min-h-screen">
        <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
          {/* Hero background image with gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: `url(${brushingBanner})`, filter: 'blur(12px) saturate(1.2)' }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(180deg, hsl(var(--background) / 0.9) 0%, hsl(var(--background) / 0.55) 40%, hsl(var(--background) / 0.45) 60%, hsl(var(--background) / 0.85) 100%)'
            }}
          />
          
          {/* Simplified animated background - reduced intensity */}
          <PlayfulBackground variant={isCompleted ? "stars" : "bubbles"} intensity="light" />
          
          {/* Floating sparkles when completed - reduced count */}
          {isCompleted && <FloatingSparkles count={8} />}
        
        {/* ToothyQuest Logo - Top left corner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 z-20 flex items-center gap-3"
        >
          <img
            src={toothyQuestLogo}
            alt="ToothyQuest"
            width={64}
            height={64}
            fetchPriority="high"
            className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-lg"
          />
          
          {/* Music toggle button - subtle */}
          <motion.button
            onClick={() => {
              toggleMusicMute();
              playTap();
            }}
            className="p-2 rounded-full bg-card/80 shadow-md border border-border/50 hover:bg-card transition-colors"
            whileTap={{ scale: 0.9 }}
            title={musicMuted ? "Unmute background music" : "Mute background music"}
          >
            {musicMuted ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </motion.button>
        </motion.div>
        
        {/* Minimal decorative element - desktop only */}

        <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            
            {/* HEADLINE - Clear value proposition */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-2 md:mb-3 leading-tight"
            >
              Make dentist visits{" "}
              <span className="text-primary">fun & fearless</span>
            </motion.h1>
            
            {/* SUBHEADLINE - Supporting benefit */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 md:mb-6 max-w-lg px-2"
            >
              Games, stories & a friendly mascot help kids ages 3-9 feel brave
            </motion.p>
            
            {/* Main Mascot - Before/After visual transformation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-4"
            >
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
              
              {/* Shiny glow for "after" state - bright and radiant */}
              {isCompleted && (
                <motion.div
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-yellow-200/70 via-white/50 to-primary/40 blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* 3D Container with perspective */}
              <motion.div
                className="relative"
                style={{ perspective: "800px", transformStyle: "preserve-3d" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* 3D Shadow layer - creates depth illusion */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl"
                  style={{
                    transform: "translateZ(-40px) translateY(20px) scale(0.9)",
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    opacity: isCompleted ? [0.6, 0.8, 0.6] : isWiggling ? [0.4, 0.6, 0.4] : [0.3, 0.4, 0.3],
                    scale: isCompleted ? [0.85, 0.95, 0.85] : [0.9, 0.92, 0.9],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Secondary depth shadow */}
                <div
                  className="absolute inset-4 rounded-full opacity-40"
                  style={{
                    background: "radial-gradient(ellipse at 50% 120%, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
                    transform: "translateZ(-20px) translateY(30px) scaleX(1.1) scaleY(0.3)",
                    filter: "blur(12px)",
                  }}
                />
                
                {/* Main mascot using emotion state system */}
                <motion.div
                  initial={isIntroWaving ? { opacity: 0, scale: 0.5, y: 50, rotateX: 30 } : undefined}
                  animate={
                    isIntroWaving
                      ? { 
                          opacity: 1,
                          scale: [0.5, 1.1, 1],
                          y: [50, -10, 0],
                          rotateX: [30, -5, 0],
                          rotateY: [0, -15, 15, -10, 10, -5, 5, 0],
                          rotateZ: [0, -15, 15, -10, 10, -5, 5, 0],
                        }
                      : isWiggling
                      ? { 
                          rotateZ: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0], 
                          rotateY: [0, -8, 8, -8, 8, -4, 4, 0],
                          scale: [1, 1.08, 1.06, 1.08, 1.06, 1.04, 1.04, 1.02, 1.02, 1],
                          y: [0, -5, 5, -5, 5, -3, 3, 0],
                          rotateX: [0, 5, -5, 5, -5, 3, -3, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: isIntroWaving ? 2 : isWiggling ? 1.2 : 2.5,
                    repeat: isIntroWaving ? 0 : isWiggling ? 2 : 0,
                    ease: "easeOut",
                  }}
                  onClick={() => {
                    trackMascotInteraction("tap");
                    triggerWow();
                    playCheer();
                    resetIdleTimer();
                    setTimeout(() => {
                      if (!isCompleted) triggerLetsPlay();
                    }, 3000);
                  }}
                  className="cursor-pointer"
                >
                  {/* ALWAYS visible mascot - use waving as default */}
                  <MascotEmotionState
                    emotion={
                      isCompleted ? "greatJob" :
                      isWiggling ? "letsPlay" :
                      mascotMood === "cheering" ? "celebrating" :
                      isIntroWaving ? "waving" :
                      "waving" // Always show waving state as default for visibility
                    }
                    size="2xl"
                    showSparkles={isCompleted || isWiggling}
                  />
                </motion.div>
                
                {/* Highlight/shine effect for 3D appearance */}
                <motion.div
                  className="absolute top-2 left-1/4 w-1/4 h-1/4 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                    transform: "translateZ(10px)",
                  }}
                  animate={{
                    opacity: isCompleted ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
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

              {/* Intro wave sparkles and "Hello!" speech bubble */}
              <AnimatePresence>
                {isIntroWaving && (
                  <>
                    {/* Large speech bubble with "Hello!" */}
                    <motion.div
                      className="absolute -top-16 md:-top-20 left-1/2 -translate-x-1/2 z-20"
                      initial={{ opacity: 0, scale: 0, y: 30 }}
                      animate={{ 
                        opacity: 1, 
                        scale: [0, 1.1, 1], 
                        y: 0,
                      }}
                      exit={{ opacity: 0, scale: 0, y: -20 }}
                      transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {/* Speech bubble */}
                      <div className="relative bg-card px-5 py-3 rounded-2xl shadow-lg border-2 border-primary/30">
                        <motion.span 
                          className="text-xl md:text-2xl font-bold text-foreground whitespace-nowrap"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Hello! 👋✨
                        </motion.span>
                        {/* Speech bubble tail */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card" />
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-primary/30" />
                      </div>
                    </motion.div>
                    
                    {/* Entrance sparkles */}
                    {[...Array(10)].map((_, i) => (
                      <motion.span
                        key={`intro-sparkle-${i}`}
                        className="absolute pointer-events-none text-2xl"
                        style={{
                          top: `${20 + (i * 8)}%`,
                          left: i % 2 === 0 ? `${-20 + (i % 4) * 5}%` : `${85 + (i % 4) * 5}%`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0.2, 1.5, 1, 0.2],
                          y: [20, -30, -50],
                          rotate: [0, 180, 360],
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 1.5,
                          delay: 0.3 + i * 0.1,
                        }}
                      >
                        {i % 4 === 0 ? "✨" : i % 4 === 1 ? "⭐" : i % 4 === 2 ? "🌟" : "💫"}
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

            {/* Compact speech bubble - only when not completed */}
            {!isCompleted && (
              <motion.div
                key={greeting.message}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="relative mb-4 px-4 py-2 bg-card/90 rounded-2xl shadow-md border border-primary/20 max-w-sm"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-card/90" />
                <p className="text-base md:text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                  <span>Let's have fun!</span>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎮
                  </motion.span>
                </p>
              </motion.div>
            )}
            
            {/* Completed state badge */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 font-bold text-lg rounded-full border-2 border-green-300 shadow-md">
                  ✅ Quest Complete! 🎉
                </span>
              </motion.div>
            )}

            {/* PRIMARY CTA - Large, prominent, single action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="relative"
            >
              {!isCompleted ? (
                <>
                  {/* Large pulsing glow for maximum visibility */}
                  <motion.div
                    className="absolute inset-0 gradient-hero rounded-3xl blur-2xl"
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      opacity: [0.5, 0.7, 0.5] 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  
                  <Button
                    variant="hero"
                    size="xl"
                    onClick={handleStartQuest}
                    onMouseEnter={handleCTAHover}
                    onMouseLeave={() => setIsHoveringCTA(false)}
                    className="relative text-xl sm:text-2xl md:text-3xl px-8 sm:px-12 md:px-16 py-6 sm:py-7 md:py-8 shadow-2xl hover:shadow-3xl font-extrabold tracking-tight"
                  >
                    <motion.span 
                      className="text-2xl sm:text-3xl mr-2 sm:mr-3"
                      animate={{ rotate: [0, -15, 15, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                    Start the Adventure
                    <motion.span
                      className="ml-2 sm:ml-3 text-2xl sm:text-3xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </Button>
                  
                  {/* Secondary sign-up prompt - eye-catching with pulse */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex flex-col items-center gap-3"
                  >
                    <span className="text-base font-medium text-foreground/80">New here?</span>
                    <div className="flex items-center gap-4">
                      <motion.button
                        onClick={() => window.dispatchEvent(new Event('toothyquest:openAuth'))}
                        className="relative inline-flex items-center gap-2 px-6 py-3 bg-accent/20 hover:bg-accent/30 border-2 border-accent rounded-full font-bold text-accent-foreground transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          className="absolute inset-0 rounded-full bg-accent/30"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="relative text-lg">✨ Sign up free</span>
                      </motion.button>
                      <span className="text-foreground/50 font-medium">or</span>
                      <a
                        href="/guest"
                        className="font-bold text-lg text-secondary hover:text-secondary/80 underline underline-offset-4 transition-colors"
                      >
                        try as guest
                      </a>
                    </div>
                  </motion.div>
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
                    Toothy is sparkling! 🎉 Come back tomorrow!
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

            {/* Tap to hear - more visible secondary action */}
            {!isCompleted && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  unlockAudioContext();
                  sayWelcome(greeting.message);
                  resetIdleTimer();
                }}
                className="mt-6 text-base font-medium text-foreground/70 hover:text-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 hover:bg-card/80 border border-primary/20"
              >
                🔊 Tap to hear Toothy speak
              </motion.button>
            )}

            {/* Trust indicators - compact, below CTA - with better visibility */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-sm sm:text-base"
              >
                <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                  ✅ Kid-Safe
                </span>
                <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                  🚫 No Ads
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
                  ⭐ Ages 3-9
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer z-20"
          onClick={() => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-xs text-muted-foreground/70 font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </motion.div>

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
      </TapSparkleArea>
    </>
  );
};

export default HeroSection;
