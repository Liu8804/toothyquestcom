import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Volume2, VolumeX, Music, Mic, RefreshCw, X } from "lucide-react";
import { getEffectiveVolume, getVolumeSettings, setVolumeSettings } from "@/components/VolumeControlPanel";
import { getAudioContext, isVoiceActive } from "@/hooks/useAudioManager";
import { toast } from "sonner";

interface AudioDiagnosticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMusicPlaying?: boolean;
}

/**
 * Audio Diagnostics Panel
 * Shows AudioContext state, effective volumes, and music/voice status.
 * Similar to the diagnostics on the Guest page.
 */
const AudioDiagnosticsPanel = ({ isOpen, onClose, isMusicPlaying = false }: AudioDiagnosticsPanelProps) => {
  const [diagTick, setDiagTick] = useState(0);

  const diagnostics = useMemo(() => {
    const volume = getVolumeSettings();
    const ctxState = (() => {
      try {
        return getAudioContext().state;
      } catch {
        return "unavailable";
      }
    })();

    const muteFlags = (() => {
      try {
        return {
          soundMuted: localStorage.getItem("soundMuted"),
          gameSoundsMuted: localStorage.getItem("gameSoundsMuted"),
          quizSoundsMuted: localStorage.getItem("quizSoundsMuted"),
          homeMusicMuted: localStorage.getItem("toothyquest-home-music-muted"),
        };
      } catch {
        return {
          soundMuted: null,
          gameSoundsMuted: null,
          quizSoundsMuted: null,
          homeMusicMuted: null,
        };
      }
    })();

    return {
      ctxState,
      globalMute: volume.globalMute,
      masterVolume: volume.masterVolume,
      sfxVolume: volume.sfxVolume,
      musicVolume: volume.musicVolume,
      voiceEnabled: volume.voiceEnabled,
      sfxEffective: getEffectiveVolume("sfx"),
      musicEffective: getEffectiveVolume("music"),
      voiceEffective: getEffectiveVolume("voice"),
      voiceActive: isVoiceActive(),
      muteFlags,
      _tick: diagTick,
    };
  }, [diagTick]);

  const refreshDiagnostics = useCallback(() => setDiagTick((t) => t + 1), []);

  const resetAudioSettings = useCallback(() => {
    setVolumeSettings({
      masterVolume: 70,
      sfxVolume: 50,
      musicVolume: 40,
      voiceEnabled: true,
      globalMute: false,
    });
    try {
      localStorage.setItem("gameSoundsMuted", "false");
      localStorage.setItem("soundMuted", "false");
      localStorage.setItem("quizSoundsMuted", "false");
      localStorage.setItem("toothyquest-home-music-muted", "false");
      window.dispatchEvent(new Event("toothyquest:audio-mute-flags-updated"));
    } catch {
      // ignore
    }
    refreshDiagnostics();
    toast.success("Audio settings reset to defaults.");
  }, [refreshDiagnostics]);

  // Auto-refresh every second when panel is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(refreshDiagnostics, 1000);
    return () => clearInterval(interval);
  }, [isOpen, refreshDiagnostics]);

  // Listen for volume settings changes
  useEffect(() => {
    const onVolumeChange = () => refreshDiagnostics();
    window.addEventListener("volume-settings-changed", onVolumeChange);
    return () => window.removeEventListener("volume-settings-changed", onVolumeChange);
  }, [refreshDiagnostics]);

  const getStatusColor = (good: boolean) => good ? "text-emerald-500" : "text-amber-500";
  const getStatusBg = (good: boolean) => good ? "bg-emerald-500/10" : "bg-amber-500/10";

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
            className="w-full max-w-md"
          >
            <Card className="bg-card/95 backdrop-blur-md shadow-2xl border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bug className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Audio Diagnostics</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* AudioContext State */}
                  <div className={`p-3 rounded-xl ${getStatusBg(diagnostics.ctxState === "running")}`}>
                    <div className="text-xs text-muted-foreground">AudioContext</div>
                    <div className={`font-bold ${getStatusColor(diagnostics.ctxState === "running")}`}>
                      {diagnostics.ctxState}
                    </div>
                  </div>

                  {/* Global Mute */}
                  <div className={`p-3 rounded-xl ${getStatusBg(!diagnostics.globalMute)}`}>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {diagnostics.globalMute ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      Global
                    </div>
                    <div className={`font-bold ${getStatusColor(!diagnostics.globalMute)}`}>
                      {diagnostics.globalMute ? "Muted" : "On"}
                    </div>
                  </div>

                  {/* Music Status */}
                  <div className={`p-3 rounded-xl ${getStatusBg(isMusicPlaying)}`}>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      Background Music
                    </div>
                    <div className={`font-bold ${getStatusColor(isMusicPlaying)}`}>
                      {isMusicPlaying ? "Playing" : "Stopped"}
                    </div>
                  </div>

                  {/* Voice Status */}
                  <div className={`p-3 rounded-xl ${getStatusBg(diagnostics.voiceEnabled)}`}>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Toothy Voice
                    </div>
                    <div className={`font-bold ${getStatusColor(diagnostics.voiceEnabled)}`}>
                      {diagnostics.voiceActive ? "Speaking" : diagnostics.voiceEnabled ? "Ready" : "Off"}
                    </div>
                  </div>
                </div>

                {/* Volume Levels */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Effective Volumes</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">SFX</div>
                      <div className="font-bold text-foreground">{(diagnostics.sfxEffective * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Music</div>
                      <div className="font-bold text-foreground">{(diagnostics.musicEffective * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Voice</div>
                      <div className="font-bold text-foreground">{(diagnostics.voiceEffective * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* Mute Flags */}
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                    Legacy Mute Flags
                  </summary>
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg font-mono text-xs space-y-1">
                    {Object.entries(diagnostics.muteFlags).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className={value === "true" ? "text-amber-500" : "text-emerald-500"}>
                          {value ?? "null"}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshDiagnostics}
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetAudioSettings}
                    className="flex-1"
                  >
                    Reset All Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AudioDiagnosticsPanel;
