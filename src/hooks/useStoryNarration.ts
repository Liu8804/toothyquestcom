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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for speech synthesis support
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeechSupported]);

  const play = useCallback((text: string) => {
    if (!isSpeechSupported) {
      setError("Speech synthesis is not supported in your browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setError(null);
    setIsLoading(true);

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for child-friendly narration
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1;

    // Try to find a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Samantha") || 
             v.name.includes("Victoria") ||
             v.name.includes("Karen") ||
             v.name.includes("Google") ||
             v.lang.startsWith("en")
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
      if (event.error !== "interrupted") {
        setError("Sorry, there was an error playing the story.");
      }
    };

    utteranceRef.current = utterance;

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [isSpeechSupported]);

  const pause = useCallback(() => {
    if (isSpeechSupported && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeechSupported, isPlaying]);

  const resume = useCallback(() => {
    if (isSpeechSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeechSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isSpeechSupported]);

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
