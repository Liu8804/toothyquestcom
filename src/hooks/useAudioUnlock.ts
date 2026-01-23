import { useEffect } from "react";
import { unlockAudioContext } from "@/hooks/useAudioManager";

/**
 * Ensures WebAudio is resumed after the first user gesture (required on iOS/Safari).
 */
export const useAudioUnlock = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      unlockAudioContext();
    };

    window.addEventListener("pointerdown", handler, { once: true, capture: true, passive: true });
    window.addEventListener("touchstart", handler, { once: true, capture: true, passive: true });
    window.addEventListener("keydown", handler, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("touchstart", handler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, []);
};

export default useAudioUnlock;
