import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getVoiceSettings } from "@/components/VoiceSettingsModal";
import { getBaseVoice, getVoiceForMood, VoiceMood } from "@/config/voiceConfig";

/**
 * Quest voice hook for short narration lines (intro, ending, celebrations).
 * Uses ONE consistent voice (Lily) with mood variations for emotional context.
 * - Uses Premium AI voice (ElevenLabs) when selected AND the user is signed in
 * - Falls back to browser speech synthesis otherwise
 */
export const useQuestVoice = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    isSpeakingRef.current = false;
    cleanupAudio();
  }, [cleanupAudio]);

  const speakWithBrowserSpeech = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!(typeof window !== "undefined" && "speechSynthesis" in window)) {
        console.warn("Speech synthesis not available");
        onEnd?.();
        return;
      }

      const voiceSettings = getVoiceSettings();

      const speakNow = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceSettings.speed;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice =
          voices.find((v) => v.lang.startsWith("en") && v.localService) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];

        if (englishVoice) utterance.voice = englishVoice;

        utterance.onstart = () => {
          isSpeakingRef.current = true;
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
          onEnd?.();
        };

        utterance.onerror = (event) => {
          console.error("Quest voice error:", event.error);
          isSpeakingRef.current = false;
          if (event.error !== "interrupted" && event.error !== "canceled") {
            onEnd?.();
          }
        };

        utteranceRef.current = utterance;
        isSpeakingRef.current = true;
        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        const handleVoicesChanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speakNow();
        };
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        setTimeout(() => {
          if (!isSpeakingRef.current) {
            window.speechSynthesis.onvoiceschanged = null;
            speakNow();
          }
        }, 150);
      } else {
        speakNow();
      }
    },
    []
  );

  const speak = useCallback(
    (text: string, mood: VoiceMood = "neutral", onEnd?: () => void) => {
      // Stop any current voice
      stop();

      const settings = getVoiceSettings();
      const wantsAiVoice = settings.provider === "elevenlabs";

      if (!wantsAiVoice) {
        speakWithBrowserSpeech(text, onEnd);
        return;
      }

      // Try Premium AI voice with consistent Toothy voice
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            if (!hasShownAuthToastRef.current) {
              hasShownAuthToastRef.current = true;
              toast.info("AI voice needs sign-in — using browser voice for now.");
            }
            speakWithBrowserSpeech(text, onEnd);
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
            // If AI fails, keep the app responsive.
            speakWithBrowserSpeech(text, onEnd);
            return;
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            cleanupAudio();
            onEnd?.();
          };

          audio.onerror = () => {
            cleanupAudio();
            speakWithBrowserSpeech(text, onEnd);
          };

          await audio.play();
        } catch {
          speakWithBrowserSpeech(text, onEnd);
        }
      })();
    },
    [cleanupAudio, speakWithBrowserSpeech, stop]
  );

  const speakIntro = useCallback((intro: string) => {
    speak(intro, "curious");
  }, [speak]);

  const speakQuestComplete = useCallback(
    (questTitle: string, xpEarned: number) => {
      const message = `Yay! Quest Complete! ${questTitle}. You earned ${xpEarned} experience points. Tooth-tastic job!`;
      speak(message, "excited");
    },
    [speak]
  );

  const speakBadgeEarned = useCallback(
    (badgeName: string) => {
      const message = `Wow! You earned a new badge: ${badgeName}! You're amazing!`;
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
