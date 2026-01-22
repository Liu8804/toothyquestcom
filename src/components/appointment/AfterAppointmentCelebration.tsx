import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trophy, Download, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { POST_APPOINTMENT_STEPS } from "@/data/dentalAdventureSeries";
import { useTranslation } from "react-i18next";
import { useSoundEffects, SOUND_PROMPTS } from "@/hooks/useSoundEffects";

interface AfterAppointmentCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  childName?: string;
}

export const AfterAppointmentCelebration = ({ 
  isOpen, 
  onClose, 
  childName = "Hero" 
}: AfterAppointmentCelebrationProps) => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === "es";
  const { playSound } = useSoundEffects();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      setCompletedSteps([]);
      setShowCelebration(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (completedSteps.length === POST_APPOINTMENT_STEPS.length) {
      setTimeout(() => {
        setShowCelebration(true);
        playSound(SOUND_PROMPTS.questComplete);
        // Generate confetti
        const newConfetti = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
        }));
        setConfetti(newConfetti);
      }, 500);
    }
  }, [completedSteps, playSound]);

  const handleStepToggle = (stepId: string) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(id => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
      playSound(SOUND_PROMPTS.xpGain);
    }
  };

  const handleDownloadCertificate = () => {
    // Create certificate content
    const certificateContent = `
ToothyQuest Certificate of Bravery

This certifies that

✨ ${childName} ✨

is an official DENTAL CASTLE HERO!

They visited the dentist and protected their smile!

Date: ${new Date().toLocaleDateString()}

🦷 🏰 ⭐ 🦁 🎉
    `.trim();

    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${childName}_bravery_certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSound(SOUND_PROMPTS.purchaseSuccess);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        {/* Confetti */}
        <AnimatePresence>
          {showCelebration && confetti.map(({ id, x, delay }) => (
            <motion.div
              key={id}
              initial={{ y: -20, x: `${x}%`, opacity: 1 }}
              animate={{ y: 400, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay }}
              className="absolute text-xl pointer-events-none z-50"
            >
              {["🎉", "⭐", "🎊", "✨", "🦷"][id % 5]}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <motion.span 
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🎊
            </motion.span>
            <div>
              <h2 className="font-display text-xl font-bold">
                {isSpanish ? `¡Bienvenido de vuelta, ${childName}!` : `Welcome back, ${childName}!`}
              </h2>
              <p className="text-sm text-white/80">
                {isSpanish ? "¡Celebremos tu valentía!" : "Let's celebrate your bravery!"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!showCelebration ? (
              <motion.div
                key="checklist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  {isSpanish ? "¿Qué lograste hoy?" : "What did you accomplish today?"}
                </h3>

                <div className="space-y-3">
                  {POST_APPOINTMENT_STEPS.map((step, idx) => {
                    const isCompleted = completedSteps.includes(step.id);
                    return (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleStepToggle(step.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isCompleted
                            ? "bg-gradient-to-r from-mint/20 to-primary/20 border-2 border-mint"
                            : "bg-white border-2 border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted ? "bg-mint text-white" : "bg-muted"
                        }`}>
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="text-xl">{step.emoji}</span>
                          )}
                        </div>
                        <p className={`text-left flex-1 font-medium ${
                          isCompleted ? "text-mint" : "text-foreground"
                        }`}>
                          {isSpanish ? step.questionEs : step.question}
                        </p>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xl"
                          >
                            ✅
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  {isSpanish
                    ? `${completedSteps.length}/${POST_APPOINTMENT_STEPS.length} completados`
                    : `${completedSteps.length}/${POST_APPOINTMENT_STEPS.length} completed`}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className="w-20 h-20 mx-auto text-star fill-star" />
                </motion.div>

                <h3 className="font-display text-2xl font-bold text-foreground mt-4">
                  {isSpanish ? "¡ERES UN HÉROE!" : "YOU'RE A HERO!"}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {isSpanish
                    ? "¡Enfrentaste tu aventura y ganaste!"
                    : "You faced your adventure and won!"}
                </p>

                {/* Badge display */}
                <div className="mt-6 p-4 bg-gradient-to-br from-star/20 to-amber-200/30 rounded-2xl">
                  <div className="flex justify-center gap-2 mb-2">
                    {["🦁", "🏰", "⭐", "🪥"].map((emoji, idx) => (
                      <motion.span
                        key={idx}
                        className="text-3xl"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 + 0.3 }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </div>
                  <p className="font-display font-bold text-foreground">
                    {isSpanish ? "Héroe del Castillo Dental" : "Dental Castle Hero"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? "Campeón Sin Miedo" : "Fear-Free Champion"}
                  </p>
                </div>

                {/* Certificate download */}
                <Button
                  onClick={handleDownloadCertificate}
                  className="mt-6 gap-2 bg-gradient-to-r from-primary to-secondary"
                >
                  <Download className="w-4 h-4" />
                  {isSpanish ? "Descargar Certificado" : "Download Certificate"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {showCelebration && (
          <div className="p-4 border-t bg-white/50">
            <Button onClick={onClose} variant="outline" className="w-full">
              {isSpanish ? "¡Gracias!" : "Thank you!"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AfterAppointmentCelebration;
