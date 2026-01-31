import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Settings2,
  Check,
  Sparkles,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getBaseVoice } from "@/config/voiceConfig";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Voice settings - only ElevenLabs is supported now
export interface VoiceSettings {
  provider: "elevenlabs";
  speed: number;
  pitch: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  provider: "elevenlabs",
  speed: 0.95,
  pitch: 1.1,
};

const STORAGE_KEY = "toothyquest_voice_settings";

export const getVoiceSettings = (): VoiceSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
};

export const saveVoiceSettings = (settings: VoiceSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

const VoiceSettingsModal = ({ isOpen, onClose }: VoiceSettingsModalProps) => {
  const [testPlaying, setTestPlaying] = useState(false);

  const handleTestVoice = async () => {
    if (testPlaying) return;
    setTestPlaying(true);

    const voiceConfig = getBaseVoice();
    const testText = "Hey there, superstar! I'm your friendly guide. Ready to make those teeth sparkle and shine?";

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.info("Sign in to unlock the AI voice!");
        setTestPlaying(false);
        return;
      }

      console.log("Testing ElevenLabs TTS with authenticated user");

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
        setTestPlaying(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setTestPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        console.error("Audio playback error");
        toast.error("Couldn't play AI voice. Please try again.");
        setTestPlaying(false);
      };

      await audio.play();
      toast.success("🎤 Toothy's voice is working!");
    } catch (err) {
      console.error("Voice settings test failed:", err);
      toast.error("Couldn't connect to AI voice service.");
      setTestPlaying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background to-muted/30 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <span>Voice Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Voice Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-foreground">Toothy's Voice</h4>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Your friendly guide voice</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A warm, kid-friendly AI voice that stays consistent throughout your adventure. 
              The voice naturally adjusts its tone for exciting moments, encouragement, and calm storytelling! 🌟
            </p>
          </motion.div>

          {/* Test Voice Button */}
          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl"
            onClick={() => handleTestVoice()}
            disabled={testPlaying}
          >
            {testPlaying ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Volume2 className="w-4 h-4" />
                </motion.div>
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Test Toothy's Voice
              </>
            )}
          </Button>

          {/* Close Button */}
          <Button
            className="w-full rounded-xl font-display font-bold"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettingsModal;
