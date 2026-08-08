import { lazy, Suspense } from "react";
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

// Lazy-loaded routes for better initial load performance
const Admin = lazy(() => import("./pages/Admin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const Install = lazy(() => import("./pages/Install"));
const Redeem = lazy(() => import("./pages/Redeem"));
const TesterInvite = lazy(() => import("./pages/TesterInvite"));
const BecomeTester = lazy(() => import("./pages/BecomeTester"));
const AppPrivacy = lazy(() => import("./pages/AppPrivacy"));
const AppStoreChecklist = lazy(() => import("./pages/AppStoreChecklist"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Guest = lazy(() => import("./pages/Guest"));
const AIStories = lazy(() => import("./pages/AIStories"));
const Clinics = lazy(() => import("./pages/Clinics"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

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
                  <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
                      <Route path="/ai-stories" element={<AIStories />} />
                      <Route path="/clinics" element={<Clinics />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
