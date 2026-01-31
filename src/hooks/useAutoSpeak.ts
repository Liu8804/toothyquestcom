import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { unlockAudioContext, setVoicePlaying, registerVoiceAudio } from "./useAudioManager";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";
import { buildFunctionsHeaders } from "@/lib/functionsAuth";

/**
 * Voice-first hook for non-readers (ages 3-6)
 * Auto-speaks instructions when a screen loads using Toothy's AI voice ONLY
 * Tapping again replays the instruction
 * 
  * NO browser TTS fallback - uses Toothy AI voice for both signed-in and guest users
 */

interface UseAutoSpeakOptions {
  /** Text to speak on mount */
  instruction: string;
  /** Delay before speaking (ms) - allows animations to settle */
  delay?: number;
  /** Whether to auto-speak on mount */
  autoSpeak?: boolean;
  /** Callback when speech ends */
  onEnd?: () => void;
  /** Voice mood for emotional variation */
  mood?: VoiceMood;
}

export const useAutoSpeak = ({
  instruction,
  delay = 500,
  autoSpeak = true,
  onEnd,
  mood = "neutral",
}: UseAutoSpeakOptions) => {
  const hasSpokenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

  const speak = useCallback(() => {
    // Check if voice is enabled
    const volumeSettings = getVolumeSettings();
    if (!volumeSettings.voiceEnabled) {
      onEnd?.();
      return;
    }

    const effectiveVolume = getEffectiveVolume("voice");
    if (effectiveVolume <= 0.001) {
      onEnd?.();
      return;
    }

    // Cleanup any previous audio
    cleanupAudio();

    // Unlock audio context (important for iOS)
    unlockAudioContext();

    isSpeakingRef.current = true;

    // Create audio element immediately for iOS compatibility
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = effectiveVolume;
    audioRef.current = audio;

    // Use Toothy's AI voice only
    (async () => {
      try {
        const voiceConfig = getVoiceForMood(mood);
        const headers = await buildFunctionsHeaders();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              text: instruction,
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
          isSpeakingRef.current = false;
          cleanupAudio();
          onEnd?.();
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        audio.src = url;

        audio.onended = () => {
          isSpeakingRef.current = false;
          setVoicePlaying(false);
          cleanupAudio();
          onEnd?.();
        };

        audio.onerror = () => {
          isSpeakingRef.current = false;
          setVoicePlaying(false);
          cleanupAudio();
          onEnd?.();
        };

        await audio.play();
        setVoicePlaying(true);
        registerVoiceAudio(audio);
      } catch {
        isSpeakingRef.current = false;
        cleanupAudio();
        onEnd?.();
      }
    })();
  }, [instruction, onEnd, mood, cleanupAudio]);

  // Auto-speak on mount
  useEffect(() => {
    if (!autoSpeak || hasSpokenRef.current) return;

    const timer = setTimeout(() => {
      hasSpokenRef.current = true;
      speak();
    }, delay);

    return () => {
      clearTimeout(timer);
      cleanupAudio();
    };
  }, [autoSpeak, delay, speak, cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const replay = useCallback(() => {
    speak();
  }, [speak]);

  const stop = useCallback(() => {
    cleanupAudio();
    isSpeakingRef.current = false;
    setVoicePlaying(false);
  }, [cleanupAudio]);

  return {
    speak,
    replay,
    stop,
    isSpeaking: isSpeakingRef.current,
  };
};

/**
 * Simplified hook for tap-to-speak buttons
 * Uses Toothy's AI voice only - no browser TTS fallback
 */
export const useTapSpeak = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

  const speak = useCallback((text: string, onEnd?: () => void, mood: VoiceMood = "neutral") => {
    const volumeSettings = getVolumeSettings();
    if (!volumeSettings.voiceEnabled) {
      onEnd?.();
      return;
    }

    const effectiveVolume = getEffectiveVolume("voice");
    if (effectiveVolume <= 0.001) {
      onEnd?.();
      return;
    }

    unlockAudioContext();
    cleanupAudio();

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = effectiveVolume;
    audioRef.current = audio;

    (async () => {
      try {
        const voiceConfig = getVoiceForMood(mood);
        const headers = await buildFunctionsHeaders();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers,
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

        await audio.play();
        setVoicePlaying(true);
        registerVoiceAudio(audio);
      } catch {
        cleanupAudio();
        onEnd?.();
      }
    })();
  }, [cleanupAudio]);

  return { speak };
};

export default useAutoSpeak;
