import { useCallback } from "react";
import { getAudioContext, isVoiceActive, unlockAudioContext } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

/**
 * Button and UI Sounds
 * 
 * Short, subtle, child-friendly sound effects for common UI interactions.
 * All sounds are gentle and non-harsh - suitable for young children.
 * Respects user volume settings and mute state.
 */

// Play a synth tone with proper envelope
const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3
) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Soft attack, natural decay
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch {
    // Silent fail - audio not critical
  }
};

export const useButtonSounds = () => {
  // Soft pop for button taps - higher pitched, very short
  const playTap = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    playTone(880, 0.1, "sine", sfxVolume * 0.4);
  }, []);

  // Gentle click for toggles/switches - subtle tick
  const playClick = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    playTone(1200, 0.06, "sine", sfxVolume * 0.3);
  }, []);

  // Success chime - happy ascending two-note
  const playSuccess = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    // C5 → E5 (major third = happy sound)
    playTone(523, 0.15, "sine", sfxVolume * 0.35);
    setTimeout(() => playTone(659, 0.18, "sine", sfxVolume * 0.4), 100);
  }, []);

  // Soft whoosh for navigation/transitions
  const playWhoosh = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      // Descending sweep for whoosh effect
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      
      const vol = sfxVolume * 0.2;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Silent fail
    }
  }, []);

  // Celebration sound - triumphant ascending arpeggio
  const playCelebration = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    // C5 → E5 → G5 → C6 (major arpeggio = very happy)
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "triangle", sfxVolume * 0.35), i * 80);
    });
  }, []);

  // Oops sound - soft, friendly, descending (NOT harsh)
  const playOops = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") return;
      
      // Soft descending "boop" - friendly, not punishing
      // E5 → C5 (minor third down = gentle "oops")
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      
      osc1.type = "sine";
      osc2.type = "sine";
      
      osc1.frequency.setValueAtTime(659, ctx.currentTime); // E5
      osc2.frequency.setValueAtTime(523, ctx.currentTime); // C5
      
      const vol = sfxVolume * 0.3;
      
      // First note
      gain1.gain.setValueAtTime(0.001, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      // Second note (slightly delayed)
      gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(vol * 0.8, ctx.currentTime + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.12);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Silent fail
    }
  }, []);

  // Reward sparkle - quick high sparkle
  const playSparkle = useCallback(() => {
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    unlockAudioContext();
    
    // High, quick sparkle notes
    const notes = [1319, 1760, 2093]; // E6, A6, C7
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.1, "sine", sfxVolume * 0.25), i * 50);
    });
  }, []);

  return {
    playTap,
    playClick,
    playSuccess,
    playWhoosh,
    playCelebration,
    playOops,
    playSparkle,
  };
};

export default useButtonSounds;
