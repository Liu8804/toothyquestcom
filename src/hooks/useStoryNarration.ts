import { useCallback, useEffect, useRef, useState } from "react";
import { getVoiceSettings } from "@/components/VoiceSettingsModal";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { supabase } from "@/integrations/supabase/client";
import { 
  stopAllMedia, 
  setVoicePlaying, 
  registerVoiceAudio 
} from "./useAudioManager";

interface UseStoryNarrationReturn {
  isPlaying: boolean;
  isLoading: boolean;
  isPaused: boolean;
  error: string | null;
  play: (text: string, mood?: VoiceMood) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

type NarrationMode = "none" | "audio" | "speech";

const createSilenceWavBlob = (durationMs = 250, sampleRate = 8000) => {
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  return new Blob([buffer], { type: "audio/wav" });
};

export const useStoryNarration = (): UseStoryNarrationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modeRef = useRef<NarrationMode>("none");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const unlockUrlRef = useRef<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (unlockUrlRef.current) {
      URL.revokeObjectURL(unlockUrlRef.current);
      unlockUrlRef.current = null;
    }
  }, []);

  const cleanupSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
  }, []);

  const stop = useCallback(() => {
    // Use centralized stop for proper coordination
    stopAllMedia();
    
    if (modeRef.current === "speech") {
      cleanupSpeech();
    }
    cleanupAudio();
    modeRef.current = "none";
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setVoicePlaying(false);
  }, [cleanupAudio, cleanupSpeech]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const playWithBrowserSpeech = useCallback((text: string) => {
    if (!(typeof window !== "undefined" && "speechSynthesis" in window)) {
      setError("Audio playback isn't available on this device.");
      return;
    }

    // Stop all media first for clean transition
    stopAllMedia();
    cleanupAudio();
    cleanupSpeech();
    modeRef.current = "speech";

    setError(null);
    setIsLoading(false);
    setIsPaused(false);

    const voiceSettings = getVoiceSettings();
    
    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.localService) 
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setVoicePlaying(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setVoicePlaying(false);
      };
      utterance.onerror = (event) => {
        console.error("Browser speech error:", event.error);
        setIsPlaying(false);
        setIsPaused(false);
        setVoicePlaying(false);
        if (event.error !== "interrupted" && event.error !== "canceled") {
          setError("Sorry, there was an error playing the story.");
        }
      };

      utteranceRef.current = utterance;
      
      setIsPlaying(true);
      setVoicePlaying(true);
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakNow();
      };
      setTimeout(() => {
        if (!utteranceRef.current) {
          speakNow();
        }
      }, 100);
    } else {
      speakNow();
    }
  }, [cleanupAudio, cleanupSpeech]);

  const play = useCallback(
    (text: string, mood: VoiceMood = "neutral") => {
      // Stop ALL media first (centralized coordination)
      stop();
      setError(null);

      const voiceSettings = getVoiceSettings();

      if (voiceSettings.provider === "browser") {
        playWithBrowserSpeech(text);
        return;
      }

      setIsLoading(true);
      modeRef.current = "audio";

      const audio = new Audio();
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setVoicePlaying(false);
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
        setVoicePlaying(false);
        setError("Sorry, there was an error playing the story.");
      };

      // Unlock audio for autoplay policies
      try {
        const unlockUrl = URL.createObjectURL(createSilenceWavBlob(350));
        unlockUrlRef.current = unlockUrl;
        audio.src = unlockUrl;
        audio.loop = true;
        audio.volume = 0;
        void audio.play();
      } catch {
        // ignore
      }

      const voiceConfig = getVoiceForMood(mood);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) {
          setIsLoading(false);
          playWithBrowserSpeech(text);
          return;
        }
        
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            text, 
            voiceId: voiceConfig.voiceId,
            voiceSettings: {
              stability: voiceConfig.stability,
              similarityBoost: voiceConfig.similarityBoost,
              style: voiceConfig.style,
              speed: voiceConfig.speed,
            },
          }),
        })
        .then(async (response) => {
          if (!response.ok) {
            let serverMessage = `Voice request failed (${response.status})`;
            try {
              const data = await response.json();
              if (typeof data?.error === "string") serverMessage = data.error;
            } catch {
              // ignore
            }

            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.loop = false;
              audioRef.current.volume = 1;
            }
            if (unlockUrlRef.current) {
              URL.revokeObjectURL(unlockUrlRef.current);
              unlockUrlRef.current = null;
            }

            if ([401, 402, 429, 403].includes(response.status)) {
              setError(serverMessage);
              playWithBrowserSpeech(text);
              return;
            }

            setIsLoading(false);
            setError(serverMessage);
            return;
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          audioUrlRef.current = audioUrl;

          if (!audioRef.current) return;

          if (unlockUrlRef.current) {
            URL.revokeObjectURL(unlockUrlRef.current);
            unlockUrlRef.current = null;
          }

          audioRef.current.pause();
          audioRef.current.loop = false;
          audioRef.current.volume = 1;
          audioRef.current.currentTime = 0;
          audioRef.current.src = audioUrl;
          
          // Register with centralized manager
          registerVoiceAudio(audioRef.current);

          setIsLoading(false);

          audioRef.current.play().then(
            () => {
              setIsPlaying(true);
              setIsPaused(false);
              setVoicePlaying(true);
            },
            (playErr) => {
              console.error("Narration playback blocked:", playErr);
              setIsPlaying(false);
              setIsPaused(false);
              setVoicePlaying(false);
              setError("Audio playback was blocked. Tap Listen again.");
              playWithBrowserSpeech(text);
            }
          );
        })
        .catch((err) => {
          console.error("ElevenLabs TTS error:", err);
          setIsLoading(false);
          setVoicePlaying(false);
          setError("Failed to generate narration. Please try again.");
        });
      });
    },
    [playWithBrowserSpeech, stop]
  );

  const pause = useCallback(() => {
    if (modeRef.current === "speech") {
      if (typeof window !== "undefined" && "speechSynthesis" in window && isPlaying) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (modeRef.current === "speech") {
      if (typeof window !== "undefined" && "speechSynthesis" in window && isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
      return;
    }

    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(() => {
        setError("Audio playback was blocked. Tap Listen again.");
      });
      setIsPaused(false);
    }
  }, [isPaused]);

  return {
    isPlaying,
    isLoading,
    isPaused,
    error,
    play,
    pause,
    resume,
    stop,
  };
};

export default useStoryNarration;
