import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import AdventuresSection from "@/components/AdventuresSection";
import StoryModeSection from "@/components/StoryModeSection";
import FunFactsSection from "@/components/FunFactsSection";
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";
import AuthModal from "@/components/AuthModal";
import ParentDashboard from "@/components/ParentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, LogIn } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Auth button in top right */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
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
      <AdventuresSection />
      <StoryModeSection />
      <FunFactsSection />
      <PreviewSection />
      <FooterSection />

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      {showDashboard && <ParentDashboard onClose={() => setShowDashboard(false)} />}
    </main>
  );
};

export default Index;
