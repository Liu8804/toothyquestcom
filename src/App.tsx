import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PurchaseProvider } from "@/hooks/usePurchase";
import { useAudioUnlock } from "@/hooks/useAudioUnlock";
import { useRouteMusicController } from "@/hooks/useRouteMusicController";
import { MascotEmotionProvider } from "@/contexts/MascotEmotionContext";
import { TesterWelcomeModal } from "@/components/tester/TesterWelcomeModal";
import { TesterExpiryModal } from "@/components/tester/TesterExpiryModal";
import { TesterDay6Reminder } from "@/components/tester/TesterDay6Reminder";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import Install from "./pages/Install";
import Redeem from "./pages/Redeem";
import TesterInvite from "./pages/TesterInvite";
import BecomeTester from "./pages/BecomeTester";
import AppPrivacy from "./pages/AppPrivacy";
import AppStoreChecklist from "./pages/AppStoreChecklist";
import NotFound from "./pages/NotFound";
import Guest from "./pages/Guest";

// Component that unlocks AudioContext on first user interaction
const AudioUnlocker = ({ children }: { children: React.ReactNode }) => {
  useAudioUnlock();
  return <>{children}</>;
};

// Component that controls music based on route
const RouteMusicController = ({ children }: { children: React.ReactNode }) => {
  useRouteMusicController();
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PurchaseProvider>
        <MascotEmotionProvider defaultEmotion="letsPlay" autoResetDelay={4000}>
          <TooltipProvider>
            <AudioUnlocker>
              <Toaster />
              <Sonner />
              <TesterWelcomeModal />
              <TesterExpiryModal />
              <TesterDay6Reminder />
              <BrowserRouter>
                <RouteMusicController>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/guest" element={<Guest />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-canceled" element={<PaymentCanceled />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/redeem" element={<Redeem />} />
                    <Route path="/tester-invite" element={<TesterInvite />} />
                    <Route path="/become-tester" element={<BecomeTester />} />
                    <Route path="/app-privacy" element={<AppPrivacy />} />
                    <Route path="/app-store-checklist" element={<AppStoreChecklist />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </RouteMusicController>
              </BrowserRouter>
            </AudioUnlocker>
          </TooltipProvider>
        </MascotEmotionProvider>
      </PurchaseProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
