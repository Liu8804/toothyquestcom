import { useCallback } from "react";
import { useAnalytics } from "./useAnalytics";

/**
 * Engagement analytics hook for tracking user interactions
 * specifically focused on first-time user engagement and session metrics
 */

export const useEngagementAnalytics = () => {
  const { trackEvent } = useAnalytics();

  // Track first CTA tap (most important for bounce rate)
  const trackFirstTap = useCallback(() => {
    trackEvent("first_tap", { button_name: "start_quest" });
    // Also set localStorage to prevent duplicate tracking
    if (!localStorage.getItem("toothyquest_first_tap_tracked")) {
      localStorage.setItem("toothyquest_first_tap_tracked", "true");
    }
  }, [trackEvent]);

  // Track CTA hover (indicates interest but not commitment)
  const trackCTAHover = useCallback(() => {
    trackEvent("cta_hover", { button_name: "start_quest" });
  }, [trackEvent]);

  // Track mascot interactions
  const trackMascotInteraction = useCallback((interactionType: "wave" | "cheer" | "tap" | "hover" | "idle_wiggle") => {
    trackEvent("mascot_interaction", { button_name: interactionType });
  }, [trackEvent]);

  // Track onboarding progress
  const trackOnboardingStep = useCallback((step: number, action: "view" | "complete" | "skip") => {
    trackEvent("onboarding_step", { 
      feature_name: `step_${step}`,
      button_name: action 
    });
  }, [trackEvent]);

  // Track onboarding completion
  const trackOnboardingComplete = useCallback(() => {
    trackEvent("onboarding_complete", {});
  }, [trackEvent]);

  // Track quest interactions
  const trackQuestStart = useCallback((questId: string) => {
    trackEvent("quest_started", { quest_id: questId });
  }, [trackEvent]);

  const trackQuestProgress = useCallback((questId: string, progressPercent: number) => {
    trackEvent("quest_progress", { 
      quest_id: questId,
      score: progressPercent 
    });
  }, [trackEvent]);

  const trackQuestComplete = useCallback((questId: string, score: number) => {
    trackEvent("quest_completed", { 
      quest_id: questId,
      score 
    });
  }, [trackEvent]);

  // Track sticker collection
  const trackStickerOpen = useCallback(() => {
    trackEvent("feature_usage", { feature_name: "sticker_collection" });
  }, [trackEvent]);

  const trackStickerUnlock = useCallback((stickerId: string) => {
    trackEvent("sticker_unlocked", { badge_id: stickerId });
  }, [trackEvent]);

  const trackStickerTap = useCallback((stickerId: string) => {
    trackEvent("sticker_tap", { badge_id: stickerId });
  }, [trackEvent]);

  // Track celebration events (engagement quality indicators)
  const trackCelebration = useCallback((celebrationType: "first_tap" | "quest_complete" | "streak" | "badge") => {
    trackEvent("celebration_shown", { feature_name: celebrationType });
  }, [trackEvent]);

  // Track session engagement
  const trackSessionStart = useCallback(() => {
    const sessionId = `session_${Date.now()}`;
    localStorage.setItem("toothyquest_current_session", sessionId);
    localStorage.setItem("toothyquest_session_start", Date.now().toString());
    trackEvent("session_start", {});
  }, [trackEvent]);

  const getSessionDuration = useCallback((): number => {
    const startTime = localStorage.getItem("toothyquest_session_start");
    if (!startTime) return 0;
    return Math.floor((Date.now() - parseInt(startTime)) / 1000);
  }, []);

  // Track scroll depth (indicates content engagement)
  const trackScrollDepth = useCallback((sectionId: string) => {
    trackEvent("scroll_depth", { feature_name: sectionId });
  }, [trackEvent]);

  // Track interactive element engagement
  const trackInteractiveElement = useCallback((elementType: "tooth" | "brush" | "floss" | "timer", action: "tap" | "drag" | "complete") => {
    trackEvent("interactive_element", { 
      feature_name: elementType,
      button_name: action 
    });
  }, [trackEvent]);

  return {
    // Core engagement
    trackFirstTap,
    trackCTAHover,
    trackMascotInteraction,
    
    // Onboarding
    trackOnboardingStep,
    trackOnboardingComplete,
    
    // Quests
    trackQuestStart,
    trackQuestProgress,
    trackQuestComplete,
    
    // Stickers
    trackStickerOpen,
    trackStickerUnlock,
    trackStickerTap,
    
    // Celebrations
    trackCelebration,
    
    // Session
    trackSessionStart,
    getSessionDuration,
    trackScrollDepth,
    
    // Interactive elements
    trackInteractiveElement,
  };
};

export default useEngagementAnalytics;
