import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  Mic, 
  Settings2,
  Check,
  Sparkles,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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
  speed: 0.9,
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
    onClose();
  };

  const handleTestVoice = async () => {
    if (testPlaying) return;
    setTestPlaying(true);

    const testText = "Hi! I'm Toothy, your dental health friend! Let's learn about brushing together!";

    try {
      if (settings.provider === "browser") {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(testText);
          utterance.rate = settings.speed;
          utterance.pitch = settings.pitch;
          utterance.onend = () => setTestPlaying(false);
          utterance.onerror = () => setTestPlaying(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } else {
          setTestPlaying(false);
        }
      } else {
        // Test ElevenLabs
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              text: testText,
              voiceId: "pFZP5JQG7iQjIQuC4Bku",
            }),
          }
        );

        if (!response.ok) {
          // Fallback to browser voice if ElevenLabs fails
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(testText);
            utterance.rate = settings.speed;
            utterance.pitch = settings.pitch;
            utterance.onend = () => setTestPlaying(false);
            utterance.onerror = () => setTestPlaying(false);
            window.speechSynthesis.speak(utterance);
          } else {
            setTestPlaying(false);
          }
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
          setTestPlaying(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      }
    } catch {
      setTestPlaying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-background to-muted/30 border-primary/20">
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
                    Natural, expressive voice powered by ElevenLabs
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
            onClick={handleTestVoice}
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
                <Mic className="w-4 h-4" />
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
