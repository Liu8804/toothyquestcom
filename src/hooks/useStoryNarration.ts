import { useCallback, useEffect, useRef, useState } from "react";

interface UseStoryNarrationReturn {
  isPlaying: boolean;
  isLoading: boolean;
  isPaused: boolean;
  error: string | null;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

type NarrationMode = "none" | "audio" | "speech";

const createSilenceWavBlob = (durationMs = 250, sampleRate = 8000) => {
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const dataSize = numSamples * 2; // 16-bit PCM
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // format = PCM
  view.setUint16(22, 1, true); // channels = 1
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);
  // samples are already 0 (silence)

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
    if (modeRef.current === "speech") {
      cleanupSpeech();
    }
    cleanupAudio();
    modeRef.current = "none";
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
  }, [cleanupAudio, cleanupSpeech]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const playWithBrowserSpeech = useCallback((text: string) => {
    if (!(typeof window !== "undefined" && "speechSynthesis" in window)) {
      setError("Audio playback isn't available on this device.");
      return;
    }

    cleanupAudio();
    cleanupSpeech();
    modeRef.current = "speech";

    setError(null);
    setIsLoading(false);
    setIsPlaying(false);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = (event) => {
      setIsPlaying(false);
      setIsPaused(false);
      if (event.error !== "interrupted") {
        setError("Sorry, there was an error playing the story.");
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [cleanupAudio, cleanupSpeech]);

  const play = useCallback(
    (text: string) => {
      stop();
      setError(null);
      setIsLoading(true);

      modeRef.current = "audio";

      // Create the audio element immediately on the user click.
      // Also start a tiny silent audio loop to "unlock" playback on strict autoplay policies.
      const audio = new Audio();
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
        setError("Sorry, there was an error playing the story.");
      };

      try {
        const unlockUrl = URL.createObjectURL(createSilenceWavBlob(350));
        unlockUrlRef.current = unlockUrl;
        audio.src = unlockUrl;
        audio.loop = true;
        audio.volume = 0;
        // Fire-and-forget: if this fails, we still try to play real audio later.
        void audio.play();
      } catch {
        // ignore
      }

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: "pFZP5JQG7iQjIQuC4Bku" }),
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

            // Stop unlock loop
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.loop = false;
              audioRef.current.volume = 1;
            }
            if (unlockUrlRef.current) {
              URL.revokeObjectURL(unlockUrlRef.current);
              unlockUrlRef.current = null;
            }

            // If provider blocked (401/402/429 etc), fall back so narration still works.
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

          // Replace unlock audio with real narration
          if (unlockUrlRef.current) {
            URL.revokeObjectURL(unlockUrlRef.current);
            unlockUrlRef.current = null;
          }

          audioRef.current.pause();
          audioRef.current.loop = false;
          audioRef.current.volume = 1;
          audioRef.current.currentTime = 0;
          audioRef.current.src = audioUrl;

          setIsLoading(false);

          audioRef.current.play().then(
            () => {
              setIsPlaying(true);
              setIsPaused(false);
            },
            (playErr) => {
              console.error("Narration playback blocked:", playErr);
              setIsPlaying(false);
              setIsPaused(false);
              setError("Audio playback was blocked. Tap Listen again, or allow audio playback.");
              // Fallback to speech synthesis if available
              playWithBrowserSpeech(text);
            }
          );
        })
        .catch((err) => {
          console.error("ElevenLabs TTS error:", err);
          setIsLoading(false);
          setError("Failed to generate narration. Please try again.");
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
