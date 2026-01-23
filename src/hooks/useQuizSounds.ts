import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TOOTHY_VOICE } from "@/config/voiceConfig";
import { 
  stopAllMedia, 
  setVoicePlaying, 
  isVoiceActive, 
  playSynthTone 
} from "./useAudioManager";

// Quiz sound effect phrases for ElevenLabs TTS
const SOUND_PHRASES = {
  correct: [
    "Yay! Amazing!",
    "Woohoo! You got it!",
    "Hooray! Super smart!",
  ],
  incorrect: [
    "Oopsie! Try again!",
    "Almost! One more try!",
  ],
  celebration: [
    "You're a superstar!",
    "Amazing job!",
    "Woohoo! You did it!",
  ],
  giggle: [
    "Hee hee!",
    "Tee hee!",
  ],
};

// Web Audio synthesized sounds - quieter and shorter for less chaos
const SYNTH_SOUNDS = {
  sparkle: { notes: [1047, 1319], duration: 0.08, type: "sine" as OscillatorType },
  success: { notes: [523, 784], duration: 0.1, type: "triangle" as OscillatorType },
  error: { notes: [311], duration: 0.12, type: "sawtooth" as OscillatorType },
  fanfare: { notes: [523, 784, 1047], duration: 0.12, type: "sine" as OscillatorType },
  pop: { notes: [800], duration: 0.04, type: "sine" as OscillatorType },
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
      }, i * 60);
    });
  }, [isMuted]);

  // Play voice sound effect via ElevenLabs (stops all other audio first)
  const playVoiceSound = useCallback(async (name: VoiceSoundName) => {
    if (isMuted || isVoiceActive()) return;

    const phrases = SOUND_PHRASES[name];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    try {
      // Stop all media before starting new voice
      stopAllMedia();
      setIsPlayingVoice(true);
      setVoicePlaying(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Fallback to browser speech
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(randomPhrase);
          utterance.rate = 1.1;
          utterance.pitch = 1.2;
          utterance.volume = 1;
          utterance.onend = () => {
            setIsPlayingVoice(false);
            setVoicePlaying(false);
          };
          utterance.onerror = () => {
            setIsPlayingVoice(false);
            setVoicePlaying(false);
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlayingVoice(false);
          setVoicePlaying(false);
        }
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
      audio.volume = 1;
      
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

  // Convenience methods - play synth FIRST, then voice with small delay
  const playCorrectSound = useCallback(() => {
    playSynthSound("sparkle");
    // Small delay before voice so synth completes first
    setTimeout(() => playVoiceSound("correct"), 150);
  }, [playSynthSound, playVoiceSound]);

  const playIncorrectSound = useCallback(() => {
    playSynthSound("error");
    setTimeout(() => playVoiceSound("incorrect"), 150);
  }, [playSynthSound, playVoiceSound]);

  const playCelebrationSound = useCallback(() => {
    playSynthSound("fanfare");
    setTimeout(() => playVoiceSound("celebration"), 200);
  }, [playSynthSound, playVoiceSound]);

  const playGiggleSound = useCallback(() => {
    playSynthSound("pop");
    setTimeout(() => playVoiceSound("giggle"), 100);
  }, [playSynthSound, playVoiceSound]);

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
    playCelebrationSound,
    playGiggleSound,
    playSparkleEffect,
    isPlayingVoice,
    isMuted,
    toggleMute,
  };
};
