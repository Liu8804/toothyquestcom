import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music, Mic, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VolumeSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceEnabled: boolean;
}

const defaultSettings: VolumeSettings = {
  masterVolume: 70,
  sfxVolume: 50,
  musicVolume: 40,
  voiceEnabled: true,
};

export const getVolumeSettings = (): VolumeSettings => {
  if (typeof window === "undefined") return defaultSettings;
  const saved = localStorage.getItem("toothyquest-volume");
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
};

export const setVolumeSettings = (settings: Partial<VolumeSettings>) => {
  const current = getVolumeSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("toothyquest-volume", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("volume-settings-changed", { detail: updated }));
  return updated;
};

// Get effective volume (0-1 scale)
export const getEffectiveVolume = (type: "sfx" | "music" | "voice"): number => {
  const settings = getVolumeSettings();
  const master = settings.masterVolume / 100;
  
  switch (type) {
    case "sfx":
      return master * (settings.sfxVolume / 100);
    case "music":
      return master * (settings.musicVolume / 100);
    case "voice":
      return settings.voiceEnabled ? master : 0;
    default:
      return master;
  }
};

interface VolumeControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VolumeControlPanel = ({ isOpen, onClose }: VolumeControlPanelProps) => {
  const [settings, setSettings] = useState<VolumeSettings>(getVolumeSettings);

  useEffect(() => {
    if (isOpen) {
      setSettings(getVolumeSettings());
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) => {
    const updated = setVolumeSettings({ [key]: value });
    setSettings(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Sound Settings
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
                ✕
              </Button>
            </div>

            <div className="space-y-5">
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Volume2 className="w-4 h-4" />
                    Master Volume
                  </Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {settings.masterVolume}%
                  </span>
                </div>
                <Slider
                  value={[settings.masterVolume]}
                  onValueChange={([v]) => updateSetting("masterVolume", v)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-foreground">
                    <span className="text-lg">🔊</span>
                    Sound Effects
                  </Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {settings.sfxVolume}%
                  </span>
                </div>
                <Slider
                  value={[settings.sfxVolume]}
                  onValueChange={([v]) => updateSetting("sfxVolume", v)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Music Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-foreground">
                    <Music className="w-4 h-4" />
                    Background Music
                  </Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {settings.musicVolume}%
                  </span>
                </div>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={([v]) => updateSetting("musicVolume", v)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Voice Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <Label className="flex items-center gap-2 text-foreground cursor-pointer">
                  <Mic className="w-4 h-4" />
                  Toothy's Voice (AI)
                </Label>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(v) => updateSetting("voiceEnabled", v)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const reset = setVolumeSettings(defaultSettings);
                  setSettings(reset);
                }}
                className="flex-1"
              >
                Reset to Default
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VolumeControlPanel;
