import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Sparkles, Star, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuestVoice } from "@/hooks/useQuestVoice";
import { cn } from "@/lib/utils";

interface PhaseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseName: string;
  phaseEmoji: string;
  badgeName: string;
  badgeEmoji?: string;
  phaseNumber: number;
  worldName: string;
  color: string;
  isSpanish?: boolean;
}

const confettiColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];

export const PhaseCompletionModal = ({
  isOpen,
  onClose,
  phaseName,
  phaseEmoji,
  badgeName,
  badgeEmoji = "🏆",
  phaseNumber,
  worldName,
  color,
  isSpanish = false,
}: PhaseCompletionModalProps) => {
  const { speak, stop } = useQuestVoice();
  const [hasSpoken, setHasSpoken] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  // Generate confetti
  useEffect(() => {
    if (isOpen) {
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  // Speak celebration message
  useEffect(() => {
    if (isOpen && !hasSpoken && voiceEnabled) {
      const message = isSpanish
        ? `¡Felicitaciones! ¡Completaste la fase ${phaseNumber}, ${phaseName}! ¡Ganaste la insignia ${badgeName}! ¡Eres increíble!`
        : `Congratulations! You completed Phase ${phaseNumber}, ${phaseName}! You earned the ${badgeName} badge! You're amazing!`;
      
      const timer = setTimeout(() => {
        setIsSpeaking(true);
        speak(message, "excited", () => setIsSpeaking(false));
        setHasSpoken(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasSpoken, voiceEnabled, phaseName, badgeName, phaseNumber, isSpanish, speak]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setHasSpoken(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    stop();
    setIsSpeaking(false);
    onClose();
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <VisuallyHidden>
          <DialogTitle>{phaseName} Complete</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={cn(
            "relative rounded-3xl p-8 text-center overflow-hidden",
            color
          )}
        >
          {/* Confetti */}
          <AnimatePresence>
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ y: -20, x: `${piece.x}%`, opacity: 1, rotate: 0 }}
                animate={{
                  y: 400,
                  rotate: 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 2.5,
                  delay: piece.delay,
                  ease: "easeOut",
                }}
                className="absolute top-0 w-3 h-3 rounded-sm"
                style={{ backgroundColor: piece.color, left: `${piece.x}%` }}
              />
            ))}
          </AnimatePresence>

          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
                className="absolute text-yellow-300"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                }}
              >
                <Star className="w-4 h-4 fill-current" />
              </motion.div>
            ))}
          </div>

          {/* Voice toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoice}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20"
          >
            {voiceEnabled ? (
              <Volume2 className={cn("w-5 h-5", isSpeaking && "animate-pulse")} />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>

          {/* Content */}
          <div className="relative z-10">
            {/* Phase badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 shadow-xl">
                <span className="text-5xl">{phaseEmoji}</span>
              </div>
            </motion.div>

            {/* Phase complete text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white/90 font-medium">
                  {isSpanish ? `Fase ${phaseNumber} Completada` : `Phase ${phaseNumber} Complete`}
                </span>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{phaseName}</h2>
              <p className="text-white/80 text-sm mb-6">{worldName}</p>
            </motion.div>

            {/* Badge earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                <Award className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">
                    {isSpanish ? "¡Insignia Ganada!" : "Badge Earned!"}
                  </p>
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    {badgeEmoji} {badgeName}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleClose}
                className="bg-white text-gray-800 hover:bg-white/90 font-bold px-8 py-6 rounded-full text-lg shadow-xl"
              >
                {isSpanish ? "¡Continuar Aventura!" : "Continue Adventure!"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseCompletionModal;
