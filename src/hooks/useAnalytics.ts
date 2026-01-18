import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

export const useAnalytics = () => {
  const { user } = useAuth();

  // Track an event (no session tracking, no PII)
  const trackEvent = useCallback(async (
    eventName: string,
    eventData: Record<string, unknown> = {},
    pagePath?: string
  ) => {
    if (!user) return;

    // Sanitize event data client-side as well
    const sanitizedData = { ...eventData };
    const sensitiveKeys = ['email', 'password', 'token', 'phone', 'address', 'ip'];
    sensitiveKeys.forEach(key => {
      delete sanitizedData[key];
      delete sanitizedData[key.toLowerCase()];
      delete sanitizedData[key.toUpperCase()];
    });

    try {
      await supabase.from("analytics_events").insert([{
        user_id: user.id,
        event_name: eventName,
        event_data: sanitizedData as Json,
        page_path: pagePath || window.location.pathname,
      }]);
    } catch (error) {
      // Silently fail - analytics should not break the app
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
