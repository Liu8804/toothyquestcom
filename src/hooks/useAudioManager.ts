import { useCallback, useRef } from "react";
import { getEffectiveVolume, isGloballyMuted } from "@/components/VolumeControlPanel";

/**
 * Centralized Audio Manager
 * 
 * Manages all audio playback coordination:
 * 1. Voice audio (ElevenLabs TTS only - no browser speechSynthesis)
 * 2. Sound effects with ducking when voice is playing
 * 3. AudioContext lifecycle for iOS compatibility
 * 4. Volume settings and global mute
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
  synthVolume: 0.15,
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
 * Public accessor for the shared AudioContext.
 */
export const getAudioContext = (): AudioContext => getGlobalAudioContext();

/**
 * Attempt to resume the shared AudioContext (must be called from a user gesture on iOS).
 */
export const unlockAudioContext = (): void => {
  try {
    const ctx = getGlobalAudioContext();

    const prime = () => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.frequency.value = 440;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t0 = ctx.currentTime;
        osc.start(t0);
        osc.stop(t0 + 0.01);
      } catch {
        // ignore
      }
    };

    if (ctx.state === "suspended") {
      void ctx.resume().then(prime).catch(() => {});
      return;
    }

    prime();
  } catch {
    // ignore
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
 * Stop everything - all audio
 * Note: Browser speechSynthesis removed - only ElevenLabs voice is used
 */
export const stopAllMedia = (): void => {
  stopAllAudio();
};

/**
 * Set voice playing state (used to duck other sounds)
 */
export const setVoicePlaying = (playing: boolean): void => {
  audioState.isVoicePlaying = playing;
  audioState.synthVolume = playing ? 0.05 : 0.15;
};

/**
 * Check if voice is currently playing
 */
export const isVoiceActive = (): boolean => {
  if (audioState.isVoicePlaying) {
    const a = audioState.currentAudio;
    if (!a || a.ended || a.paused) {
      audioState.isVoicePlaying = false;
      audioState.synthVolume = 0.15;
      audioState.currentAudio = null;
    }
  }
  return audioState.isVoicePlaying;
};

/**
 * Get current synth volume (ducked when voice is playing).
 */
export const getSynthVolume = (): number => {
  if (isGloballyMuted()) return 0;
  
  const userVolume = getEffectiveVolume("sfx");
  return Math.min(1, audioState.isVoicePlaying ? userVolume * 0.35 : userVolume * 1.2);
};

/**
 * Register an audio element as the current voice audio
 */
export const registerVoiceAudio = (audio: HTMLAudioElement): void => {
  stopAllAudio();
  
  audioState.currentAudio = audio;
  audioState.isVoicePlaying = true;
  audioState.synthVolume = 0.05;
  
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
  if (isGloballyMuted()) return;
  
  const run = () => {
    try {
      const ctx = getGlobalAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(startFreq || frequency, ctx.currentTime);

      if (startFreq) {
        oscillator.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + duration);
      }

      const volume = getSynthVolume();
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration + 0.02);
    } catch (error) {
      console.error("Error playing synth tone:", error);
    }
  };

  try {
    const ctx = getGlobalAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume().then(run).catch(() => {});
      return;
    }
  } catch {
    // fallthrough to run()
  }

  run();
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
    stopAllMedia();
    cleanup();

    const url = URL.createObjectURL(audioBlob);
    audioUrlRef.current = url;

    const audio = new Audio(url);
    audio.volume = getEffectiveVolume("voice");
    audioRef.current = audio;
    
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

  return {
    playVoiceAudio,
    stopAll: stopAllMedia,
    cleanup,
    isVoiceActive,
  };
};

export default useAudioManager;
