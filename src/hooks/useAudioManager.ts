import { useCallback, useRef, useState, useEffect } from "react";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

/**
 * Centralized Audio Manager
 * 
 * Prevents chaotic audio overlapping by:
 * 1. Canceling all speech before starting new speech
 * 2. Ducking (lowering volume) of sound effects when voice is playing
 * 3. Queueing voice playback to prevent multiple voices at once
 * 4. Managing audio element lifecycle
 * 5. Respecting user volume settings
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
  synthVolume: 0.15, // Lowered default SFX volume
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
  // When voice starts, duck synth sounds even more; restore when voice stops
  audioState.synthVolume = playing ? 0.05 : 0.15;
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
  const userVolume = getEffectiveVolume("sfx");
  return audioState.isVoicePlaying ? userVolume * 0.3 : userVolume * 0.5;
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
  audioState.synthVolume = 0.05; // Duck synth sounds
  
  // Reset state when audio ends
  audio.addEventListener("ended", () => {
    audioState.isVoicePlaying = false;
    audioState.synthVolume = 0.15;
    audioState.currentAudio = null;
  }, { once: true });
  
  audio.addEventListener("error", () => {
    audioState.isVoicePlaying = false;
    audioState.synthVolume = 0.15;
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

    // Use user volume settings + ducking when voice is playing
    const volume = getSynthVolume();
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
    audio.volume = getEffectiveVolume("voice");
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

  // Note: Browser speech removed - only use ElevenLabs AI voice
  // This eliminates the "man voice" issue

  return {
    playVoiceAudio,
    stopAll: stopAllMedia,
    cleanup,
    isVoiceActive,
  };
};

export default useAudioManager;
