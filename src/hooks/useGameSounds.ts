import { useCallback, useState } from "react";
import { playSynthTone, isVoiceActive } from "./useAudioManager";

// Simple pre-loaded sound effects - shorter durations for less chaos
const GAME_SOUNDS = {
  tap: { frequency: 800, duration: 0.06, type: "sine" as OscillatorType },
  success: { frequency: 523, duration: 0.12, type: "sine" as OscillatorType },
  win: { frequency: 659, duration: 0.15, type: "sine" as OscillatorType },
  lose: { frequency: 200, duration: 0.2, type: "sawtooth" as OscillatorType },
  star: { frequency: 1047, duration: 0.1, type: "sine" as OscillatorType },
  achievement: { frequency: 880, duration: 0.2, type: "triangle" as OscillatorType },
  locked: { frequency: 150, duration: 0.15, type: "square" as OscillatorType },
  unlock: { frequency: 1200, duration: 0.1, type: "sine" as OscillatorType },
};

type SoundName = keyof typeof GAME_SOUNDS;

export const useGameSounds = () => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gameSoundsMuted") === "true";
    }
    return false;
  });

  const playSound = useCallback((name: SoundName) => {
    if (isMuted) return;
    
    const sound = GAME_SOUNDS[name];
    if (sound) {
      playSynthTone(sound.frequency, sound.duration, sound.type);
    }
  }, [isMuted]);

  const playWinFanfare = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    // Play ascending notes for win celebration - shorter and cleaner
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.12, "sine");
      }, i * 100);
    });
  }, [isMuted]);

  const playLoseSound = useCallback(() => {
    if (isMuted || isVoiceActive()) return;
    playSynthTone(200, 0.2, "sawtooth", 400);
  }, [isMuted]);

  const playAchievementUnlock = useCallback(() => {
    if (isMuted || isVoiceActive()) return;

    // Special sparkly sound for achievements - fewer notes
    const notes = [880, 1319, 1760]; // A5, E6, A6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, 0.15, "triangle");
      }, i * 80);
    });
  }, [isMuted]);

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
