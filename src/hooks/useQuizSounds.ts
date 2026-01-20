import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TOOTHY_VOICE } from "@/config/voiceConfig";

// Quiz sound effect phrases for ElevenLabs TTS
const SOUND_PHRASES = {
  correct: [
    "Yay! Amazing!",
    "Woohoo! You got it!",
    "Hooray! Super smart!",
    "Sparkle sparkle! Yes!",
    "Hee hee! That's right!",
  ],
  incorrect: [
    "Oopsie daisy!",
    "Hmm, try again!",
    "Almost! One more try!",
    "Whoopsie! Not quite!",
    "Silly me, that's not it!",
  ],
  celebration: [
    "You're a superstar!",
    "Amazing job, champion!",
    "Woohoo! You did it!",
    "Sparkle power activated!",
    "You're the best!",
  ],
  giggle: [
    "Hee hee hee!",
    "Tee hee!",
    "Giggle giggle!",
  ],
};

// Web Audio synthesized sounds for instant feedback
const SYNTH_SOUNDS = {
  sparkle: { notes: [1047, 1319, 1568, 2093], duration: 0.12, type: "sine" as OscillatorType },
  success: { notes: [523, 659, 784], duration: 0.15, type: "triangle" as OscillatorType },
  error: { notes: [311, 233], duration: 0.2, type: "sawtooth" as OscillatorType },
  fanfare: { notes: [523, 659, 784, 1047, 1319], duration: 0.18, type: "sine" as OscillatorType },
  pop: { notes: [800], duration: 0.05, type: "sine" as OscillatorType },
  whoosh: { notes: [200, 800], duration: 0.15, type: "sine" as OscillatorType },
};

type SynthSoundName = keyof typeof SYNTH_SOUNDS;
type VoiceSoundName = keyof typeof SOUND_PHRASES;

export const useQuizSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("quizSoundsMuted") === "true";
    }
    return false;
  });

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Play synthesized sound effect (instant)
  const playSynthSound = useCallback((name: SynthSoundName) => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      const sound = SYNTH_SOUNDS[name];
      
      sound.notes.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.type = sound.type;
          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

          // Add some pitch bend for sparkle effect
          if (name === "sparkle") {
            oscillator.frequency.exponentialRampToValueAtTime(
              freq * 1.2,
              ctx.currentTime + sound.duration
            );
          }

          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sound.duration);

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + sound.duration);
        }, i * 80);
      });
    } catch (error) {
      console.error("Error playing synth sound:", error);
    }
  }, [isMuted, getAudioContext]);

  // Play voice sound effect via ElevenLabs
  const playVoiceSound = useCallback(async (name: VoiceSoundName) => {
    if (isMuted || isPlayingVoice) return;

    const phrases = SOUND_PHRASES[name];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    try {
      setIsPlayingVoice(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Fallback to browser speech
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(randomPhrase);
          utterance.rate = 1.1;
          utterance.pitch = 1.3;
          utterance.onend = () => setIsPlayingVoice(false);
          utterance.onerror = () => setIsPlayingVoice(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlayingVoice(false);
        }
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: randomPhrase,
            voiceId: TOOTHY_VOICE.voiceId, // Consistent Toothy voice
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
      
      audio.onended = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (error) {
      console.error("Error playing voice sound:", error);
      setIsPlayingVoice(false);
    }
  }, [isMuted, isPlayingVoice]);

  // Convenience methods
  const playCorrectSound = useCallback(() => {
    playSynthSound("sparkle");
    playVoiceSound("correct");
  }, [playSynthSound, playVoiceSound]);

  const playIncorrectSound = useCallback(() => {
    playSynthSound("error");
    playVoiceSound("incorrect");
  }, [playSynthSound, playVoiceSound]);

  const playCelebrationSound = useCallback(() => {
    playSynthSound("fanfare");
    playVoiceSound("celebration");
  }, [playSynthSound, playVoiceSound]);

  const playGiggleSound = useCallback(() => {
    playSynthSound("pop");
    playVoiceSound("giggle");
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
