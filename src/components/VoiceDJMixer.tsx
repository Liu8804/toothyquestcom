import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, 
  Volume2, 
  Sparkles,
  Play,
  Square,
  RotateCcw,
  Disc3,
  Zap,
  Heart,
  Star,
  PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TOOTHY_VOICE } from "@/config/voiceConfig";

interface VoiceDJMixerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MixerSettings {
  stability: number;
  style: number;
  speed: number;
  energy: number;
}

const PRESETS = [
  {
    id: "happy",
    name: "Happy Friend",
    emoji: "😊",
    icon: Star,
    settings: { stability: 0.35, style: 0.75, speed: 0.95, energy: 0.7 },
    gradient: "from-yellow-400 to-orange-400",
    phrase: "Hey there superstar! Ready to have some fun?",
  },
  {
    id: "excited",
    name: "Super Excited",
    emoji: "🎉",
    icon: Zap,
    settings: { stability: 0.2, style: 0.95, speed: 1.1, energy: 1.0 },
    gradient: "from-pink-500 to-rose-500",
    phrase: "WOOHOO! This is going to be AMAZING! Let's GO!",
  },
  {
    id: "calm",
    name: "Calm & Cozy",
    emoji: "💜",
    icon: Heart,
    settings: { stability: 0.6, style: 0.4, speed: 0.85, energy: 0.3 },
    gradient: "from-purple-400 to-indigo-400",
    phrase: "Hello, sweet one. Everything is going to be just fine.",
  },
  {
    id: "silly",
    name: "Silly Goose",
    emoji: "🤪",
    icon: PartyPopper,
    settings: { stability: 0.15, style: 1.0, speed: 1.0, energy: 0.9 },
    gradient: "from-green-400 to-teal-400",
    phrase: "Hee hee hee! Wiggle wiggle wiggle! So silly!",
  },
];

const VoiceDJMixer = ({ isOpen, onClose }: VoiceDJMixerProps) => {
  const [settings, setSettings] = useState<MixerSettings>({
    stability: 0.35,
    style: 0.75,
    speed: 0.95,
    energy: 0.7,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("happy");
  const [customPhrase, setCustomPhrase] = useState(
    "Hey there! I'm Toothy, your dental buddy! Let's make those teeth sparkle and shine!"
  );

  const handlePresetClick = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettings(preset.settings);
      setActivePreset(presetId);
      setCustomPhrase(preset.phrase);
    }
  };

  const handleSliderChange = (key: keyof MixerSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset(null); // Clear preset when manually adjusting
  };

  const handleReset = () => {
    handlePresetClick("happy");
  };

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        // Fallback to browser speech
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(customPhrase);
          utterance.rate = settings.speed;
          utterance.pitch = 1 + (settings.style - 0.5);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
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
            text: customPhrase,
            voiceId: TOOTHY_VOICE.voiceId, // Consistent Toothy voice
            voiceSettings: {
              stability: settings.stability,
              similarityBoost: 0.85,
              style: settings.style,
              speed: settings.speed,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (error) {
      console.error("Error playing voice:", error);
      setIsPlaying(false);
    }
  }, [settings, customPhrase, isPlaying]);

  const getEnergyLabel = (value: number) => {
    if (value < 0.3) return "🌙 Sleepy";
    if (value < 0.5) return "😌 Relaxed";
    if (value < 0.7) return "😊 Happy";
    if (value < 0.9) return "🎉 Excited";
    return "⚡ HYPER!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-background via-background to-primary/5 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-pink-500 rounded-2xl flex items-center justify-center"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              <Disc3 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <span>Voice DJ Mixer</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Mix your perfect voice! 🎵
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Preset Quick Select */}
          <div className="space-y-2">
            <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Mix Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isActive = activePreset === preset.id;
                
                return (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePresetClick(preset.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${preset.gradient} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">{preset.emoji}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {preset.name.split(" ")[0]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* DJ Mixer Sliders */}
          <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-display font-bold flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Mix Controls
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleReset}
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            </div>

            {/* Expressiveness (Inverse of Stability) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expressiveness</span>
                <span className="font-medium">
                  {settings.stability < 0.3 ? "🎭 Super Animated" : 
                   settings.stability < 0.5 ? "✨ Expressive" : 
                   settings.stability < 0.7 ? "😊 Natural" : "📖 Steady"}
                </span>
              </div>
              <Slider
                value={[1 - settings.stability]}
                onValueChange={([value]) => handleSliderChange("stability", 1 - value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Playfulness (Style) */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Playfulness</span>
                <span className="font-medium">
                  {settings.style < 0.3 ? "📚 Serious" : 
                   settings.style < 0.6 ? "😊 Friendly" : 
                   settings.style < 0.8 ? "🎉 Playful" : "🤪 Super Silly!"}
                </span>
              </div>
              <Slider
                value={[settings.style]}
                onValueChange={([value]) => handleSliderChange("style", value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Speed</span>
                <span className="font-medium">
                  {settings.speed < 0.8 ? "🐢 Slow & Cozy" : 
                   settings.speed < 1.0 ? "🚶 Normal" : 
                   settings.speed < 1.15 ? "🏃 Fast!" : "🚀 Super Fast!"}
                </span>
              </div>
              <Slider
                value={[settings.speed]}
                onValueChange={([value]) => handleSliderChange("speed", value)}
                min={0.7}
                max={1.2}
                step={0.05}
                className="w-full"
              />
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Energy</span>
                <span className="font-medium">{getEnergyLabel(settings.energy)}</span>
              </div>
              <Slider
                value={[settings.energy]}
                onValueChange={([value]) => handleSliderChange("energy", value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview Text */}
          <div className="space-y-2">
            <label className="text-sm font-display font-bold text-foreground">
              Preview Text
            </label>
            <textarea
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border bg-background text-sm resize-none focus:border-primary focus:outline-none transition-colors"
              rows={2}
              placeholder="Type something fun to hear!"
            />
          </div>

          {/* Play Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="w-full h-14 rounded-2xl font-display font-bold text-lg gap-3 bg-gradient-to-r from-primary via-accent to-pink-500 hover:opacity-90"
              onClick={handlePlay}
              disabled={isPlaying}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="playing"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <Volume2 className="w-6 h-6" />
                    </motion.div>
                    <span>Playing...</span>
                    <motion.div
                      className="flex gap-1"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-4 bg-white/80 rounded-full"
                          animate={{ scaleY: [0.5, 1, 0.5] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-6 h-6" />
                    <span>Play My Mix!</span>
                    <span className="text-xl">🎧</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Fun Tip */}
          <div className="text-center text-xs text-muted-foreground p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="font-medium">🎵 DJ Tip:</span> Mix high playfulness with fast speed for maximum silliness!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceDJMixer;
