import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import toothyMascot from "@/assets/toothy-mascot-new.jpeg";

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to ToothyQuest! 🦷",
    description: "I'm Toothy, your dental buddy! Let's make brushing fun together!",
    emoji: "👋",
    mascotExpression: "waving",
  },
  {
    id: 2,
    title: "Complete Daily Quests! ⭐",
    description: "Brush your teeth every day and earn sparkle points and rewards!",
    emoji: "🎮",
    mascotExpression: "excited",
  },
  {
    id: 3,
    title: "Let's Start! 🚀",
    description: "Tap the button to begin your first quest and become a brushing champion!",
    emoji: "🏆",
    mascotExpression: "celebrating",
  },
];

const OnboardingFlow = ({ isOpen, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Reset step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsExiting(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsExiting(true);
      setTimeout(() => {
        // Mark as completed in localStorage
        localStorage.setItem("toothyquest_onboarding_complete", "true");
        onComplete();
      }, 300);
    }
  };

  const handleSkip = () => {
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
                className="mb-4"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative inline-block"
                >
                  <img
                    src={toothyMascot}
                    alt="Toothy mascot"
                    className="w-28 h-28 rounded-full shadow-float border-4 border-white object-cover mx-auto"
                  />
                  <motion.span
                    className="absolute -top-2 -right-2 text-3xl"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {step.emoji}
                  </motion.span>
                </motion.div>
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
