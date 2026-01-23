import { useCallback, useRef } from "react";

/**
 * Centralized Audio Manager
 * 
 * Prevents chaotic audio overlapping by:
 * 1. Canceling all speech before starting new speech
 * 2. Ducking (lowering volume) of sound effects when voice is playing
 * 3. Queueing voice playback to prevent multiple voices at once
 * 4. Managing audio element lifecycle
 */


interface AudioState {
  isVoicePlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  synthVolume: number;
}

// Singleton state for cross-hook coordination
const audioState: AudioState = {
  isVoicePlaying: false,
  currentAudio: null,
  synthVolume: 0.3,
};

// Global audio context for synth sounds
let globalAudioContext: AudioContext | null = null;

const getGlobalAudioContext = (): AudioContext => {
  if (!globalAudioContext) {
    globalAudioContext = new AudioContext();
  }
  return globalAudioContext;
};

/**
 * Stop all currently playing speech synthesis
 */
export const stopAllSpeech = (): void => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Stop all audio elements
 */
export const stopAllAudio = (): void => {
  if (audioState.currentAudio) {
    audioState.currentAudio.pause();
    audioState.currentAudio.src = "";
    audioState.currentAudio = null;
  }
  audioState.isVoicePlaying = false;
};

/**
 * Stop everything - speech and audio
 */
export const stopAllMedia = (): void => {
  stopAllSpeech();
  stopAllAudio();
};

/**
 * Set voice playing state (used to duck other sounds)
 */
export const setVoicePlaying = (playing: boolean): void => {
  audioState.isVoicePlaying = playing;
  // When voice starts, duck synth sounds; restore when voice stops
  audioState.synthVolume = playing ? 0.1 : 0.3;
};

/**
 * Check if voice is currently playing
 */
export const isVoiceActive = (): boolean => {
  return audioState.isVoicePlaying;
};

/**
 * Get current synth volume (ducked when voice is playing)
 */
export const getSynthVolume = (): number => {
  return audioState.synthVolume;
};

/**
 * Register an audio element as the current voice audio
 */
export const registerVoiceAudio = (audio: HTMLAudioElement): void => {
  // Stop any existing audio first
  stopAllAudio();
  stopAllSpeech();
  
  audioState.currentAudio = audio;
  audioState.isVoicePlaying = true;
  audioState.synthVolume = 0.1; // Duck synth sounds
  
  // Reset state when audio ends
  audio.addEventListener("ended", () => {
    audioState.isVoicePlaying = false;
    audioState.synthVolume = 0.3;
    audioState.currentAudio = null;
  }, { once: true });
  
  audio.addEventListener("error", () => {
    audioState.isVoicePlaying = false;
    audioState.synthVolume = 0.3;
    audioState.currentAudio = null;
  }, { once: true });
};

/**
 * Play a synth tone with proper volume ducking
 */
export const playSynthTone = (
  frequency: number,
  duration: number,
  type: OscillatorType,
  startFreq?: number
): void => {
  try {
    const ctx = getGlobalAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq || frequency, ctx.currentTime);
    
    if (startFreq) {
      oscillator.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + duration);
    }

    // Use ducked volume when voice is playing
    const volume = audioState.isVoicePlaying ? 0.08 : audioState.synthVolume;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.error("Error playing synth tone:", error);
  }
};

/**
 * Hook for components to access audio manager
 */
export const useAudioManager = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
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

  const playVoiceAudio = useCallback(async (audioBlob: Blob): Promise<void> => {
    // Stop everything first
    stopAllMedia();
    cleanup();

    const url = URL.createObjectURL(audioBlob);
    audioUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;
    
    // Register with global manager
    registerVoiceAudio(audio);

    audio.addEventListener("ended", () => {
      cleanup();
    }, { once: true });

    audio.addEventListener("error", () => {
      cleanup();
    }, { once: true });

    try {
      await audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
      cleanup();
      throw err;
    }
  }, [cleanup]);

  const playBrowserSpeech = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
  }): void => {
    // Stop everything first
    stopAllMedia();

    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not available");
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = 1;

    // Find a good voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.localService)
      || voices.find(v => v.lang.startsWith("en"))
      || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setVoicePlaying(true);
    };

    utterance.onend = () => {
      setVoicePlaying(false);
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        console.error("Speech error:", event.error);
      }
      setVoicePlaying(false);
      options?.onEnd?.();
    };

    setVoicePlaying(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    playVoiceAudio,
    playBrowserSpeech,
    stopAll: stopAllMedia,
    cleanup,
    isVoiceActive,
  };
};

export default useAudioManager;
