import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PRE_APPOINTMENT_AFFIRMATIONS, DENTAL_TOOL_CHARACTERS } from "@/data/dentalAdventureSeries";
import { useTranslation } from "react-i18next";

interface BeforeAppointmentGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeforeAppointmentGuide = ({ isOpen, onClose }: BeforeAppointmentGuideProps) => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === "es";
  const [currentStep, setCurrentStep] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const steps = [
    {
      id: "breathing",
      title: isSpanish ? "Respiremos Juntos" : "Let's Breathe Together",
      emoji: "🌬️",
    },
    {
      id: "reminder",
      title: isSpanish ? "El Dentista es un Ayudante" : "The Dentist is a Helper",
      emoji: "🦸",
    },
    {
      id: "preview",
      title: isSpanish ? "¿Qué Pasará?" : "What Will Happen?",
      emoji: "🏰",
    },
    {
      id: "affirmations",
      title: isSpanish ? "Afirmaciones Positivas" : "Positive Affirmations",
      emoji: "💪",
    },
  ];

  const handleBreathingStart = () => {
    setIsBreathing(true);
    setTimeout(() => setIsBreathing(false), 8000);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
        <VisuallyHidden>
          <DialogTitle>Before Your Appointment Guide</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{steps[currentStep].emoji}</span>
            <div>
              <h2 className="font-display text-xl font-bold">
                {isSpanish ? "Antes de tu Cita" : "Before Your Appointment"}
              </h2>
              <p className="text-sm text-white/80">
                {isSpanish ? "Mañana es tu Día de Aventura Dental" : "Tomorrow is your Tooth Quest Day!"}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {steps[0].title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isSpanish
                    ? "Cierra los ojos y respira profundo conmigo..."
                    : "Close your eyes and take a deep breath with me..."}
                </p>

                <motion.div
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center cursor-pointer"
                  animate={isBreathing ? {
                    scale: [1, 1.3, 1.3, 1],
                  } : {}}
                  transition={isBreathing ? {
                    duration: 8,
                    times: [0, 0.25, 0.75, 1],
                  } : {}}
                  onClick={handleBreathingStart}
                >
                  <span className="text-5xl">🌬️</span>
                </motion.div>

                <p className="mt-4 text-sm text-muted-foreground">
                  {isBreathing
                    ? isSpanish ? "Adentro... y afuera..." : "In... and out..."
                    : isSpanish ? "Toca para respirar" : "Tap to breathe"}
                </p>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="reminder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {steps[1].title}
                </h3>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 mb-4">
                  <span className="text-6xl block mb-4">🦸‍♂️</span>
                  <p className="text-foreground font-medium">
                    {isSpanish
                      ? "El dentista es un héroe dental que mantiene tu sonrisa saludable y fuerte."
                      : "The dentist is a tooth hero who keeps your smile healthy and strong."}
                  </p>
                </div>

                <div className="flex gap-2 justify-center flex-wrap">
                  {["🦷", "✨", "💪", "😊"].map((emoji, idx) => (
                    <motion.span
                      key={idx}
                      className="text-2xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ delay: idx * 0.2, repeat: Infinity, duration: 2 }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-4 text-center">
                  {steps[2].title}
                </h3>

                <div className="space-y-3">
                  {DENTAL_TOOL_CHARACTERS.slice(0, 4).map((tool, idx) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white`}
                    >
                      <span className="text-2xl">{tool.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{isSpanish ? tool.nameEs : tool.name}</p>
                        <p className="text-xs text-white/80 truncate">
                          {isSpanish ? tool.introductionEs : tool.introduction}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="affirmations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {steps[3].title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {isSpanish ? "Repite conmigo:" : "Say with me:"}
                </p>

                <div className="space-y-3">
                  {PRE_APPOINTMENT_AFFIRMATIONS.map((affirmation, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
                    >
                      <span className="text-2xl">{affirmation.emoji}</span>
                      <p className="font-medium text-foreground">
                        {isSpanish ? affirmation.textEs : affirmation.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white/50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {currentStep < steps.length - 1 ? (
              <>
                {isSpanish ? "Siguiente" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                {isSpanish ? "¡Estoy Listo!" : "I'm Ready!"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeforeAppointmentGuide;
