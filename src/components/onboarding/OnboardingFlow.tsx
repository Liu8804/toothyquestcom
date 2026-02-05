import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotPose from "@/components/mascot/MascotPose";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useEngagementAnalytics } from "@/hooks/useEngagementAnalytics";

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to ToothyQuest! ✨",
    description: "I'm Toothy, your dental buddy! Let's make brushing fun together!",
    emoji: "👋",
    mascotPose: "full" as const,
  },
  {
    id: 2,
    title: "Complete Daily Quests! ⭐",
    description: "Brush your teeth every day and earn sparkle points and rewards!",
    emoji: "🎮",
    mascotPose: "brushing" as const,
  },
  {
    id: 3,
    title: "Let's Start! 🚀",
    description: "Tap the button to begin your first quest and become a brushing champion!",
    emoji: "🏆",
    mascotPose: "celebrating" as const,
  },
];

const OnboardingFlow = ({ isOpen, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const { playHappy, playExcited, playCelebrate } = useMascotSounds();
  const { trackOnboardingStep, trackOnboardingComplete } = useEngagementAnalytics();

  // Reset step when opening - only show if explicitly opened (not auto-show)
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsExiting(false);
      playHappy();
      trackOnboardingStep(1, "view");
    }
  }, [isOpen, playHappy, trackOnboardingStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      trackOnboardingStep(currentStep + 1, "complete");
      trackOnboardingStep(nextStep + 1, "view");
      
      // Play appropriate sound for next step
      if (nextStep === 1) playExcited();
      if (nextStep === 2) playCelebrate();
    } else {
      // Complete onboarding
      setIsExiting(true);
      trackOnboardingStep(currentStep + 1, "complete");
      trackOnboardingComplete();
      playCelebrate();

      // CRITICAL: complete synchronously within the user gesture.
      // Delaying (setTimeout) can cause iOS/Safari to block audio playback.
      localStorage.setItem("toothyquest_onboarding_complete", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    trackOnboardingStep(currentStep + 1, "skip");
    localStorage.setItem("toothyquest_onboarding_complete", "true");
    onComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && !isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-sm bg-card rounded-3xl shadow-float overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 gradient-hero opacity-10" />

            {/* Content */}
            <div className="relative p-6 text-center">
              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentStep ? "bg-primary" : "bg-muted"
                    }`}
                    animate={idx === currentStep ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>

              {/* Mascot */}
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="mb-4 relative"
              >
                <MascotPose
                  pose={step.mascotPose}
                  size="lg"
                  animate={true}
                  showSparkles={step.mascotPose === "celebrating"}
                  enableSound={false}
                />
                <motion.span
                  className="absolute -top-2 -right-2 text-3xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {step.emoji}
                </motion.span>
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl font-bold text-foreground mb-2"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mb-6"
              >
                {step.description}
              </motion.p>

              {/* Tap hint for first step */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 text-primary mb-4"
                >
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Hand className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-medium">Tap to continue</span>
                </motion.div>
              )}

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gradient-hero text-white rounded-full font-display font-bold shadow-float px-8 gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Start My Quest!
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingFlow;
