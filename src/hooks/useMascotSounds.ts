import { useCallback } from "react";
import { playSynthTone, unlockAudioContext, isVoiceActive } from "./useAudioManager";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";

/**
 * Sound effects specifically for mascot reactions and celebrations
 */

// Mascot reaction sound definitions
// Using higher frequencies for playful cartoon effect
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
  
  // NEW: Quick "ding" sound for tooth taps - short and satisfying
  ding: { notes: [1760, 2093], durations: [0.06, 0.1], type: "sine" as OscillatorType },
  
  // NEW: Sparkle chime for shine moments
  sparkleChime: { notes: [1976, 2349, 2637], durations: [0.05, 0.05, 0.12], type: "sine" as OscillatorType },
  
  // NEW: Woohoo fanfare for completion
  woohoo: { notes: [784, 988, 1319, 1568, 1976], durations: [0.06, 0.06, 0.08, 0.1, 0.15], type: "triangle" as OscillatorType },
  
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
  
  // Intro hello sound - friendly ascending chime for mascot entrance
  introHello: { notes: [523, 659, 784, 988, 1175], durations: [0.1, 0.1, 0.1, 0.12, 0.18], type: "sine" as OscillatorType },
  
  // Brush action sounds
  brushStart: { notes: [440, 523, 659], durations: [0.08, 0.08, 0.1], type: "sine" as OscillatorType },
  brushComplete: { notes: [659, 784, 988, 1175, 1319], durations: [0.08, 0.08, 0.08, 0.1, 0.15], type: "triangle" as OscillatorType },
  toothClean: { notes: [1175, 1319], durations: [0.05, 0.08], type: "sine" as OscillatorType },
  
  // NEW: Tooth tap shine - quick sparkle for each tooth tap
  toothTapShine: { notes: [1319, 1568, 1760], durations: [0.04, 0.04, 0.08], type: "sine" as OscillatorType },
  
  // Crown glow chime - magical shimmering sound for quest celebration crown effect
  crownGlow: { notes: [2093, 2637, 3136, 2637], durations: [0.06, 0.06, 0.08, 0.1], type: "sine" as OscillatorType },
  
  // Thinking bubble pop - soft bubbly pop for quiz thinking state
  thinkingPop: { notes: [880, 1047], durations: [0.04, 0.06], type: "sine" as OscillatorType },
  
  // Encouragement chime - gentle two-note for brushing encouragement
  encourageChime: { notes: [1047, 1319], durations: [0.06, 0.1], type: "triangle" as OscillatorType },
  
  // Quadrant transition - short ascending note for section change
  quadrantChange: { notes: [659, 784, 988], durations: [0.05, 0.05, 0.08], type: "sine" as OscillatorType },
  
  // Greeting wave - warm hello for daily mascot greeting
  greetingWave: { notes: [523, 659, 784, 880], durations: [0.08, 0.08, 0.08, 0.12], type: "sine" as OscillatorType },
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
  const playIntroHello = useCallback(() => playMascotSound("introHello"), [playMascotSound]);
  const playBrushStart = useCallback(() => playMascotSound("brushStart"), [playMascotSound]);
  const playBrushComplete = useCallback(() => playMascotSound("brushComplete"), [playMascotSound]);
  const playToothClean = useCallback(() => playMascotSound("toothClean"), [playMascotSound]);
  
  // NEW: Playful sounds for kid interactions
  const playDing = useCallback(() => playMascotSound("ding"), [playMascotSound]);
  const playSparkleChime = useCallback(() => playMascotSound("sparkleChime"), [playMascotSound]);
  const playWoohoo = useCallback(() => playMascotSound("woohoo"), [playMascotSound]);
  const playToothTapShine = useCallback(() => playMascotSound("toothTapShine"), [playMascotSound]);
  const playCrownGlow = useCallback(() => playMascotSound("crownGlow"), [playMascotSound]);
  const playThinkingPop = useCallback(() => playMascotSound("thinkingPop"), [playMascotSound]);
  const playEncourageChime = useCallback(() => playMascotSound("encourageChime"), [playMascotSound]);
  const playQuadrantChange = useCallback(() => playMascotSound("quadrantChange"), [playMascotSound]);
  const playGreetingWave = useCallback(() => playMascotSound("greetingWave"), [playMascotSound]);

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
    playIntroHello,
    playBrushStart,
    playBrushComplete,
    playToothClean,
    // Playful sounds
    playDing,
    playSparkleChime,
    playWoohoo,
    playToothTapShine,
    // New animation-synced sounds
    playCrownGlow,
    playThinkingPop,
    playEncourageChime,
    playQuadrantChange,
    playGreetingWave,
  };
};

export default useMascotSounds;
