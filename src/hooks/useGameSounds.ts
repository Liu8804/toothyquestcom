import { useCallback, useState, useRef, useEffect } from "react";
import { getAudioContext, playSynthTone, isVoiceActive, unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

// Simple pre-loaded sound effects
// IMPORTANT: iOS Safari drops tones < 80ms, so keep duration >= 0.12s.
const GAME_SOUNDS = {
  tap: { frequency: 800, duration: 0.12, type: "sine" as OscillatorType },
  success: { frequency: 523, duration: 0.18, type: "sine" as OscillatorType },
  win: { frequency: 659, duration: 0.22, type: "sine" as OscillatorType },
  // Oops/Lose: Soft descending tone - friendly, not harsh
  oops: { frequency: 523, duration: 0.15, type: "sine" as OscillatorType, endFreq: 392 },
  lose: { frequency: 523, duration: 0.15, type: "sine" as OscillatorType, endFreq: 392 }, // Same as oops
  star: { frequency: 1047, duration: 0.15, type: "sine" as OscillatorType },
  achievement: { frequency: 880, duration: 0.25, type: "triangle" as OscillatorType },
  locked: { frequency: 150, duration: 0.18, type: "square" as OscillatorType },
  unlock: { frequency: 1200, duration: 0.15, type: "sine" as OscillatorType },
  bounce: { frequency: 600, duration: 0.12, type: "sine" as OscillatorType },
  pop: { frequency: 900, duration: 0.12, type: "sine" as OscillatorType },
  collect: { frequency: 1100, duration: 0.15, type: "triangle" as OscillatorType },
  correct: { frequency: 660, duration: 0.15, type: "sine" as OscillatorType },
  progress: { frequency: 550, duration: 0.12, type: "triangle" as OscillatorType },
  complete: { frequency: 784, duration: 0.2, type: "sine" as OscillatorType },
};

type SoundName = keyof typeof GAME_SOUNDS;

// Soft, calm, loop-friendly background music patterns
// Lower frequencies and gentle progressions for kid-friendly ambiance
const MUSIC_PATTERNS = {
  happy: [392, 440, 494, 523, 494, 440, 392, 349], // G A B C B A G F - gentle ascending
  excited: [523, 587, 659, 587, 523, 494, 523, 587], // C D E D C B C D - playful
  calm: [262, 294, 330, 294, 262, 247, 262, 294], // Lower octave, very soft
  adventure: [330, 392, 440, 494, 440, 392, 330, 294], // E G A B A G E D
  puzzle: [349, 392, 440, 392, 349, 330, 349, 392], // F G A G F E F G - thoughtful
};

export type MusicPattern = keyof typeof MUSIC_PATTERNS;

// Global flag to track if any game music is playing
let globalMusicPlaying = false;

export const useGameSounds = () => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      // Default to NOT muted - games should have sound by default
      const storedValue = localStorage.getItem("gameSoundsMuted");
      // Only mute if explicitly set to "true"
      return storedValue === "true";
    }
    return false;
  });

  // Keep mute state in sync when other UI (like Sound Settings) clears legacy mute flags.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      try {
        const storedValue = localStorage.getItem("gameSoundsMuted");
        setIsMuted(storedValue === "true");
      } catch {
        // ignore
      }
    };

    window.addEventListener("toothyquest:audio-mute-flags-updated", sync);
    return () => window.removeEventListener("toothyquest:audio-mute-flags-updated", sync);
  }, []);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const musicIndexRef = useRef(0);
  const warnRef = useRef({ sfxZero: false, musicZero: false, ctxSuspended: false });
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount - ensure music stops
  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }
      globalMusicPlaying = false;
    };
  }, []);

  const playSound = useCallback((name: SoundName) => {
    if (isMuted) {
      return;
    }

    // Ensure audio is unlocked on mobile before attempting playback
    unlockAudioContext();

    const sfxVolume = getEffectiveVolume("sfx");
    const ctx = getAudioContext();
    
    // Log once for debugging
    if (!warnRef.current.sfxZero && sfxVolume === 0) {
      warnRef.current.sfxZero = true;
      console.warn("[GameAudio] SFX volume is 0. Open Sound Settings and raise Master/SFX.");
    }
    if (!warnRef.current.ctxSuspended && ctx.state === "suspended") {
      warnRef.current.ctxSuspended = true;
      console.warn("[GameAudio] AudioContext is suspended. User interaction needed to enable audio.");
    }
    
    const sound = GAME_SOUNDS[name];
    if (!sound) {
      console.warn("[GameSounds] Unknown sound:", name);
      return;
    }

    // Get effective volume - ensure minimum audible level
    const finalVolume = Math.max(sfxVolume, 0.15);

    // Force resume context and play sound
    const playTone = () => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = sound.type;
        osc.frequency.setValueAtTime(sound.frequency, ctx.currentTime);

        // Ensure audible volume with quick attack
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.015);
        gain.gain.setValueAtTime(finalVolume, ctx.currentTime + sound.duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + sound.duration + 0.02);
      } catch (e) {
        console.error("[GameSounds] Error playing sound:", e);
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(playTone).catch((e) => {
        console.warn("[GameSounds] Could not resume AudioContext:", e);
      });
    } else {
      playTone();
    }
  }, [isMuted]);

  const playWinFanfare = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    unlockAudioContext();

    // Play ascending notes for win celebration - short and cheerful
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.12, "sine");
      }, i * 100);
    });
  }, [isMuted]);

  // Soft "oops" / "lose" sound - gentle descending tone (NOT harsh or punishing)
  const playLoseSound = useCallback(() => {
    if (isMuted || isVoiceActive()) return;
    unlockAudioContext();
    // E5 → C5 (descending minor third = gentle "try again")
    playSynthTone(659, 0.12, "sine");
    setTimeout(() => playSynthTone(523, 0.15, "sine"), 100);
  }, [isMuted]);

  // Alias for friendly "oops" sound
  const playOopsSound = useCallback(() => {
    playLoseSound();
  }, [playLoseSound]);

  const playAchievementUnlock = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    unlockAudioContext();

    // Special sparkly sound for achievements
    const notes = [880, 1319, 1760]; // A5, E6, A6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.12, "triangle");
      }, i * 80);
    });
  }, [isMuted]);

  // Soft, calm background music for games
  const startBackgroundMusic = useCallback((pattern: MusicPattern = "calm") => {
    if (isMuted || isMusicPlaying || globalMusicPlaying) return;

    unlockAudioContext();

    const musicVolumeNow = getEffectiveVolume("music");
    if (!warnRef.current.musicZero && musicVolumeNow === 0) {
      warnRef.current.musicZero = true;
      console.warn("[GameAudio] Music volume is 0. Open Sound Settings and raise Master/Music.");
    }
    
    setIsMusicPlaying(true);
    globalMusicPlaying = true;
    musicIndexRef.current = 0;
    
    const notes = MUSIC_PATTERNS[pattern];
    
    const ctx = getAudioContext();

    if (!warnRef.current.ctxSuspended && ctx.state === "suspended") {
      warnRef.current.ctxSuspended = true;
      console.warn("[GameAudio] AudioContext is suspended, background music won't play yet.");
    }

    // Softer, slower tempo for calm background music
    musicIntervalRef.current = setInterval(() => {
      if (isUnmountedRef.current) {
        if (musicIntervalRef.current) {
          clearInterval(musicIntervalRef.current);
          musicIntervalRef.current = null;
        }
        return;
      }
      
      if (isVoiceActive()) return; // Don't play music over voice
      
      const musicVolume = getEffectiveVolume("music");
      if (musicVolume > 0) {
        const freq = notes[musicIndexRef.current % notes.length];
        try {
          if (ctx.state === "suspended") return;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Use sine for softest sound
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Very gentle volume - background ambiance
          const startGain = Math.min(0.25, musicVolume * 0.3);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(startGain, ctx.currentTime + 0.02);
          gain.gain.setValueAtTime(startGain, ctx.currentTime + 0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.55);
        } catch (e) {
          console.error("Music note error:", e);
        }
      }
      
      musicIndexRef.current++;
    }, 500); // Slower tempo for calmer feel
  }, [isMuted, isMusicPlaying]);

  const stopBackgroundMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    setIsMusicPlaying(false);
    globalMusicPlaying = false;
    musicIndexRef.current = 0;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem("gameSoundsMuted", String(newValue));
      window.dispatchEvent(new Event("toothyquest:audio-mute-flags-updated"));
      if (newValue) {
        stopBackgroundMusic();
      }
      return newValue;
    });
  }, [stopBackgroundMusic]);

  return {
    playSound,
    playWinFanfare,
    playLoseSound,
    playOopsSound,
    playAchievementUnlock,
    startBackgroundMusic,
    stopBackgroundMusic,
    isMusicPlaying,
    isMuted,
    toggleMute,
  };
};
