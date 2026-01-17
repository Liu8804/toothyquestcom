import { useState, useCallback, useRef, useEffect } from "react";

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

export const useStoryNarration = (): UseStoryNarrationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const play = useCallback((text: string) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setIsPaused(false);

    // Create audio element immediately on user gesture to avoid autoplay blocking
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

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      setIsPlaying(true);
      // Play is already triggered by the fetch completion
    };

    // Fetch the audio
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          text,
          voiceId: "pFZP5JQG7iQjIQuC4Bku" // Lily - child-friendly voice
        }),
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`TTS request failed: ${response.status}`);
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          // Use play with user interaction context
          audioRef.current.play().catch((playError) => {
            console.error("Playback error:", playError);
            setIsLoading(false);
            setError("Unable to play audio. Please try again.");
          });
        }
      })
      .catch((err) => {
        console.error("ElevenLabs TTS error:", err);
        setIsLoading(false);
        setError("Failed to generate narration. Please try again.");
      });
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(console.error);
      setIsPaused(false);
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

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
