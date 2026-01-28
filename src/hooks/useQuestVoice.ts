import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getVoiceSettings } from "@/components/VoiceSettingsModal";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { 
  stopAllMedia, 
  setVoicePlaying, 
  registerVoiceAudio 
} from "./useAudioManager";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";

/**
 * Quest voice hook for short narration lines (intro, ending, celebrations).
 * Uses ONE consistent voice (Toothy) with mood variations for emotional context.
 * - Uses Premium AI voice (ElevenLabs) ONLY when the user is signed in
 * - NO browser speech fallback (eliminates male voice issue)
 * 
 * AUDIO COORDINATION: Uses centralized audio manager to prevent overlapping
 */
export const useQuestVoice = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const hasShownAuthToastRef = useRef(false);

  const cleanupAudio = useCallback(() => {
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

  const speak = useCallback(
    (text: string, mood: VoiceMood = "neutral", onEnd?: () => void) => {
      // Stop ALL media first (centralized coordination)
      stop();

      // Check if voice is enabled in settings
      const volumeSettings = getVolumeSettings();
      if (!volumeSettings.voiceEnabled) {
        onEnd?.();
        return;
      }

      const settings = getVoiceSettings();
      const wantsAiVoice = settings.provider === "elevenlabs";

      if (!wantsAiVoice) {
        // User doesn't want AI voice - just skip (no browser speech)
        onEnd?.();
        return;
      }

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
            if (!hasShownAuthToastRef.current) {
              hasShownAuthToastRef.current = true;
              toast.info("AI voice needs sign-in to work.");
            }
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
          
          // Register with centralized manager for proper coordination
          registerVoiceAudio(audio);

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

          await audio.play();
        } catch {
          cleanupAudio();
          onEnd?.();
        }
      })();
    },
    [cleanupAudio, stop]
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
