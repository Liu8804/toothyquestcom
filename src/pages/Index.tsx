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
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, MessageCircle, Trophy, Mic, Volume2 } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";

const Index = () => {
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
  
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showDentalChat, setShowDentalChat] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

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

  // Show daily bonus after splash if not claimed
  useEffect(() => {
    if (!showSplash && user && selectedChild && !dailyBonusClaimed) {
      const timer = setTimeout(() => {
        setShowDailyBonus(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSplash, user, selectedChild, dailyBonusClaimed]);

  // Show motivational popup after 30 seconds on the page
  useEffect(() => {
    if (showSplash) return;
    
    const timer = setTimeout(() => {
      const hasSeenToday = localStorage.getItem('motivationShownDate') === new Date().toDateString();
      if (!hasSeenToday) {
        setShowMotivation(true);
        localStorage.setItem('motivationShownDate', new Date().toDateString());
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [showSplash]);

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

        {/* Auth button, language switcher and streak tracker - floating nav - positioned to avoid blocking content */}
        <div className="fixed top-16 md:top-3 right-2 md:right-3 z-40 flex items-center gap-1 sm:gap-1.5 bg-card/95 backdrop-blur-md rounded-full px-2 py-1 shadow-lg border border-border/50 scale-90 md:scale-100">
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
                <Button
                  onClick={() => setShowAuth(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 px-3"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Login</span>
                </Button>
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
        
        {/* Daily Bonus Modal */}
        <DailyBonusModal
          isOpen={showDailyBonus}
          onClose={() => setShowDailyBonus(false)}
          onClaim={claimDailyBonus}
          streak={streak}
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
