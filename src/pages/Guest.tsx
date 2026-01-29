import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getEffectiveVolume, getVolumeSettings, setVolumeSettings } from "@/components/VolumeControlPanel";
import { unlockAudioContext, getAudioContext, playSynthTone } from "@/hooks/useAudioManager";
import { canUseBrowserTts, speakBrowserTts } from "@/lib/speechSynthesis";

const GUEST_GREETING =
  "Hi! I’m Toothy. You can play as a guest — and sign in later to unlock the premium AI voice!";

const Guest = () => {
  const [hasStarted, setHasStarted] = useState(false);
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
        };
      } catch {
        return {
          soundMuted: null,
          gameSoundsMuted: null,
          quizSoundsMuted: null,
        };
      }
    })();

    return {
      ctxState,
      ttsSupported: canUseBrowserTts(),
      masterEffective: getEffectiveVolume("sfx"),
      voiceEffective: getEffectiveVolume("voice"),
      voiceEnabled: volume.voiceEnabled,
      masterVolume: volume.masterVolume,
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
    });
    try {
      localStorage.setItem("gameSoundsMuted", "false");
      localStorage.setItem("soundMuted", "false");
      localStorage.setItem("quizSoundsMuted", "false");
      window.dispatchEvent(new Event("toothyquest:audio-mute-flags-updated"));
    } catch {
      // ignore
    }
    refreshDiagnostics();
    toast.success("Sound Settings reset.");
  }, [refreshDiagnostics]);

  const startAndTest = useCallback(() => {
    setHasStarted(true);

    // Must happen in user gesture stack on iOS.
    unlockAudioContext();

    // Quick “beep” using WebAudio (respects Sound Settings).
    playSynthTone(880, 0.14, "sine");

    // Always try browser TTS for guests.
    if (!canUseBrowserTts()) {
      toast.error("Voice playback isn't available on this device.");
      refreshDiagnostics();
      return;
    }

    speakBrowserTts({
      text: GUEST_GREETING,
      rate: 1,
      pitch: 1.1,
      volume: Math.max(0.2, Math.min(1, diagnostics.voiceEffective || 1)),
      onEnd: () => refreshDiagnostics(),
      onError: () => {
        toast.error("Couldn't play the voice. Please try again.");
        refreshDiagnostics();
      },
    });
  }, [diagnostics.voiceEffective, refreshDiagnostics]);

  useEffect(() => {
    // Keep diagnostics in sync if user changes volumes elsewhere.
    const onVolumeChange = () => refreshDiagnostics();
    window.addEventListener("volume-settings-changed", onVolumeChange);
    return () => window.removeEventListener("volume-settings-changed", onVolumeChange);
  }, [refreshDiagnostics]);

  return (
    <main className="min-h-screen gradient-sky">
      <div className="container mx-auto px-4 py-10">
        <header className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
            Guest Mode
          </h1>
          <p className="text-muted-foreground text-lg">
            Play without signing up. Premium AI voice unlocks after sign-in.
          </p>
        </header>

        <section className="max-w-2xl mx-auto mt-8 bg-card/90 backdrop-blur rounded-3xl border border-border shadow-float p-6 space-y-4">
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-xl font-bold text-foreground">{GUEST_GREETING}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={startAndTest}>
              {hasStarted ? "Test Again" : "Enable Sound + Test Voice"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={resetAudioSettings}>
              Reset Sound Settings
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Button asChild variant="secondary" className="rounded-2xl">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/">Sign in for AI voice</Link>
            </Button>
          </div>

          <details className="rounded-2xl border border-border p-4">
            <summary className="cursor-pointer font-display font-bold text-foreground">
              Audio diagnostics
            </summary>
            <div className="mt-3 text-sm text-muted-foreground space-y-2">
              <div>Browser TTS supported: <span className="text-foreground font-medium">{String(diagnostics.ttsSupported)}</span></div>
              <div>AudioContext state: <span className="text-foreground font-medium">{diagnostics.ctxState}</span></div>
              <div>Master volume: <span className="text-foreground font-medium">{diagnostics.masterVolume}%</span></div>
              <div>Voice enabled: <span className="text-foreground font-medium">{String(diagnostics.voiceEnabled)}</span></div>
              <div>Effective voice volume: <span className="text-foreground font-medium">{diagnostics.voiceEffective.toFixed(2)}</span></div>
              <div>
                Mute flags: <span className="text-foreground font-medium">{JSON.stringify(diagnostics.muteFlags)}</span>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
};

export default Guest;
