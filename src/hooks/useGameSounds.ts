import { useCallback, useRef, useState } from "react";

// Simple pre-loaded sound effects using Web Audio API
const GAME_SOUNDS = {
  tap: { frequency: 800, duration: 0.1, type: "sine" as OscillatorType },
  success: { frequency: 523, duration: 0.2, type: "sine" as OscillatorType },
  win: { frequency: 659, duration: 0.3, type: "sine" as OscillatorType },
  lose: { frequency: 200, duration: 0.4, type: "sawtooth" as OscillatorType },
  star: { frequency: 1047, duration: 0.15, type: "sine" as OscillatorType },
  achievement: { frequency: 880, duration: 0.5, type: "triangle" as OscillatorType },
  locked: { frequency: 150, duration: 0.3, type: "square" as OscillatorType },
  unlock: { frequency: 1200, duration: 0.2, type: "sine" as OscillatorType },
};

type SoundName = keyof typeof GAME_SOUNDS;

export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gameSoundsMuted") === "true";
    }
    return false;
  });

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType,
    startFreq?: number
  ) => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(startFreq || frequency, ctx.currentTime);
      
      if (startFreq) {
        oscillator.frequency.exponentialRampToValueAtTime(frequency, ctx.currentTime + duration);
      }

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [isMuted, getAudioContext]);

  const playSound = useCallback((name: SoundName) => {
    const sound = GAME_SOUNDS[name];
    if (sound) {
      playTone(sound.frequency, sound.duration, sound.type);
    }
  }, [playTone]);

  const playWinFanfare = useCallback(() => {
    if (isMuted) return;

    // Play ascending notes for win celebration
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.2, "sine");
      }, i * 150);
    });
  }, [isMuted, playTone]);

  const playLoseSound = useCallback(() => {
    if (isMuted) return;
    playTone(200, 0.4, "sawtooth", 400);
  }, [isMuted, playTone]);

  const playAchievementUnlock = useCallback(() => {
    if (isMuted) return;

    // Special sparkly sound for achievements
    const notes = [880, 1109, 1319, 1760]; // A5, C#6, E6, A6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.25, "triangle");
      }, i * 100);
    });
  }, [isMuted, playTone]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem("gameSoundsMuted", String(newValue));
      return newValue;
    });
  }, []);

  return {
    playSound,
    playWinFanfare,
    playLoseSound,
    playAchievementUnlock,
    isMuted,
    toggleMute,
  };
};
