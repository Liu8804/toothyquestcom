import { useState, useEffect, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FeaturesSection from "@/components/FeaturesSection";
import AdventuresSection from "@/components/AdventuresSection";
import StoryModeSection from "@/components/StoryModeSection";
import BracesCareSection from "@/components/BracesCareSection";
import FunFactsSection from "@/components/FunFactsSection";
import PricingSection from "@/components/PricingSection";
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";
import AuthModal from "@/components/AuthModal";
import ParentDashboard from "@/components/ParentDashboard";
import MotivationalPopup from "@/components/MotivationalPopup";
import DailyReward from "@/components/DailyReward";
import StreakTracker from "@/components/StreakTracker";
import FloatingSparkles from "@/components/FloatingSparkles";
import FloatingUnlockCTA from "@/components/FloatingUnlockCTA";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SplashScreen from "@/components/SplashScreen";
import FreePreviewBanner from "@/components/FreePreviewBanner";
import DentalTipsChatbot from "@/components/DentalTipsChatbot";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { usePageViewTracking } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn, MessageCircle } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const { isPurchased } = usePurchase();
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showDentalChat, setShowDentalChat] = useState(false);

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

  // Show motivational popup after 30 seconds on the page
  useEffect(() => {
    if (showSplash) return; // Don't start timer until splash is done
    
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

        {/* Auth button, language switcher and streak tracker in top right */}
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <LanguageSwitcher />
          <StreakTracker />
          {!loading && (
            <>
              {user ? (
                <Button
                  onClick={() => setShowDashboard(true)}
                  className="rounded-full gap-2 shadow-card"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuth(true)}
                  variant="outline"
                  className="rounded-full gap-2 bg-card/80 backdrop-blur-sm shadow-card"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Parent Login</span>
                </Button>
              )}
            </>
          )}
        </div>

        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <AdventuresSection />
        <StoryModeSection />
        <BracesCareSection />
        <FunFactsSection />
        <PricingSection />
        <PreviewSection />
        <FooterSection />

        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        {showDashboard && <ParentDashboard onClose={() => setShowDashboard(false)} />}
        <MotivationalPopup isOpen={showMotivation} onClose={() => setShowMotivation(false)} />
        <DailyReward />
        <FloatingUnlockCTA />
        
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
      </main>
    </>
  );
};

export default Index;
