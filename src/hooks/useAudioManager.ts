import { useCallback, useRef } from "react";
import { getEffectiveVolume, isGloballyMuted } from "@/components/VolumeControlPanel";

/**
 * Centralized Audio Manager
 * 
 * Prevents chaotic audio overlapping by:
 * 1. Canceling all speech before starting new speech
 * 2. Ducking (lowering volume) of sound effects when voice is playing
 * 3. Queueing voice playback to prevent multiple voices at once
 * 4. Managing audio element lifecycle
 * 5. Respecting user volume settings and global mute
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
 * Public accessor for the shared AudioContext.
 * (Used by game music + SFX so we don't create/ leak contexts.)
 */
export const getAudioContext = (): AudioContext => getGlobalAudioContext();

/**
 * Attempt to resume the shared AudioContext (must be called from a user gesture on iOS).
 */
export const unlockAudioContext = (): void => {
  try {
    const ctx = getGlobalAudioContext();

    const prime = () => {
      // Prime WebAudio with a near-silent, ultra-short oscillator.
      // This is a common iOS Safari requirement to fully unlock audio output.
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
      void ctx.resume().then(prime).catch(() => {
        // ignore
      });
      return;
    }

    prime();
  } catch {
    // ignore
  }
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
  // Self-heal: if something went wrong and we never received an "ended" event,
  // don't permanently block SFX/music.
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
 * Returns 0 if globally muted.
 * iOS Safari needs louder signals and less aggressive ramp-down.
 */
export const getSynthVolume = (): number => {
  if (isGloballyMuted()) return 0;
  
  const userVolume = getEffectiveVolume("sfx");
  // Boost for mobile audibility (clamped to [0,1]).
  return Math.min(1, audioState.isVoicePlaying ? userVolume * 0.35 : userVolume * 1.2);
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
 * Respects global mute setting
 */
export const playSynthTone = (
  frequency: number,
  duration: number,
  type: OscillatorType,
  startFreq?: number
): void => {
  // Check global mute first
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

      // Use user volume settings + ducking when voice is playing
      const volume = getSynthVolume();
      // iOS Safari: avoid instant 0-gain start; ramp up briefly, sustain, then decay.
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime); // avoid click
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration + 0.02); // small tail to avoid iOS cutoff
    } catch (error) {
      console.error("Error playing synth tone:", error);
    }
  };

  try {
    const ctx = getGlobalAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume().then(run).catch(() => {
        // If resume fails (no user gesture), just skip.
      });
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
