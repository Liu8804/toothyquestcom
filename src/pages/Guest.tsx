import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getEffectiveVolume, getVolumeSettings, setVolumeSettings } from "@/components/VolumeControlPanel";
import { unlockAudioContext, getAudioContext, playSynthTone } from "@/hooks/useAudioManager";
import { useQuestVoice } from "@/hooks/useQuestVoice";

const GUEST_GREETING =
  "Hi! I'm Toothy. You can play as a guest — and sign in later to unlock the premium AI voice!";

/**
 * Guest Mode page with a dedicated tap-to-unlock step.
 * On iOS Safari, audio cannot start until there's a user gesture; we use a bright,
 * kid-friendly "Tap to Enable Sound!" button that explicitly unlocks WebAudio.
 */
const Guest = () => {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);
  const [diagTick, setDiagTick] = useState(0);

  const { speak } = useQuestVoice();

  const hasSpokenGreetingRef = useRef(false);

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

  const handleUnlockTap = useCallback(() => {
    // MUST be synchronous with the gesture — unlock WebAudio.
    unlockAudioContext();

    // Quick confirmation beep.
    playSynthTone(880, 0.14, "sine");

    setAudioUnlocked(true);
    refreshDiagnostics();
    toast.success("Audio enabled! 🎉");
  }, [refreshDiagnostics]);

  const testVoice = useCallback(() => {
    if (testPlaying) return;
    setTestPlaying(true);

    // Require unlock first.
    if (!audioUnlocked) {
      toast.info("Please tap the Unlock button first!");
      setTestPlaying(false);
      return;
    }

    // Use Toothy AI voice for guests too.
    speak(GUEST_GREETING, "curious", () => {
      setTestPlaying(false);
      refreshDiagnostics();
    });
  }, [audioUnlocked, refreshDiagnostics, speak, testPlaying]);

  // Speak greeting automatically once after first unlock.
  useEffect(() => {
    if (audioUnlocked && !hasSpokenGreetingRef.current) {
      hasSpokenGreetingRef.current = true;
      testVoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUnlocked]);

  // Keep diagnostics in sync if user changes volumes elsewhere.
  useEffect(() => {
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
          {/* Greeting bubble (always visible) */}
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-xl font-bold text-foreground">{GUEST_GREETING}</p>
          </div>

          {/* Step 1: Unlock button */}
          {!audioUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Button
                className="w-full text-lg py-6 rounded-2xl font-display font-extrabold animate-pulse-glow"
                onClick={handleUnlockTap}
              >
                🔊 Tap to Enable Sound!
              </Button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                iOS/Safari requires a tap before audio can play.
              </p>
            </motion.div>
          )}

          {/* Step 2: Voice test (after unlock) */}
          {audioUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                className="flex-1 py-5 rounded-2xl font-display font-bold"
                onClick={testVoice}
                disabled={testPlaying}
              >
                {testPlaying ? "Speaking..." : "🎤 Test Voice Again"}
              </Button>
              <Button variant="outline" className="flex-1 py-5 rounded-2xl" onClick={resetAudioSettings}>
                Reset Sound Settings
              </Button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
            <Button asChild variant="secondary" className="rounded-2xl">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/">Sign in for AI voice</Link>
            </Button>
          </div>

          {/* Diagnostics panel */}
          <details className="rounded-2xl border border-border p-4">
            <summary className="cursor-pointer font-display font-bold text-foreground">
              Audio diagnostics
            </summary>
            <div className="mt-3 text-sm text-muted-foreground space-y-2">
              <div>
                AudioContext state:{" "}
                <span className="text-foreground font-medium">{diagnostics.ctxState}</span>
              </div>
              <div>
                Master volume:{" "}
                <span className="text-foreground font-medium">{diagnostics.masterVolume}%</span>
              </div>
              <div>
                Voice enabled:{" "}
                <span className="text-foreground font-medium">{String(diagnostics.voiceEnabled)}</span>
              </div>
              <div>
                Effective voice volume:{" "}
                <span className="text-foreground font-medium">{diagnostics.voiceEffective.toFixed(2)}</span>
              </div>
              <div>
                Mute flags:{" "}
                <span className="text-foreground font-medium">{JSON.stringify(diagnostics.muteFlags)}</span>
              </div>
            </div>
          </details>
        </section>
      </div>
    </main>
  );
};

export default Guest;
