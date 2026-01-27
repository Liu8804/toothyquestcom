import { useCallback } from "react";
import { useRiveMascot, MascotEvent } from "@/contexts/RiveMascotContext";

/**
 * Hook to easily trigger Rive mascot animations from anywhere in the app.
 * 
 * Usage:
 * const { triggerQuestComplete, triggerBrushingStarted } = useRiveMascotTrigger();
 * 
 * // When quest is completed:
 * triggerQuestComplete();
 * 
 * // When brushing timer starts:
 * triggerBrushingStarted();
 */
export const useRiveMascotTrigger = () => {
  const { triggerEvent } = useRiveMascot();

  const triggerIdle = useCallback(() => {
    triggerEvent("idle");
  }, [triggerEvent]);

  const triggerTap = useCallback(() => {
    triggerEvent("tapMascot");
  }, [triggerEvent]);

  const triggerBrushingStarted = useCallback(() => {
    triggerEvent("brushingStarted");
  }, [triggerEvent]);

  const triggerBrushingComplete = useCallback(() => {
    triggerEvent("brushingComplete");
  }, [triggerEvent]);

  const triggerQuestComplete = useCallback(() => {
    triggerEvent("questComplete");
  }, [triggerEvent]);

  const triggerStreakAchieved = useCallback(() => {
    triggerEvent("streakAchieved");
  }, [triggerEvent]);

  const triggerLevelUp = useCallback(() => {
    triggerEvent("levelUp");
  }, [triggerEvent]);

  const triggerBadgeEarned = useCallback(() => {
    triggerEvent("badgeEarned");
  }, [triggerEvent]);

  return {
    triggerIdle,
    triggerTap,
    triggerBrushingStarted,
    triggerBrushingComplete,
    triggerQuestComplete,
    triggerStreakAchieved,
    triggerLevelUp,
    triggerBadgeEarned,
    // Generic trigger for custom events
    triggerEvent,
  };
};
