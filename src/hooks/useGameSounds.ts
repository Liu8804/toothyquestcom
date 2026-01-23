import { useCallback, useState, useRef, useEffect } from "react";
import { getAudioContext, playSynthTone, isVoiceActive, unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

// Simple pre-loaded sound effects
// IMPORTANT: iOS Safari drops tones < 80ms, so keep duration >= 0.12s.
const GAME_SOUNDS = {
  tap: { frequency: 800, duration: 0.12, type: "sine" as OscillatorType },
  success: { frequency: 523, duration: 0.18, type: "sine" as OscillatorType },
  win: { frequency: 659, duration: 0.22, type: "sine" as OscillatorType },
  lose: { frequency: 200, duration: 0.25, type: "sawtooth" as OscillatorType },
  star: { frequency: 1047, duration: 0.15, type: "sine" as OscillatorType },
  achievement: { frequency: 880, duration: 0.25, type: "triangle" as OscillatorType },
  locked: { frequency: 150, duration: 0.18, type: "square" as OscillatorType },
  unlock: { frequency: 1200, duration: 0.15, type: "sine" as OscillatorType },
  bounce: { frequency: 600, duration: 0.12, type: "sine" as OscillatorType },
  pop: { frequency: 900, duration: 0.12, type: "sine" as OscillatorType },
  collect: { frequency: 1100, duration: 0.15, type: "triangle" as OscillatorType },
};

type SoundName = keyof typeof GAME_SOUNDS;

// Background music pattern notes (simple ascending happy tune)
const MUSIC_PATTERNS = {
  happy: [523, 587, 659, 698, 784, 698, 659, 587], // C D E F G F E D
  excited: [784, 880, 988, 1047, 988, 880, 784, 698],
  calm: [392, 440, 494, 523, 494, 440, 392, 349],
};

export const useGameSounds = () => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gameSoundsMuted") === "true";
    }
    return false;
  });
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const musicIndexRef = useRef(0);
  const warnRef = useRef({ sfxZero: false, musicZero: false, ctxSuspended: false });

  // Stop music on unmount
  useEffect(() => {
    return () => {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
      }
    };
  }, []);

  const playSound = useCallback((name: SoundName) => {
    if (isMuted) return;

    // Ensure audio is unlocked on mobile before attempting playback
    unlockAudioContext();

    const sfxVolume = getEffectiveVolume("sfx");
    const ctx = getAudioContext();
    if (!warnRef.current.sfxZero && sfxVolume === 0) {
      warnRef.current.sfxZero = true;
      console.warn("[GameAudio] SFX volume is 0. Open Sound Settings and raise Master/SFX.");
    }
    if (!warnRef.current.ctxSuspended && ctx.state === "suspended") {
      warnRef.current.ctxSuspended = true;
      console.warn("[GameAudio] AudioContext is still suspended (iOS requires a tap + device not muted). Try tapping again and ensure iPhone Silent Mode is OFF.");
    }
    
    const sound = GAME_SOUNDS[name];
    if (sound) {
      playSynthTone(sound.frequency, sound.duration, sound.type);
    }
  }, [isMuted]);

  const playWinFanfare = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    unlockAudioContext();

    // Play ascending notes for win celebration - shorter and cleaner
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.1, "sine");
      }, i * 80);
    });
  }, [isMuted]);

  const playLoseSound = useCallback(() => {
    if (isMuted || isVoiceActive()) return;
    unlockAudioContext();
    playSynthTone(200, 0.15, "sawtooth", 400);
  }, [isMuted]);

  const playAchievementUnlock = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    unlockAudioContext();

    // Special sparkly sound for achievements - fewer notes
    const notes = [880, 1319, 1760]; // A5, E6, A6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.12, "triangle");
      }, i * 70);
    });
  }, [isMuted]);

  // Background music for games
  const startBackgroundMusic = useCallback((pattern: keyof typeof MUSIC_PATTERNS = "happy") => {
    if (isMuted || isMusicPlaying) return;

    unlockAudioContext();

    const musicVolumeNow = getEffectiveVolume("music");
    if (!warnRef.current.musicZero && musicVolumeNow === 0) {
      warnRef.current.musicZero = true;
      console.warn("[GameAudio] Music volume is 0. Open Sound Settings and raise Master/Music.");
    }
    
    setIsMusicPlaying(true);
    musicIndexRef.current = 0;
    
    const notes = MUSIC_PATTERNS[pattern];
    
    const ctx = getAudioContext();

    if (!warnRef.current.ctxSuspended && ctx.state === "suspended") {
      warnRef.current.ctxSuspended = true;
      console.warn("[GameAudio] AudioContext is suspended, background music won't play yet. Tap again and ensure iPhone Silent Mode is OFF.");
    }

    musicIntervalRef.current = setInterval(() => {
      if (isVoiceActive()) return; // Don't play music over voice
      
      const musicVolume = getEffectiveVolume("music");
      if (musicVolume > 0) {
        const freq = notes[musicIndexRef.current % notes.length];
        // iOS: longer note, louder initial gain, gentle ramp
        try {
          if (ctx.state === "suspended") return;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const startGain = Math.min(1, musicVolume * 0.45); // audible on iOS
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(startGain, ctx.currentTime + 0.01);
          gain.gain.setValueAtTime(startGain, ctx.currentTime + 0.28);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.42);
        } catch (e) {
          console.error("Music note error:", e);
        }
      }
      
      musicIndexRef.current++;
    }, 400);
  }, [isMuted, isMusicPlaying]);

  const stopBackgroundMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    setIsMusicPlaying(false);
    musicIndexRef.current = 0;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem("gameSoundsMuted", String(newValue));
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
    playAchievementUnlock,
    startBackgroundMusic,
    stopBackgroundMusic,
    isMusicPlaying,
    isMuted,
    toggleMute,
  };
};
