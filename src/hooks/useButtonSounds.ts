import { useCallback } from "react";
import { playSynthTone, isVoiceActive, unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

/**
 * Button and UI Sounds
 * 
 * Short, subtle sound effects for common UI interactions.
 * Respects user volume settings and mute state.
 */

export const useButtonSounds = () => {
  // Soft pop for button taps
  const playTap = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    playSynthTone(880, 0.08, "sine");
  }, []);

  // Gentle click for toggles/switches
  const playClick = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    playSynthTone(1200, 0.05, "sine");
  }, []);

  // Success chime for confirmations
  const playSuccess = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    // Two-note ascending chime
    playSynthTone(523, 0.1, "sine"); // C5
    setTimeout(() => playSynthTone(659, 0.12, "sine"), 80); // E5
  }, []);

  // Soft whoosh for navigation/transitions
  const playWhoosh = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    playSynthTone(400, 0.15, "sine", 200);
  }, []);

  // Celebration for achievements/completions
  const playCelebration = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    // Ascending triumphant sequence
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playSynthTone(freq, 0.12, "triangle"), i * 100);
    });
  }, []);

  return {
    playTap,
    playClick,
    playSuccess,
    playWhoosh,
    playCelebration,
  };
};

export default useButtonSounds;
