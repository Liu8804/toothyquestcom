import { useState, useEffect, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";

import AdventuresSection from "@/components/AdventuresSection";
import StoryModeSection from "@/components/StoryModeSection";
import DentalHelpersWorld from "@/components/DentalHelpersWorld";
import BracesCareSection from "@/components/BracesCareSection";
import FunFactsSection from "@/components/FunFactsSection";
import PricingSection from "@/components/PricingSection";
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";
import AuthModal from "@/components/AuthModal";
import ParentDashboard from "@/components/ParentDashboard";
import MotivationalPopup from "@/components/MotivationalPopup";
import StreakTracker from "@/components/StreakTracker";
import FloatingSparkles from "@/components/FloatingSparkles";
import FloatingUnlockCTA from "@/components/FloatingUnlockCTA";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SplashScreen from "@/components/SplashScreen";
import FreePreviewBanner from "@/components/FreePreviewBanner";
import DentalTipsChatbot from "@/components/DentalTipsChatbot";
import FloatingToothPets from "@/components/FloatingToothPets";
import DailyTaskModal from "@/components/DailyTaskModal";
import StreakRecoveryModal from "@/components/StreakRecoveryModal";
import DailyBonusModal from "@/components/DailyBonusModal";
import RewardsPanel from "@/components/rewards/RewardsPanel";
import SparkMeter from "@/components/rewards/SparkMeter";
import PriceChangeAnnouncement from "@/components/PriceChangeAnnouncement";
import ReferralProgram from "@/components/ReferralProgram";
import AdminDiagnosticsPanel from "@/components/admin/AdminDiagnosticsPanel";
import WorldSelector from "@/components/worlds/WorldSelector";
import VolumeControlPanel from "@/components/VolumeControlPanel";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { usePageViewTracking } from "@/hooks/useAnalytics";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useDailyTask } from "@/hooks/useDailyTask";
import { useStreak } from "@/hooks/useStreak";
import { useStreakRecovery } from "@/hooks/useStreakRecovery";
import { useDailyReminder } from "@/hooks/useDailyReminder";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogIn, MessageCircle, Trophy, Mic, Volume2, Sparkles } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";
import OwnerDiagnosticsPanel from "@/components/admin/OwnerDiagnosticsPanel";

