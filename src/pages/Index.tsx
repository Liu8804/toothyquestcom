import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import AdventuresSection from "@/components/AdventuresSection";
import StoryModeSection from "@/components/StoryModeSection";
import DentalHelpersWorld from "@/components/DentalHelpersWorld";
import BracesCareSection from "@/components/BracesCareSection";
import FunFactsSection from "@/components/FunFactsSection";
// PricingSection moved to dedicated page - not shown on home screen
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";
import AuthModal from "@/components/AuthModal";
import ParentDashboard from "@/components/ParentDashboard";
import MotivationalPopup from "@/components/MotivationalPopup";
import StreakTracker from "@/components/StreakTracker";
import FloatingSparkles from "@/components/FloatingSparkles";
// FloatingUnlockCTA removed from home - let users explore first
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SplashScreen from "@/components/SplashScreen";
import DentalTipsChatbot from "@/components/DentalTipsChatbot";
import DailyTaskModal from "@/components/DailyTaskModal";
import StreakRecoveryModal from "@/components/StreakRecoveryModal";
import DailyBonusModal from "@/components/DailyBonusModal";
import RewardsPanel from "@/components/rewards/RewardsPanel";
// PriceChangeAnnouncement removed from home - show after user engagement
import WorldSelector from "@/components/worlds/WorldSelector";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { usePageViewTracking } from "@/hooks/useAnalytics";
import { useRewardsSystem } from "@/hooks/useRewardsSystem";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useHomeMusic } from "@/hooks/useHomeMusic";
import { useDailyTask } from "@/hooks/useDailyTask";
import { useStreak } from "@/hooks/useStreak";
import { useStreakRecovery } from "@/hooks/useStreakRecovery";
import { useDailyReminder } from "@/hooks/useDailyReminder";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, MessageCircle, Trophy } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";
import OwnerDiagnosticsPanel from "@/components/admin/OwnerDiagnosticsPanel";
import { useClinics } from "@/hooks/useClinics";

const Index = () => {
  const navigate = useNavigate();
  useAudioUnlock();

  const { user, loading } = useAuth();
  const { isPurchased } = usePurchase();
  const { selectedChild } = useQuestProgress();
  const { 
    totalPoints, 
    streak, 
    dailyBonusClaimed, 
    claimDailyBonus 
  } = useRewardsSystem(selectedChild?.id);
  
  // Home screen background music (tracked for potential use)
  useHomeMusic();
  
  // Use the consolidated daily task hook
  const { hasCompletedToday: taskCompleted } = useDailyTask(selectedChild?.id);
  
  // Streak and recovery hooks
  const { currentStreak, lastActivityDate, longestStreak, refetch: refetchStreak } = useStreak();
  const { canRecover, checkStreakBroken } = useStreakRecovery();
  const { scheduleReminderCheck } = useDailyReminder();
  const { favoriteClinicData } = useClinics();

  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showDentalChat, setShowDentalChat] = useState(false);
  const [showDailyTask, setShowDailyTask] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showStreakRecovery, setShowStreakRecovery] = useState(false);
  const [previousStreakValue, setPreviousStreakValue] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Track page views
  usePageViewTracking();

  // Listen for auth modal open event from HeroSection
  useEffect(() => {
    const handleOpenAuth = () => setShowAuth(true);
    window.addEventListener('toothyquest:openAuth', handleOpenAuth);
    return () => window.removeEventListener('toothyquest:openAuth', handleOpenAuth);
  }, []);

  // Auto-hide nav bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50;
      
      if (currentScrollY > lastScrollY.current + scrollThreshold) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - scrollThreshold) {
        setIsNavVisible(true);
      }
      
      if (currentScrollY < 100) {
        setIsNavVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        {/* Subtle floating sparkles background - reduced for cleaner look */}
        <FloatingSparkles count={3} className="fixed inset-0 z-0 opacity-30" />

        {/* Phase 2 Prototype Links - Design Review Only */}
        <div className="fixed top-3 left-3 z-50 flex flex-col gap-1.5">
          <a href="/quest-hybrid-demo" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/90 text-primary-foreground rounded-full text-xs font-bold shadow-lg backdrop-blur-sm hover:scale-105 transition-transform">
            ✨ Hybrid Quest Prototype
          </a>
          <a href="/quest-float-demo" className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/90 text-secondary-foreground rounded-full text-xs font-bold shadow-lg backdrop-blur-sm hover:scale-105 transition-transform">
            🎈 Floating Quest
          </a>
          <a href="/quest-map-demo" className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/90 text-secondary-foreground rounded-full text-xs font-bold shadow-lg backdrop-blur-sm hover:scale-105 transition-transform">
            🗺️ Trail Map
          </a>
        </div>

        {/* Simplified floating nav - bottom on mobile, top-right on desktop */}
        <div 
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:top-3 md:right-3 z-40 flex items-center gap-1.5 bg-card/95 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-border/50 transition-all duration-300 ${
            isNavVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 md:translate-y-0 md:-translate-y-20 opacity-0 pointer-events-none'
          }`}
        >
          {/* Sparkle Points - only for logged in users */}
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

          <StreakTracker />
          <LanguageSwitcher />
          
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
                <Button
                  onClick={() => setShowAuth(true)}
                  size="sm"
                  className="rounded-full gap-1.5 px-3"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm">Sign In</span>
                </Button>
              )}
            </>
          )}
        </div>

        <HeroSection />
        <WorldSelector />
        
        {/* Visit Your Clinic CTA */}
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Button
            onClick={() => navigate("/clinics")}
            variant="outline"
            className="w-full rounded-2xl py-4 h-auto flex items-center gap-3 border-primary/30 hover:bg-primary/5"
          >
            <span className="text-2xl">🏥</span>
            <div className="text-left flex-1">
              <span className="font-bold text-foreground block">
                {favoriteClinicData ? `Visit ${favoriteClinicData.name}` : "Visit Your Clinic"}
              </span>
              <span className="text-xs text-muted-foreground">
                {favoriteClinicData ? "See your clinic's tips & info" : "Find and save your dental clinic"}
              </span>
            </div>
            <span className="text-lg">→</span>
          </Button>
        </div>

        <AboutSection />
        <FeaturesSection />
        
        <AdventuresSection />
        <StoryModeSection />
        <DentalHelpersWorld />
        <BracesCareSection />
        <FunFactsSection />
        {/* Pricing moved to separate page - users explore app first */}
        <PreviewSection />
        <FooterSection />

        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        {showDashboard && <ParentDashboard onClose={() => setShowDashboard(false)} />}
        <MotivationalPopup isOpen={showMotivation} onClose={() => setShowMotivation(false)} />
        {/* FloatingUnlockCTA removed - users explore first */}
        
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

        {/* Price announcements removed from home */}

        {/* Owner diagnostics (for your test accounts) */}
        <OwnerDiagnosticsPanel />
      </main>
    </>
  );
};

export default Index;
