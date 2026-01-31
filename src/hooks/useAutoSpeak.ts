import { useEffect, useRef, useCallback } from "react";
import { speakBrowserTts, cancelBrowserTts } from "@/lib/speechSynthesis";
import { unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";

/**
 * Voice-first hook for non-readers (ages 3-6)
 * Auto-speaks instructions when a screen loads
 * Tapping again replays the instruction
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
}

export const useAutoSpeak = ({
  instruction,
  delay = 500,
  autoSpeak = true,
  onEnd,
}: UseAutoSpeakOptions) => {
  const hasSpokenRef = useRef(false);
  const isSpeakingRef = useRef(false);

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

    // Cancel any ongoing speech
    cancelBrowserTts();

    // Unlock audio context (important for iOS)
    unlockAudioContext();

    isSpeakingRef.current = true;

    speakBrowserTts({
      text: instruction,
      rate: 0.85, // Slower for kids
      pitch: 1.1, // Slightly higher pitch for friendly tone
      volume: effectiveVolume,
      onEnd: () => {
        isSpeakingRef.current = false;
        onEnd?.();
      },
      onError: () => {
        isSpeakingRef.current = false;
        onEnd?.();
      },
    });
  }, [instruction, onEnd]);

  // Auto-speak on mount
  useEffect(() => {
    if (!autoSpeak || hasSpokenRef.current) return;

    const timer = setTimeout(() => {
      hasSpokenRef.current = true;
      speak();
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelBrowserTts();
    };
  }, [autoSpeak, delay, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelBrowserTts();
    };
  }, []);

  const replay = useCallback(() => {
    speak();
  }, [speak]);

  const stop = useCallback(() => {
    cancelBrowserTts();
    isSpeakingRef.current = false;
  }, []);

  return {
    speak,
    replay,
    stop,
    isSpeaking: isSpeakingRef.current,
  };
};

/**
 * Simplified hook for tap-to-speak buttons
 * Speaks a short phrase when tapped
 */
export const useTapSpeak = () => {
  const speak = useCallback((text: string, onEnd?: () => void) => {
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
    cancelBrowserTts();

    speakBrowserTts({
      text,
      rate: 0.9,
      pitch: 1.1,
      volume: effectiveVolume,
      onEnd,
      onError: onEnd,
    });
  }, []);

  return { speak };
};

export default useAutoSpeak;
