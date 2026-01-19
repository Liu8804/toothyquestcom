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
  Users,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import VoicePersonalityQuiz from "./VoicePersonalityQuiz";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type VoiceProvider = "elevenlabs" | "browser";

// Voice moods for kids - warm, happy, playful as base with variations
export type VoiceMood = "happy" | "excited" | "calm" | "silly";

export interface VoiceMoodConfig {
  id: VoiceMood;
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
  previewPhrase: string;
}

// Voice moods with ElevenLabs configurations - all warm and kid-friendly
export const VOICE_MOODS: VoiceMoodConfig[] = [
  {
    id: "happy",
    name: "Happy & Warm",
    description: "Friendly, cheerful, and full of sunshine! ☀️",
    emoji: "😊",
    icon: Star,
    voiceId: "cgSgspJ2msm6clMCkdW9", // Jessica - cheerful, upbeat
    stability: 0.35,
    similarityBoost: 0.8,
    style: 0.75,
    speed: 0.95,
    gradient: "from-yellow-400 to-orange-400",
    previewPhrase: "Hey there, superstar! I'm so happy to see you! Ready to make those teeth sparkle and shine?",
  },
  {
    id: "excited",
    name: "Super Excited",
    description: "High energy and ready for adventure! ⚡",
    emoji: "🎉",
    icon: Zap,
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam - energetic, expressive
    stability: 0.25,
    similarityBoost: 0.85,
    style: 0.9,
    speed: 1.05,
    gradient: "from-pink-500 to-rose-500",
    previewPhrase: "WOOHOO! This is going to be AMAZING! Let's GO on the most EPIC brushing adventure EVER!",
  },
  {
    id: "calm",
    name: "Calm & Gentle",
    description: "Soft and soothing like a bedtime story 🌙",
    emoji: "💜",
    icon: Heart,
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - soft, gentle
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.4,
    speed: 0.85,
    gradient: "from-purple-400 to-indigo-400",
    previewPhrase: "Hello, sweet one. Let's take a nice, peaceful journey together. Everything is going to be just fine.",
  },
  {
    id: "silly",
    name: "Silly & Playful",
    description: "Giggly, goofy, and super fun! 🤪",
    emoji: "🎭",
    icon: Users,
    voiceId: "IKne3meq5aSn9XLyUdCD", // Charlie - versatile character voice
    stability: 0.2,
    similarityBoost: 0.75,
    style: 0.95,
    speed: 1.0,
    gradient: "from-green-400 to-teal-400",
    previewPhrase: "Hee hee hee! Did you know that teeth love to do the wiggle dance? Wiggle wiggle wiggle! So silly!",
  },
];

// Legacy type aliases for backwards compatibility
export type VoicePersonality = VoiceMood;
export type VoicePersonalityConfig = VoiceMoodConfig;
export const VOICE_PERSONALITIES = VOICE_MOODS;

export interface VoiceSettings {
  provider: VoiceProvider;
  personality: VoicePersonality;
  speed: number;
  pitch: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  provider: "elevenlabs",
  personality: "happy",
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
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getVoiceSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveVoiceSettings(settings);
    onClose();
  };

  const handleQuizComplete = (personality: VoicePersonality) => {
    setSettings({ ...settings, personality });
    setShowQuiz(false);
  };

  const handleTestVoice = async (personalityToTest?: VoicePersonality) => {
    if (testPlaying) return;
    setTestPlaying(true);
    const testPersonality = personalityToTest || settings.personality;
    setTestingPersonality(testPersonality);

    const personality = getVoicePersonalityConfig(testPersonality);
    
    // Get the preview phrase from mood config
    const moodConfig = getVoicePersonalityConfig(testPersonality);
    const testText = moodConfig.previewPhrase;

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
              <div className="flex items-center justify-between">
                <Label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                  <span>Voice Mood</span>
                  <span className="text-lg">✨</span>
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7 text-primary hover:text-primary"
                  onClick={() => setShowQuiz(true)}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Take Quiz!
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {VOICE_MOODS.map((mood) => {
                  const IconComponent = mood.icon;
                  const isSelected = settings.personality === mood.id;
                  const isTesting = testingPersonality === mood.id;
                  
                  return (
                    <motion.div
                      key={mood.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-background"
                      }`}
                      onClick={() => setSettings({ ...settings, personality: mood.id })}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${mood.gradient}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg">{mood.emoji}</span>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        {mood.name}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mood.description}
                      </p>
                      
                      {/* Quick test button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(mood.id);
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

      {/* Voice Personality Quiz Modal */}
      <VoicePersonalityQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onComplete={handleQuizComplete}
      />
    </Dialog>
  );
};

export default VoiceSettingsModal;
