import { useCallback, useEffect, useState } from "react";
import { getAudioContext, playSynthTone, isVoiceActive, unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume, isGloballyMuted } from "@/components/VolumeControlPanel";

/**
 * Positive Sounds System
 * 
 * Short, playful sound effects for positive moments:
 * - Quest completed
 * - Reward unlocked
 * - Streak achieved
 * 
 * All sounds are 1-2 seconds, kid-friendly, and controlled by a global toggle.
 * Default: OFF (to respect users who may prefer quiet experiences)
 */

const STORAGE_KEY = "toothyquest-positive-sounds-enabled";

// Get global sound enabled state
export const isPositiveSoundsEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

// Set global sound enabled state
export const setPositiveSoundsEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent("toothyquest:positive-sounds-changed", { detail: enabled }));
};

export const usePositiveSounds = () => {
  const [isEnabled, setIsEnabled] = useState(() => isPositiveSoundsEnabled());

  // Sync state when changed from settings
  useEffect(() => {
    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsEnabled(customEvent.detail);
    };

    window.addEventListener("toothyquest:positive-sounds-changed", handleChange);
    return () => window.removeEventListener("toothyquest:positive-sounds-changed", handleChange);
  }, []);

  const togglePositiveSounds = useCallback(() => {
    const newValue = !isEnabled;
    setPositiveSoundsEnabled(newValue);
    setIsEnabled(newValue);
    return newValue;
  }, [isEnabled]);

  // Quest Complete Sound - Triumphant ascending melody (1.5s)
  const playQuestComplete = useCallback(() => {
    if (!isEnabled || isVoiceActive() || isGloballyMuted()) return;
    
    unlockAudioContext();
    const ctx = getAudioContext();
    const volume = getEffectiveVolume("sfx");
    if (volume === 0) return;

    // Ascending happy fanfare: C5 → E5 → G5 → C6
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        try {
          if (ctx.state === "suspended") return;
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          const noteVolume = Math.min(1, volume * 0.6);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(noteVolume, ctx.currentTime + 0.02);
          gain.gain.setValueAtTime(noteVolume, ctx.currentTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
          console.error("Quest complete sound error:", e);
        }
      }, i * 120);
    });
  }, [isEnabled]);

  // Reward Unlocked Sound - Sparkly chime (1s)
  const playRewardUnlocked = useCallback(() => {
    if (!isEnabled || isVoiceActive() || isGloballyMuted()) return;
    
    unlockAudioContext();
    const ctx = getAudioContext();
    const volume = getEffectiveVolume("sfx");
    if (volume === 0) return;

    // Sparkling high notes: A5 → E6 → A6
    const notes = [880, 1319, 1760];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        try {
          if (ctx.state === "suspended") return;
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          const noteVolume = Math.min(1, volume * 0.5);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(noteVolume, ctx.currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.25);
        } catch (e) {
          console.error("Reward sound error:", e);
        }
      }, i * 80);
    });
  }, [isEnabled]);

  // Streak Achieved Sound - Celebratory jingle (1.5s)
  const playStreakAchieved = useCallback(() => {
    if (!isEnabled || isVoiceActive() || isGloballyMuted()) return;
    
    unlockAudioContext();
    const ctx = getAudioContext();
    const volume = getEffectiveVolume("sfx");
    if (volume === 0) return;

    // Celebratory pattern: G5 → B5 → D6 → G6 (major arpeggio)
    const notes = [784, 988, 1175, 1568];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        try {
          if (ctx.state === "suspended") return;
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          const noteVolume = Math.min(1, volume * 0.55);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(noteVolume, ctx.currentTime + 0.02);
          gain.gain.setValueAtTime(noteVolume, ctx.currentTime + 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
          console.error("Streak sound error:", e);
        }
      }, i * 100);
    });
  }, [isEnabled]);

  return {
    isEnabled,
    togglePositiveSounds,
    playQuestComplete,
    playRewardUnlocked,
    playStreakAchieved,
  };
};

export default usePositiveSounds;
