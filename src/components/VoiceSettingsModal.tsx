import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  Mic, 
  Settings2,
  Check,
  Sparkles,
  Monitor,
  Star,
  Heart,
  Zap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type VoiceProvider = "elevenlabs" | "browser";

// Voice personalities for kids
export type VoicePersonality = "cheerful" | "gentle" | "adventure" | "character";

export interface VoicePersonalityConfig {
  id: VoicePersonality;
  name: string;
  description: string;
  emoji: string;
  icon: typeof Star;
  voiceId: string; // ElevenLabs voice ID
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  gradient: string;
}

// Voice personalities with ElevenLabs configurations
export const VOICE_PERSONALITIES: VoicePersonalityConfig[] = [
  {
    id: "cheerful",
    name: "Cheerful Storyteller",
    description: "Friendly, upbeat, and fun like your favorite guide!",
    emoji: "🌟",
    icon: Star,
    voiceId: "cgSgspJ2msm6clMCkdW9", // Jessica - cheerful, upbeat
    stability: 0.35,
    similarityBoost: 0.8,
    style: 0.7,
    speed: 1.0,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    id: "gentle",
    name: "Gentle & Caring",
    description: "Soft and calm like a bedtime storyteller",
    emoji: "💜",
    icon: Heart,
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - soft, gentle
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.4,
    speed: 0.85,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    id: "adventure",
    name: "Excitable Adventure",
    description: "High energy and cartoon-like fun!",
    emoji: "⚡",
    icon: Zap,
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam - energetic, expressive
    stability: 0.25,
    similarityBoost: 0.85,
    style: 0.9,
    speed: 1.05,
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "character",
    name: "Character Voices",
    description: "Multiple fun personalities for each story!",
    emoji: "🎭",
    icon: Users,
    voiceId: "IKne3meq5aSn9XLyUdCD", // Charlie - versatile character voice
    stability: 0.3,
    similarityBoost: 0.75,
    style: 0.85,
    speed: 0.95,
    gradient: "from-green-400 to-emerald-500",
  },
];

export interface VoiceSettings {
  provider: VoiceProvider;
  personality: VoicePersonality;
  speed: number;
  pitch: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  provider: "elevenlabs",
  personality: "cheerful",
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

export const getVoicePersonalityConfig = (personality: VoicePersonality): VoicePersonalityConfig => {
  return VOICE_PERSONALITIES.find(p => p.id === personality) || VOICE_PERSONALITIES[0];
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
  const [testingPersonality, setTestingPersonality] = useState<VoicePersonality | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getVoiceSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveVoiceSettings(settings);
    onClose();
  };

  const handleTestVoice = async (personalityToTest?: VoicePersonality) => {
    if (testPlaying) return;
    setTestPlaying(true);
    const testPersonality = personalityToTest || settings.personality;
    setTestingPersonality(testPersonality);

    const personality = getVoicePersonalityConfig(testPersonality);
    
    // Fun test phrases based on personality
    const testPhrases: Record<VoicePersonality, string> = {
      cheerful: "Hey there, superstar! Ready for an awesome tooth-brushing adventure? Let's make those teeth sparkle!",
      gentle: "Hello, little one. Let's take a peaceful journey to dreamland, where magical teeth dance under the moonlight.",
      adventure: "WOOHOO! Time for an EPIC quest! Grab your toothbrush sword and let's defeat those sneaky sugar bugs!",
      character: "Ahoy matey! Captain Toothy here! We're sailing to Sparkle Island to find the treasure of clean teeth!",
    };

    const testText = testPhrases[testPersonality];

    try {
      if (settings.provider === "browser") {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(testText);
          utterance.rate = settings.speed;
          utterance.pitch = settings.pitch;
          utterance.onend = () => {
            setTestPlaying(false);
            setTestingPersonality(null);
          };
          utterance.onerror = () => {
            setTestPlaying(false);
            setTestingPersonality(null);
          };
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } else {
          setTestPlaying(false);
          setTestingPersonality(null);
        }
      } else {
        // Test ElevenLabs with personality settings
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          // Fallback to browser voice if not authenticated
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(testText);
            utterance.rate = settings.speed;
            utterance.pitch = settings.pitch;
            utterance.onend = () => {
              setTestPlaying(false);
              setTestingPersonality(null);
            };
            utterance.onerror = () => {
              setTestPlaying(false);
              setTestingPersonality(null);
            };
            window.speechSynthesis.speak(utterance);
          } else {
            setTestPlaying(false);
            setTestingPersonality(null);
          }
          return;
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              text: testText,
              voiceId: personality.voiceId,
              voiceSettings: {
                stability: personality.stability,
                similarityBoost: personality.similarityBoost,
                style: personality.style,
                speed: personality.speed,
              },
            }),
          }
        );

        if (!response.ok) {
          // Fallback to browser voice if ElevenLabs fails
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(testText);
            utterance.rate = settings.speed;
            utterance.pitch = settings.pitch;
            utterance.onend = () => {
              setTestPlaying(false);
              setTestingPersonality(null);
            };
            utterance.onerror = () => {
              setTestPlaying(false);
              setTestingPersonality(null);
            };
            window.speechSynthesis.speak(utterance);
          } else {
            setTestPlaying(false);
            setTestingPersonality(null);
          }
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          setTestPlaying(false);
          setTestingPersonality(null);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setTestPlaying(false);
          setTestingPersonality(null);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      }
    } catch {
      setTestPlaying(false);
      setTestingPersonality(null);
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

          {/* Voice Personality Selection (only for ElevenLabs) */}
          {settings.provider === "elevenlabs" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <span>Voice Personality</span>
                <span className="text-lg">✨</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {VOICE_PERSONALITIES.map((personality) => {
                  const IconComponent = personality.icon;
                  const isSelected = settings.personality === personality.id;
                  const isTesting = testingPersonality === personality.id;
                  
                  return (
                    <motion.div
                      key={personality.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-background"
                      }`}
                      onClick={() => setSettings({ ...settings, personality: personality.id })}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${personality.gradient}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg">{personality.emoji}</span>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        {personality.name}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {personality.description}
                      </p>
                      
                      {/* Quick test button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(personality.id);
                        }}
                        disabled={testPlaying}
                      >
                        {isTesting ? (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                              <Volume2 className="w-3 h-3" />
                            </motion.div>
                            Playing...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            Listen
                          </>
                        )}
                      </Button>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
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
            {testPlaying && !testingPersonality ? (
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
                Test Current Voice
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
