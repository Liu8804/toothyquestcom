import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getVoiceSettings } from "@/components/VoiceSettingsModal";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { 
  stopAllMedia, 
  setVoicePlaying, 
  registerVoiceAudio,
  getAudioContext,
  unlockAudioContext,
} from "./useAudioManager";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";

/**
 * Quest voice hook for short narration lines (intro, ending, celebrations).
 * Uses ONE consistent voice (Toothy) with mood variations for emotional context.
 * - Uses Premium AI voice (ElevenLabs) ONLY when the user is signed in
 * - NO browser speech fallback (eliminates mixed voice issue)
 * 
 * AUDIO COORDINATION: Uses centralized audio manager to prevent overlapping
 */
export const useQuestVoice = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // WebAudio fallback (reliable on iOS/Safari once the AudioContext is unlocked)
  const webSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const webGainRef = useRef<GainNode | null>(null);

  

  const cleanupAudio = useCallback(() => {
    // Stop WebAudio fallback if active
    if (webSourceRef.current) {
      try {
        webSourceRef.current.stop();
      } catch {
        // ignore
      }
      webSourceRef.current = null;
    }
    if (webGainRef.current) {
      try {
        webGainRef.current.disconnect();
      } catch {
        // ignore
      }
      webGainRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    // Use centralized stop to ensure everything stops
    stopAllMedia();
    setVoicePlaying(false);
    cleanupAudio();
  }, [cleanupAudio]);

  const decodeAudioBuffer = useCallback((ctx: AudioContext, buffer: ArrayBuffer) => {
    return new Promise<AudioBuffer>((resolve, reject) => {
      try {
        // Safari supports callback style more reliably than Promise style
        ctx.decodeAudioData(
          buffer,
          (decoded) => resolve(decoded),
          (err) => reject(err)
        );
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const playWithWebAudioFallback = useCallback(
    async (blob: Blob, onEnd?: () => void) => {
      try {
        // Best-effort unlock/resume (must be called from a user gesture at least once on iOS)
        unlockAudioContext();

        const ctx = getAudioContext();
        if (ctx.state === "suspended") {
          try {
            await ctx.resume();
          } catch {
            // ignore
          }
        }

        const effectiveVolume = getEffectiveVolume("voice");
        if (effectiveVolume <= 0.001) {
          onEnd?.();
          return;
        }

        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await decodeAudioBuffer(ctx, arrayBuffer);

        // Stop any previous fallback source
        if (webSourceRef.current) {
          try {
            webSourceRef.current.stop();
          } catch {
            // ignore
          }
          webSourceRef.current = null;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        const gain = ctx.createGain();
        gain.gain.value = effectiveVolume;

        source.connect(gain);
        gain.connect(ctx.destination);

        webSourceRef.current = source;
        webGainRef.current = gain;

        setVoicePlaying(true);

        source.onended = () => {
          setVoicePlaying(false);
          webSourceRef.current = null;
          try {
            gain.disconnect();
          } catch {
            // ignore
          }
          webGainRef.current = null;
          onEnd?.();
        };

        source.start(0);
      } catch (err) {
        console.error("WebAudio fallback playback failed:", err);
        setVoicePlaying(false);
        onEnd?.();
      }
    },
    [decodeAudioBuffer]
  );

  const speak = useCallback(
    (text: string, mood: VoiceMood = "neutral", onEnd?: () => void) => {
      // Stop ALL media first (centralized coordination)
      stop();

      // Best-effort: unlock audio immediately in the user gesture stack (important on iOS)
      unlockAudioContext();

      // Check if voice is enabled in settings
      const volumeSettings = getVolumeSettings();
      if (!volumeSettings.voiceEnabled) {
        onEnd?.();
        return;
      }

      // If master is effectively muted, don't waste an AI call.
      if (getEffectiveVolume("voice") <= 0.001) {
        onEnd?.();
        return;
      }

      const settings = getVoiceSettings();

      // CRITICAL: Create Audio element IMMEDIATELY in user gesture context
      // This ensures browser allows playback after async operations
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = getEffectiveVolume("voice");
      audioRef.current = audio;

      // Try Premium AI voice with consistent Toothy voice
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            // No session - silently skip voice (user is not signed in)
            cleanupAudio();
            onEnd?.();
            return;
          }

          // Get the consistent Toothy voice with mood variation
          const voiceConfig = getVoiceForMood(mood);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                text,
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
            cleanupAudio();
            onEnd?.();
            return;
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;

          // Set source on pre-existing element (created in user gesture context)
          audio.src = url;

          audio.onended = () => {
            setVoicePlaying(false);
            cleanupAudio();
            onEnd?.();
          };

          audio.onerror = () => {
            setVoicePlaying(false);
            cleanupAudio();
            onEnd?.();
          };

          try {
            await audio.play();
            // Register with centralized manager only once we know playback started.
            registerVoiceAudio(audio);
          } catch (err) {
            // Common on iOS/Safari: HTMLAudio playback blocked after async work.
            console.warn("HTMLAudio voice playback blocked; falling back to WebAudio.", err);
            cleanupAudio();
            await playWithWebAudioFallback(blob, onEnd);
          }
        } catch {
          cleanupAudio();
          onEnd?.();
        }
      })();
    },
    [cleanupAudio, playWithWebAudioFallback, stop]
  );

  const speakIntro = useCallback((intro: string) => {
    speak(intro, "curious");
  }, [speak]);

  const speakQuestComplete = useCallback(
    (questTitle: string, xpEarned: number) => {
      const message = `Yay! Quest Complete! You earned ${xpEarned} experience points!`;
      speak(message, "excited");
    },
    [speak]
  );

  const speakBadgeEarned = useCallback(
    (badgeName: string) => {
      const message = `Wow! You earned a new badge: ${badgeName}!`;
      speak(message, "excited");
    },
    [speak]
  );

  const speakEnding = useCallback(
    (ending: string) => {
      speak(ending, "positive");
    },
    [speak]
  );

  const speakEncouragement = useCallback(
    (message: string) => {
      speak(message, "encouraging");
    },
    [speak]
  );

  return {
    speak,
    speakIntro,
    speakQuestComplete,
    speakBadgeEarned,
    speakEnding,
    speakEncouragement,
    stop,
  };
};

export default useQuestVoice;