const Index = () => {
  useAudioUnlock();

  const { user, loading } = useAuth();
  const { isPurchased } = usePurchase();
  const { selectedChild } = useQuestProgress();
  const { 
    totalPoints, 
    streak, 
    unlockedPets, 
    dailyBonusClaimed, 
    claimDailyBonus 
  } = useRewardsSystem(selectedChild?.id);
  
  // Use the consolidated daily task hook
  const { hasCompletedToday: taskCompleted } = useDailyTask(selectedChild?.id);
  
  // Streak and recovery hooks
  const { currentStreak, lastActivityDate, longestStreak, refetch: refetchStreak } = useStreak();
  const { canRecover, checkStreakBroken } = useStreakRecovery();
  const { scheduleReminderCheck } = useDailyReminder();
  
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showDentalChat, setShowDentalChat] = useState(false);
  const [showDailyTask, setShowDailyTask] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [showStreakRecovery, setShowStreakRecovery] = useState(false);
  const [previousStreakValue, setPreviousStreakValue] = useState(0);

  const openVoiceQuiz = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("toothyquest:openVoiceQuiz"));
  }, []);

  // Track page views
  usePageViewTracking();

  // Check if we've shown splash today (only show once per session)
  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  }, []);

  // Check for broken streak and show recovery option
  useEffect(() => {
    if (!showSplash && user && selectedChild && !taskCompleted && lastActivityDate) {
      const isStreakBroken = checkStreakBroken(lastActivityDate);
      if (isStreakBroken && canRecover && longestStreak > 0) {
        // Store the previous streak value before it resets
        setPreviousStreakValue(longestStreak);
        // Show recovery modal before daily task
        const timer = setTimeout(() => {
          setShowStreakRecovery(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [showSplash, user, selectedChild, taskCompleted, lastActivityDate, checkStreakBroken, canRecover, longestStreak]);

  // STEP 3: Auto-start daily task after splash (if user is logged in with a child)
  useEffect(() => {
    if (!showSplash && !showStreakRecovery && user && selectedChild && !taskCompleted) {
      // Show daily task modal immediately after splash
      const timer = setTimeout(() => {
        setShowDailyTask(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showSplash, showStreakRecovery, user, selectedChild, taskCompleted]);

  // Show daily bonus ONLY after task completion
  useEffect(() => {
    if (!showSplash && !showDailyTask && !showStreakRecovery && user && selectedChild && taskCompleted && !dailyBonusClaimed) {
      const timer = setTimeout(() => {
        setShowDailyBonus(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, showDailyTask, showStreakRecovery, user, selectedChild, taskCompleted, dailyBonusClaimed]);

  // Schedule daily reminder checks when app is open
  useEffect(() => {
    if (user && selectedChild && !taskCompleted) {
      return scheduleReminderCheck(taskCompleted, selectedChild.name);
    }
  }, [user, selectedChild, taskCompleted, scheduleReminderCheck]);

  // Handle daily task completion
  const handleTaskComplete = useCallback((xpEarned: number) => {
    console.log(`Daily task completed! +${xpEarned} XP`);
    // Close task modal
    setShowDailyTask(false);
    // Refetch streak data
    refetchStreak();
    // Show daily bonus after a short delay
    if (!dailyBonusClaimed) {
      setTimeout(() => {
        setShowDailyBonus(true);
      }, 1000);
    }
  }, [dailyBonusClaimed, refetchStreak]);

  // Handle streak recovery completion
  const handleStreakRecovered = useCallback((newStreak: number) => {
    console.log(`Streak recovered to ${newStreak} days!`);
    refetchStreak();
  }, [refetchStreak]);

  const handleStreakRecoveryClose = useCallback(() => {
    setShowStreakRecovery(false);
    // After closing recovery, show daily task
    if (!taskCompleted) {
      setTimeout(() => {
        setShowDailyTask(true);
      }, 500);
    }
  }, [taskCompleted]);

  // Show motivational popup after 30 seconds on the page (only if task completed)
  useEffect(() => {
    if (showSplash || showDailyTask) return;
    
    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const hasSeenToday = localStorage.getItem('motivationShownDate') === today;
      if (!hasSeenToday && taskCompleted) {
        setShowMotivation(true);
        localStorage.setItem('motivationShownDate', today);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [showSplash, showDailyTask, taskCompleted]);

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <main className="min-h-screen relative">
        {/* Free Preview Banner (only shows when not purchased) */}
        <FreePreviewBanner />
        
        {/* Subtle floating sparkles background */}
        <FloatingSparkles count={10} className="fixed inset-0 z-0 opacity-50" />

        {/* Floating Tooth Pet Companions */}
        {user && selectedChild && (
          <FloatingToothPets 
            unlockedPets={unlockedPets}
            activePetId={unlockedPets[unlockedPets.length - 1] || "toothy"}
          />
        )}

        {/* Auth button, language switcher and streak tracker - floating nav - moved down on mobile to avoid blocking content */}
        <div className="fixed top-[280px] md:top-3 right-2 md:right-3 z-40 flex items-center gap-1 sm:gap-1.5 bg-card/95 backdrop-blur-md rounded-full px-2 py-1 shadow-lg border border-border/50 scale-90 md:scale-100">
          {/* Volume Control */}
          <Button
            onClick={() => setShowVolumeControl(true)}
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 sm:w-9 sm:h-9"
          >
            <Volume2 className="w-4 h-4" />
          </Button>

          {/* Sparkle Points */}
          {user && selectedChild && (
            <Button
              onClick={() => setShowRewards(true)}
              variant="ghost"
              size="sm"
              className="rounded-full gap-1 px-2"
            >
              <Trophy className="w-4 h-4 text-star" />
              <span className="font-bold text-foreground text-sm">{totalPoints}</span>
            </Button>
          )}

          {/* Quick Voice access */}
          <Button
            onClick={openVoiceQuiz}
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 sm:w-9 sm:h-9"
          >
            <Mic className="w-4 h-4" />
          </Button>

          <LanguageSwitcher />
          <StreakTracker />
          
          {!loading && (
            <>
              {user ? (
                <Button
                  onClick={() => setShowDashboard(true)}
                  size="sm"
                  className="rounded-full gap-1.5 px-3 relative"
                >
                  {isPurchased && (
                    <PremiumBadge variant="small" className="absolute -top-1 -right-1" />
                  )}
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Dashboard</span>
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="rounded-full gap-1.5 px-3"
                  >
                    <Link to="/guest">
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Guest</span>
                    </Link>
                  </Button>

                  <Button
                    onClick={() => setShowAuth(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5 px-3"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Login</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Referral Program - separate from nav */}
        {user && (
          <div className="fixed top-3 left-3 z-40">
            <ReferralProgram />
          </div>
        )}

        <HeroSection />
        <WorldSelector />
        <AboutSection />
        <FeaturesSection />
        
        <AdventuresSection />
        <StoryModeSection />
        <DentalHelpersWorld />
        <BracesCareSection />
        <FunFactsSection />
        <PricingSection />
        <PreviewSection />
        <FooterSection />

        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        {showDashboard && <ParentDashboard onClose={() => setShowDashboard(false)} />}
        <MotivationalPopup isOpen={showMotivation} onClose={() => setShowMotivation(false)} />
        <FloatingUnlockCTA />
        
        {/* Streak Recovery Modal - shows if streak was broken */}
        <StreakRecoveryModal
          isOpen={showStreakRecovery}
          onClose={handleStreakRecoveryClose}
          onRecovered={handleStreakRecovered}
          currentStreak={currentStreak}
          previousStreak={previousStreakValue || longestStreak}
          childName={selectedChild?.name}
        />

        {/* Daily Task Modal - shows first after splash */}
        <DailyTaskModal
          isOpen={showDailyTask}
          onClose={() => setShowDailyTask(false)}
          onTaskComplete={handleTaskComplete}
          childId={selectedChild?.id}
          childName={selectedChild?.name}
        />
        
        {/* Daily Bonus Modal - only shows AFTER task completion */}
        <DailyBonusModal
          isOpen={showDailyBonus}
          onClose={() => setShowDailyBonus(false)}
          onClaim={claimDailyBonus}
          streak={currentStreak || streak}
          childName={selectedChild?.name}
        />
        
        {/* Rewards Panel */}
        <RewardsPanel
          isOpen={showRewards}
          onClose={() => setShowRewards(false)}
          childId={selectedChild?.id}
        />
        
        {/* Floating Chat Button */}
        <Button
          onClick={() => setShowDentalChat(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-secondary hover:scale-110 transition-transform"
          size="icon"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
        
        {/* Dental Tips Chatbot */}
        <DentalTipsChatbot 
          isOpen={showDentalChat} 
          onClose={() => setShowDentalChat(false)}
        />

        {/* Price Change Announcement */}
        <PriceChangeAnnouncement />

        {/* Admin-only diagnostics (no sensitive data) */}
        <AdminDiagnosticsPanel />

        {/* Owner diagnostics (for your test accounts) */}
        <OwnerDiagnosticsPanel />
        
        {/* Volume Control Panel */}
        <VolumeControlPanel 
          isOpen={showVolumeControl} 
          onClose={() => setShowVolumeControl(false)} 
        />
      </main>
    </>
  );
};

export default Index;
