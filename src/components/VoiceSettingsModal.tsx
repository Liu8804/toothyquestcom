import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Settings2,
  Check,
  Sparkles,
  Monitor,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { getBaseVoice } from "@/config/voiceConfig";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type VoiceProvider = "elevenlabs" | "browser";

export interface VoiceSettings {
  provider: VoiceProvider;
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
  const [settings, setSettings] = useState<VoiceSettings>(getVoiceSettings);
  const [testPlaying, setTestPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getVoiceSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveVoiceSettings(settings);
    window.dispatchEvent(new CustomEvent('voiceSettingsChanged', { detail: settings }));
    onClose();
  };

  const handleTestVoice = async () => {
    if (testPlaying) return;
    setTestPlaying(true);

    const voiceConfig = getBaseVoice();
    const testText = "Hey there, superstar! I'm your friendly guide. Ready to make those teeth sparkle and shine?";

    const playBrowserVoice = () => {
      if (!(typeof window !== "undefined" && "speechSynthesis" in window)) {
        toast.error("Voice playback isn't available on this device.");
        setTestPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = settings.speed;
      utterance.pitch = settings.pitch;
      utterance.volume = 1;

      const speakNow = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoice =
          voices.find((v) => v.lang.startsWith("en") && v.localService) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (englishVoice) utterance.voice = englishVoice;

        utterance.onend = () => setTestPlaying(false);
        utterance.onerror = () => {
          setTestPlaying(false);
          toast.error("Couldn't play the voice. Please try again.");
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speakNow();
        };
        setTimeout(() => {
          speakNow();
        }, 150);
      } else {
        speakNow();
      }
    };

    try {
      if (settings.provider === "browser") {
        playBrowserVoice();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.info("AI voice needs sign-in — using browser voice for now.");
        playBrowserVoice();
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        toast.info("AI voice isn't available right now — using browser voice.");
        playBrowserVoice();
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
        toast.error("Couldn't play AI voice — using browser voice.");
        playBrowserVoice();
      };

      await audio.play();
    } catch (err) {
      console.error("Voice settings test failed:", err);
      toast.error("Couldn't play AI voice — using browser voice.");
      playBrowserVoice();
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
          {/* Voice Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-display font-bold text-foreground">
              Narration Voice
            </Label>
            <RadioGroup
              value={settings.provider}
              onValueChange={(value) =>
                setSettings({ ...settings, provider: value as VoiceProvider })
              }
              className="space-y-3"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.provider === "elevenlabs"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSettings({ ...settings, provider: "elevenlabs" })}
              >
                <RadioGroupItem value="elevenlabs" id="elevenlabs" className="sr-only" />
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-foreground">AI Voice</span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Premium
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Natural, expressive voices with fun personalities!
                  </p>
                </div>
                {settings.provider === "elevenlabs" && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  settings.provider === "browser"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSettings({ ...settings, provider: "browser" })}
              >
                <RadioGroupItem value="browser" id="browser" className="sr-only" />
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-foreground">Browser Voice</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                      Free
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Built-in voice, works offline
                  </p>
                </div>
                {settings.provider === "browser" && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </motion.div>
            </RadioGroup>
          </div>

          {/* AI Voice Info (only for ElevenLabs) */}
          {settings.provider === "elevenlabs" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground">Toothy's Friend</h4>
                    <p className="text-xs text-muted-foreground">Your friendly guide voice</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  A warm, kid-friendly voice that stays consistent throughout your adventure. 
                  The voice naturally adjusts its tone for exciting moments, encouragement, and calm storytelling! 🌟
                </p>
              </div>
            </motion.div>
          )}

          {/* Speed & Pitch (only for browser voice) */}
          {settings.provider === "browser" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Speed</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.speed.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, speed: value })
                  }
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Pitch</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.pitch.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[settings.pitch]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, pitch: value })
                  }
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}

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
                Test Voice
              </>
            )}
          </Button>

          {/* Save Button */}
          <Button
            className="w-full rounded-xl font-display font-bold"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSettingsModal;
