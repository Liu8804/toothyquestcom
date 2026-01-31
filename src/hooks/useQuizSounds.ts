import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TOOTHY_VOICE } from "@/config/voiceConfig";
import { 
  stopAllMedia, 
  setVoicePlaying, 
  isVoiceActive, 
  playSynthTone 
} from "./useAudioManager";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";

// Quiz sound effect phrases for ElevenLabs TTS - SHORT phrases only
const SOUND_PHRASES = {
  correct: [
    "Yay!",
    "Woohoo!",
    "Amazing!",
  ],
  incorrect: [
    "Oops!",
    "Try again!",
  ],
  celebration: [
    "You did it!",
    "Superstar!",
  ],
  giggle: [
    "Hee hee!",
  ],
};

// Web Audio synthesized sounds - quieter, gentler, and child-friendly
const SYNTH_SOUNDS = {
  sparkle: { notes: [1047, 1319], duration: 0.08, type: "sine" as OscillatorType },
  success: { notes: [523, 784], duration: 0.1, type: "triangle" as OscillatorType },
  // Oops: Soft descending tone (NOT harsh or punishing)
  oops: { notes: [659, 523], duration: 0.12, type: "sine" as OscillatorType },
  error: { notes: [659, 523], duration: 0.12, type: "sine" as OscillatorType }, // Same as oops
  fanfare: { notes: [523, 784, 1047], duration: 0.12, type: "sine" as OscillatorType },
  pop: { notes: [800], duration: 0.05, type: "sine" as OscillatorType },
  whoosh: { notes: [400], duration: 0.08, type: "sine" as OscillatorType },
};

type SynthSoundName = keyof typeof SYNTH_SOUNDS;
type VoiceSoundName = keyof typeof SOUND_PHRASES;

export const useQuizSounds = () => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("quizSoundsMuted") === "true";
    }
    return false;
  });

  // Play synthesized sound effect (instant, ducked when voice plays)
  const playSynthSound = useCallback((name: SynthSoundName) => {
    if (isMuted) return;

    const sound = SYNTH_SOUNDS[name];
    
    // Play notes with small delays
    sound.notes.forEach((freq, i) => {
      setTimeout(() => {
        playSynthTone(freq, sound.duration, sound.type);
      }, i * 50);
    });
  }, [isMuted]);

  // Play voice sound effect via ElevenLabs ONLY (no browser speech fallback)
  const playVoiceSound = useCallback(async (name: VoiceSoundName) => {
    if (isMuted || isVoiceActive()) return;
    
    // Check if voice is enabled in settings
    const volumeSettings = getVolumeSettings();
    if (!volumeSettings.voiceEnabled) return;

    const phrases = SOUND_PHRASES[name];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    try {
      // Stop all media before starting new voice
      stopAllMedia();
      setIsPlayingVoice(true);
      setVoicePlaying(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // No session - just skip voice (no browser speech fallback)
        setIsPlayingVoice(false);
        setVoicePlaying(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: randomPhrase,
            voiceId: TOOTHY_VOICE.voiceId,
            voiceSettings: {
              stability: TOOTHY_VOICE.moods.excited.stability,
              similarityBoost: TOOTHY_VOICE.moods.excited.similarityBoost,
              style: TOOTHY_VOICE.moods.excited.style,
              speed: TOOTHY_VOICE.moods.excited.speed,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Cleanup previous audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }

      const audio = new Audio(url);
      audioElementRef.current = audio;
      audio.volume = getEffectiveVolume("voice");
      
      audio.onended = () => {
        setIsPlayingVoice(false);
        setVoicePlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlayingVoice(false);
        setVoicePlaying(false);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (error) {
      console.error("Error playing voice sound:", error);
      setIsPlayingVoice(false);
      setVoicePlaying(false);
    }
  }, [isMuted]);

  // Convenience methods - play synth only, voice is optional
  const playCorrectSound = useCallback(() => {
    playSynthSound("sparkle");
  }, [playSynthSound]);

  // Play soft "oops" sound for incorrect answers (NOT harsh)
  const playIncorrectSound = useCallback(() => {
    playSynthSound("oops");
  }, [playSynthSound]);

  // Alias for consistency
  const playOopsSound = useCallback(() => {
    playSynthSound("oops");
  }, [playSynthSound]);

  const playCelebrationSound = useCallback(() => {
    playSynthSound("fanfare");
  }, [playSynthSound]);

  const playGiggleSound = useCallback(() => {
    playSynthSound("pop");
  }, [playSynthSound]);

  const playSparkleEffect = useCallback(() => {
    playSynthSound("sparkle");
  }, [playSynthSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem("quizSoundsMuted", String(newValue));
      return newValue;
    });
  }, []);

  return {
    playSynthSound,
    playVoiceSound,
    playCorrectSound,
    playIncorrectSound,
    playOopsSound,
    playCelebrationSound,
    playGiggleSound,
    playSparkleEffect,
    isPlayingVoice,
    isMuted,
    toggleMute,
  };
};
