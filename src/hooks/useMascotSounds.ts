import { useCallback } from "react";
import { playSynthTone, unlockAudioContext, isVoiceActive } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

/**
 * Sound effects specifically for mascot reactions and celebrations
 */

// Mascot reaction sound definitions
const MASCOT_SOUNDS = {
  // Mascot reactions
  wave: { notes: [880, 1047], durations: [0.1, 0.12], type: "sine" as OscillatorType },
  cheer: { notes: [659, 784, 988, 1319], durations: [0.08, 0.08, 0.08, 0.15], type: "triangle" as OscillatorType },
  happy: { notes: [523, 659, 784], durations: [0.08, 0.08, 0.12], type: "sine" as OscillatorType },
  excited: { notes: [784, 988, 1319, 1568], durations: [0.06, 0.06, 0.06, 0.15], type: "sine" as OscillatorType },
  
  // Celebration sounds
  celebrate: { notes: [523, 659, 784, 1047, 1319], durations: [0.08, 0.08, 0.08, 0.1, 0.18], type: "triangle" as OscillatorType },
  confetti: { notes: [1047, 1319, 1568, 2093], durations: [0.05, 0.05, 0.05, 0.12], type: "sine" as OscillatorType },
  sparkle: { notes: [1568, 1976, 2349], durations: [0.06, 0.06, 0.1], type: "sine" as OscillatorType },
  
  // Sticker/collection sounds
  stickerUnlock: { notes: [880, 1047, 1319, 1568], durations: [0.06, 0.06, 0.08, 0.12], type: "triangle" as OscillatorType },
  stickerTap: { notes: [1047, 1319], durations: [0.06, 0.08], type: "sine" as OscillatorType },
  collect: { notes: [659, 784, 988], durations: [0.06, 0.06, 0.1], type: "sine" as OscillatorType },
  
  // Quest sounds
  questStart: { notes: [392, 523, 659, 784], durations: [0.08, 0.08, 0.08, 0.12], type: "sine" as OscillatorType },
  questComplete: { notes: [523, 659, 784, 1047, 1319, 1568], durations: [0.08, 0.08, 0.08, 0.08, 0.1, 0.18], type: "triangle" as OscillatorType },
  xpGain: { notes: [988, 1175, 1319], durations: [0.06, 0.06, 0.1], type: "sine" as OscillatorType },
  
  // First tap celebration
  firstTap: { notes: [523, 659, 784, 988, 1175, 1319, 1568], durations: [0.06, 0.06, 0.06, 0.06, 0.08, 0.1, 0.2], type: "triangle" as OscillatorType },
  
  // Brush action sounds
  brushStart: { notes: [440, 523, 659], durations: [0.08, 0.08, 0.1], type: "sine" as OscillatorType },
  brushComplete: { notes: [659, 784, 988, 1175, 1319], durations: [0.08, 0.08, 0.08, 0.1, 0.15], type: "triangle" as OscillatorType },
  toothClean: { notes: [1175, 1319], durations: [0.05, 0.08], type: "sine" as OscillatorType },
};

type MascotSoundName = keyof typeof MASCOT_SOUNDS;

export const useMascotSounds = () => {
  const playMascotSound = useCallback((name: MascotSoundName) => {
    // Skip if voice is active (audio ducking)
    if (isVoiceActive()) return;
    
    const sfxVolume = getEffectiveVolume("sfx");
    if (sfxVolume === 0) return;
    
    // Unlock audio context on mobile
    unlockAudioContext();
    
    const sound = MASCOT_SOUNDS[name];
    if (!sound) return;
    
    let delay = 0;
    sound.notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, sound.durations[i], sound.type);
      }, delay);
      delay += sound.durations[i] * 800; // Convert to ms with slight overlap
    });
  }, []);

  // Convenience methods for common actions
  const playWave = useCallback(() => playMascotSound("wave"), [playMascotSound]);
  const playCheer = useCallback(() => playMascotSound("cheer"), [playMascotSound]);
  const playHappy = useCallback(() => playMascotSound("happy"), [playMascotSound]);
  const playExcited = useCallback(() => playMascotSound("excited"), [playMascotSound]);
  const playCelebrate = useCallback(() => playMascotSound("celebrate"), [playMascotSound]);
  const playConfetti = useCallback(() => playMascotSound("confetti"), [playMascotSound]);
  const playSparkle = useCallback(() => playMascotSound("sparkle"), [playMascotSound]);
  const playStickerUnlock = useCallback(() => playMascotSound("stickerUnlock"), [playMascotSound]);
  const playStickerTap = useCallback(() => playMascotSound("stickerTap"), [playMascotSound]);
  const playCollect = useCallback(() => playMascotSound("collect"), [playMascotSound]);
  const playQuestStart = useCallback(() => playMascotSound("questStart"), [playMascotSound]);
  const playQuestComplete = useCallback(() => playMascotSound("questComplete"), [playMascotSound]);
  const playXpGain = useCallback(() => playMascotSound("xpGain"), [playMascotSound]);
  const playFirstTap = useCallback(() => playMascotSound("firstTap"), [playMascotSound]);
  const playBrushStart = useCallback(() => playMascotSound("brushStart"), [playMascotSound]);
  const playBrushComplete = useCallback(() => playMascotSound("brushComplete"), [playMascotSound]);
  const playToothClean = useCallback(() => playMascotSound("toothClean"), [playMascotSound]);

  return {
    playMascotSound,
    playWave,
    playCheer,
    playHappy,
    playExcited,
    playCelebrate,
    playConfetti,
    playSparkle,
    playStickerUnlock,
    playStickerTap,
    playCollect,
    playQuestStart,
    playQuestComplete,
    playXpGain,
    playFirstTap,
    playBrushStart,
    playBrushComplete,
    playToothClean,
  };
};

export default useMascotSounds;
