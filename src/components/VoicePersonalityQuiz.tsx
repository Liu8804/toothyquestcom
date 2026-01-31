import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getBaseVoice } from "@/config/voiceConfig";
import { supabase } from "@/integrations/supabase/client";

interface VoicePersonalityQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Voice Personality Quiz
 * 
 * Uses ONLY ElevenLabs AI voice - no browser TTS fallback
 * This ensures consistent Toothy character voice
 */
const VoicePersonalityQuiz = ({ isOpen, onClose, onComplete }: VoicePersonalityQuizProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const voiceConfig = getBaseVoice();

  const handleTestVoice = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    const testText =
      "Hey there, superstar! I'm your friendly guide, Toothy! I'll be here to cheer you on during all your brushing adventures. Ready to make those teeth sparkle and shine?";

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Not signed in -> show info message
      if (!session?.access_token) {
        toast.info("Sign in to unlock the AI voice!");
        setIsPlaying(false);
        return;
      }

      console.log("Attempting ElevenLabs TTS with authenticated user");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: testText,
            voiceId: voiceConfig.voiceId,
            voiceSettings: {
              stability: voiceConfig.stability,
              similarityBoost: voiceConfig.similarityBoost,
              style: voiceConfig.style,
              speed: voiceConfig.speed,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("ElevenLabs TTS error:", response.status, errorData);
        toast.error("AI voice isn't available right now. Please try again.");
        setIsPlaying(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setIsPlaying(false);
        setHasListened(true);
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        console.error("Audio playback error");
        toast.error("Couldn't play AI voice. Please try again.");
        setIsPlaying(false);
      };

      await audio.play();
      toast.success("🎤 Toothy is speaking!");
    } catch (err) {
      console.error("Voice test failed:", err);
      toast.error("Couldn't connect to AI voice service.");
      setIsPlaying(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-background via-primary/5 to-accent/10 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span>Meet Your Guide!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              {/* Celebration */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="space-y-2"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl"
                >
                  🦷
                </motion.div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  Say Hello to Toothy!
                </h3>
              </motion.div>

              {/* Voice Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-display font-bold mb-2">
                  {voiceConfig.name}
                </h4>
                <p className="text-white/90 text-sm">
                  A warm, kid-friendly AI voice that will be your guide throughout all your dental adventures! 🌟
                </p>
              </motion.div>

              {/* Test Voice Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleTestVoice}
                  disabled={isPlaying}
                  className="gap-2 rounded-xl"
                  size="lg"
                >
                  {isPlaying ? (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        <Volume2 className="w-5 h-5" />
                      </motion.div>
                      Listening...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      {hasListened ? "Listen Again!" : "Hear Toothy's Voice!"}
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-2"
              >
                <Button
                  onClick={handleComplete}
                  className="w-full rounded-xl font-display font-bold"
                  size="lg"
                >
                  Let's Go! 🚀
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoicePersonalityQuiz;
