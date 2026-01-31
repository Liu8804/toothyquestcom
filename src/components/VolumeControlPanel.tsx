import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music, Mic, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isPositiveSoundsEnabled, setPositiveSoundsEnabled } from "@/hooks/usePositiveSounds";
import { VOLUME_PRESETS, VolumePresets } from "@/components/volume/VolumePresets";

interface VolumeSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceEnabled: boolean;
  globalMute: boolean;
}

const defaultSettings: VolumeSettings = {
  masterVolume: 70,
  sfxVolume: 50,
  musicVolume: 40,
  voiceEnabled: true,
  globalMute: false,
};

export const getVolumeSettings = (): VolumeSettings => {
  if (typeof window === "undefined") return defaultSettings;
  const saved = localStorage.getItem("toothyquest-volume");
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};

export const setVolumeSettings = (settings: Partial<VolumeSettings>) => {
  const current = getVolumeSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("toothyquest-volume", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("volume-settings-changed", { detail: updated }));
  return updated;
};

// Check if globally muted
export const isGloballyMuted = (): boolean => {
  return getVolumeSettings().globalMute;
};

// Get effective volume (0-1 scale)
export const getEffectiveVolume = (type: "sfx" | "music" | "voice"): number => {
  const settings = getVolumeSettings();
  
  // If globally muted, return 0 for everything
  if (settings.globalMute) return 0;
  
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
  const [positiveSoundsOn, setPositiveSoundsOn] = useState(false);

  const clearMuteFlags = () => {
    if (typeof window === "undefined") return;
    try {
      // Unblock audio if any legacy mute toggles were left on.
      // (These toggles exist in games/quizzes, but parents typically expect the Sound Settings panel to control everything.)
      localStorage.setItem("gameSoundsMuted", "false");
      localStorage.setItem("soundMuted", "false");
      localStorage.setItem("quizSoundsMuted", "false");
      window.dispatchEvent(new Event("toothyquest:audio-mute-flags-updated"));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(getVolumeSettings());
      setPositiveSoundsOn(isPositiveSoundsEnabled());
    }
  }, [isOpen]);

  const handlePositiveSoundsToggle = (enabled: boolean) => {
    setPositiveSoundsEnabled(enabled);
    setPositiveSoundsOn(enabled);
  };

  const updateSetting = <K extends keyof VolumeSettings>(key: K, value: VolumeSettings[K]) => {
    const updated = setVolumeSettings({ [key]: value });
    setSettings(updated);

    // If a user is actively adjusting volumes, they very likely want audio ON.
    // Clear any legacy mute toggles that could otherwise silently block game sounds.
    if (key === "masterVolume" || key === "sfxVolume" || key === "musicVolume") {
      if (typeof value === "number" && value > 0) {
        clearMuteFlags();
      }
    }
  };

  const applyPreset = (presetKey: keyof typeof VOLUME_PRESETS) => {
    const preset = VOLUME_PRESETS[presetKey];
    const updated = setVolumeSettings({
      ...preset,
      globalMute: false,
    });
    setSettings(updated);
    clearMuteFlags();
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
              {/* Global Mute Toggle - Most prominent */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted to-muted/50 rounded-xl border-2 border-border">
                <Label className="flex items-center gap-3 text-foreground cursor-pointer">
                  {settings.globalMute ? (
                    <VolumeX className="w-5 h-5 text-destructive" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-primary" />
                  )}
                  <span className="font-medium">
                    {settings.globalMute ? "Sound Off" : "Sound On"}
                    <span className="block text-xs text-muted-foreground">Mute all app sounds</span>
                  </span>
                </Label>
                <Switch
                  checked={!settings.globalMute}
                  onCheckedChange={(checked) => {
                    updateSetting("globalMute", !checked);
                    if (checked) clearMuteFlags();
                  }}
                />
              </div>

              {/* Volume Presets (replaces sliders) */}
              <VolumePresets
                values={{
                  masterVolume: settings.masterVolume,
                  sfxVolume: settings.sfxVolume,
                  musicVolume: settings.musicVolume,
                }}
                disabled={settings.globalMute}
                onSelectPreset={applyPreset}
              />

              {/* Voice Toggle */}
              <div className={`flex items-center justify-between p-3 bg-muted/50 rounded-xl ${settings.globalMute ? "opacity-50" : ""}`}>
                <Label className="flex items-center gap-2 text-foreground cursor-pointer">
                  <Mic className="w-4 h-4" />
                  Toothy's Voice (AI)
                </Label>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(v) => updateSetting("voiceEnabled", v)}
                  disabled={settings.globalMute}
                />
              </div>

              {/* Positive Sounds Toggle */}
              <div className={`flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 ${settings.globalMute ? "opacity-50" : ""}`}>
                <Label className="flex items-center gap-2 text-foreground cursor-pointer">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>
                    Celebration Sounds
                    <span className="block text-xs text-muted-foreground">Quest & reward sounds</span>
                  </span>
                </Label>
                <Switch
                  checked={positiveSoundsOn}
                  onCheckedChange={handlePositiveSoundsToggle}
                  disabled={settings.globalMute}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const reset = setVolumeSettings(defaultSettings);
                  setSettings(reset);
                  clearMuteFlags();
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
