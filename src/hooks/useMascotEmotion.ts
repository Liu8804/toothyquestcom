import { useState, useCallback, useEffect } from "react";
import { MascotEmotion } from "@/components/mascot/MascotEmotionState";

interface UseMascotEmotionOptions {
  defaultEmotion?: MascotEmotion;
  autoResetDelay?: number; // ms to auto-reset to idle/default
}

/**
 * Hook to manage mascot emotion states across the app.
 * 
 * Usage:
 * const { emotion, setEmotion, triggerSuccess, triggerError, triggerHelp } = useMascotEmotion();
 * 
 * // When quest is completed:
 * triggerSuccess(); // Shows "greatJob" emotion
 * 
 * // When user makes a mistake:
 * triggerError(); // Shows "oops" emotion
 * 
 * // When showing tips:
 * triggerHelp(); // Shows "help" emotion
 */
export const useMascotEmotion = (options: UseMascotEmotionOptions = {}) => {
  const { 
    defaultEmotion = "idle", 
    autoResetDelay = 3000 
  } = options;

  const [emotion, setEmotionState] = useState<MascotEmotion>(defaultEmotion);
  const [isTemporary, setIsTemporary] = useState(false);

  // Auto-reset to default emotion after delay
  useEffect(() => {
    if (isTemporary && autoResetDelay > 0) {
      const timer = setTimeout(() => {
        setEmotionState(defaultEmotion);
        setIsTemporary(false);
      }, autoResetDelay);
      return () => clearTimeout(timer);
    }
  }, [emotion, isTemporary, autoResetDelay, defaultEmotion]);

  const setEmotion = useCallback((newEmotion: MascotEmotion, temporary = false) => {
    setEmotionState(newEmotion);
    setIsTemporary(temporary);
  }, []);

  // Quick triggers for common actions
  const triggerSuccess = useCallback(() => {
    setEmotion("greatJob", true);
  }, [setEmotion]);

  const triggerWow = useCallback(() => {
    setEmotion("wow", true);
  }, [setEmotion]);

  const triggerError = useCallback(() => {
    setEmotion("oops", true);
  }, [setEmotion]);

  const triggerHelp = useCallback(() => {
    setEmotion("help", true);
  }, [setEmotion]);

  const triggerGotIt = useCallback(() => {
    setEmotion("gotIt", true);
  }, [setEmotion]);

  const triggerLoading = useCallback(() => {
    setEmotion("loading", false); // Don't auto-reset loading
  }, [setEmotion]);

  const triggerLetsPlay = useCallback(() => {
    setEmotion("letsPlay", true);
  }, [setEmotion]);

  const triggerLevelUp = useCallback(() => {
    setEmotion("levelUp", true);
  }, [setEmotion]);

  const triggerCelebrating = useCallback(() => {
    setEmotion("celebrating", true);
  }, [setEmotion]);

  const resetToIdle = useCallback(() => {
    setEmotion(defaultEmotion, false);
  }, [setEmotion, defaultEmotion]);

  return {
    emotion,
    setEmotion,
    isTemporary,
    // Quick action triggers
    triggerSuccess,
    triggerWow,
    triggerError,
    triggerHelp,
    triggerGotIt,
    triggerLoading,
    triggerLetsPlay,
    triggerLevelUp,
    triggerCelebrating,
    resetToIdle,
  };
};

export default useMascotEmotion;
