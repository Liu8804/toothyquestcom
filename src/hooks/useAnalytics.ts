import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

// Generate a unique session ID
const generateSessionId = () => {
  const stored = sessionStorage.getItem("analytics_session_id");
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem("analytics_session_id", newId);
  return newId;
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string>(generateSessionId());

  // Track an event
  const trackEvent = useCallback(async (
    eventName: string,
    eventData: Record<string, unknown> = {},
    pagePath?: string
  ) => {
    if (!user) return;

    try {
      await supabase.from("analytics_events").insert([{
        user_id: user.id,
        event_name: eventName,
        event_data: eventData as Json,
        page_path: pagePath || window.location.pathname,
        session_id: sessionIdRef.current,
      }]);
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }, [user]);

  // Track page view
  const trackPageView = useCallback((pagePath?: string) => {
    trackEvent("page_view", {}, pagePath);
  }, [trackEvent]);

  // Track button click
  const trackButtonClick = useCallback((buttonName: string, metadata?: Record<string, unknown>) => {
    trackEvent("button_click", { button_name: buttonName, ...metadata });
  }, [trackEvent]);

  // Track feature usage
  const trackFeatureUsage = useCallback((featureName: string, metadata?: Record<string, unknown>) => {
    trackEvent("feature_usage", { feature_name: featureName, ...metadata });
  }, [trackEvent]);

  // Track game started
  const trackGameStarted = useCallback((gameId: string, childId?: string) => {
    trackEvent("game_started", { game_id: gameId, child_id: childId });
  }, [trackEvent]);

  // Track game completed
  const trackGameCompleted = useCallback((gameId: string, score: number, childId?: string) => {
    trackEvent("game_completed", { game_id: gameId, score, child_id: childId });
  }, [trackEvent]);

  // Track story read
  const trackStoryRead = useCallback((storyId: string, childId?: string) => {
    trackEvent("story_read", { story_id: storyId, child_id: childId });
  }, [trackEvent]);

  // Track badge earned
  const trackBadgeEarned = useCallback((badgeId: string, badgeName: string, childId?: string) => {
    trackEvent("badge_earned", { badge_id: badgeId, badge_name: badgeName, child_id: childId });
  }, [trackEvent]);

  // Track brushing session
  const trackBrushingSession = useCallback((duration: number, sessionType: string, childId?: string) => {
    trackEvent("brushing_session", { duration, session_type: sessionType, child_id: childId });
  }, [trackEvent]);

  // Track user signup
  const trackSignup = useCallback(() => {
    trackEvent("user_signup", {});
  }, [trackEvent]);

  // Track user login
  const trackLogin = useCallback(() => {
    trackEvent("user_login", {});
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFeatureUsage,
    trackGameStarted,
    trackGameCompleted,
    trackStoryRead,
    trackBadgeEarned,
    trackBrushingSession,
    trackSignup,
    trackLogin,
  };
};

// Auto-track page views
export const usePageViewTracking = () => {
  const { trackPageView } = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      trackPageView();
    }
  }, [user, trackPageView]);
};
