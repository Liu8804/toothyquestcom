import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSoundEffectsReturn {
  playSound: (prompt: string, duration?: number) => Promise<void>;
  isLoading: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

// Pre-defined sound effects for common actions
export const SOUND_PROMPTS = {
  questComplete: "magical sparkle chime celebration sound effect for kids",
  badgeEarned: "triumphant fanfare achievement unlocked sound effect",
  brushingStart: "fun bubbly toothpaste squirt sound effect",
  brushingComplete: "cheerful ding completion sound effect for children",
  buttonClick: "soft pop click sound effect",
  storyStart: "magical book opening whoosh sound effect",
  xpGain: "coin collect sparkle sound effect for game",
  questUnlock: "magical unlock sparkle whoosh sound effect for kids game",
  purchaseSuccess: "triumphant celebration fanfare with sparkles for kids",
  lockedContent: "soft mysterious lock clicking sound effect",
} as const;

export const useSoundEffects = (): UseSoundEffectsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("soundMuted") === "true";
    }
    return false;
  });
  const audioCache = useRef<Map<string, string>>(new Map());

  const playSound = useCallback(async (prompt: string, duration = 3) => {
    if (isMuted) return;

    // Check cache first
    const cacheKey = `${prompt}-${duration}`;
    let audioUrl = audioCache.current.get(cacheKey);

    if (!audioUrl) {
      setIsLoading(true);
      try {
        // Get user session for authenticated request
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.log("Sound effects require authentication");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ prompt, duration }),
          }
        );

        if (!response.ok) {
          throw new Error(`SFX request failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        audioCache.current.set(cacheKey, audioUrl);
      } catch (error) {
        console.error("Failed to generate sound effect:", error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    const audio = new Audio(audioUrl);
    audio.volume = 0.5;
    await audio.play().catch(console.error);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("soundMuted", String(newValue));
      return newValue;
    });
  }, []);

  return { playSound, isLoading, isMuted, toggleMute };
};
