import { useCallback, useEffect, useRef } from "react";
import { useAnalytics } from "./useAnalytics";
import { useAuth } from "./useAuth";

/**
 * Session-level KPI tracking:
 * 1. Time to first action (seconds from page load to first meaningful interaction)
 * 2. Games started per session (count)
 * 3. World entry rate (did the user open a world?)
 * 4. Bounce rate (left without any interaction)
 *
 * Run for 3–5 days / ~30–50 users, then query analytics_events to report.
 */

const SESSION_KEY = "tq_session_metrics";

interface SessionData {
  sessionId: string;
  startedAt: number;
  firstActionAt: number | null;
  gamesStarted: number;
  worldsEntered: string[];
  anyInteraction: boolean;
}

const freshSession = (): SessionData => ({
  sessionId: `sm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  startedAt: Date.now(),
  firstActionAt: null,
  gamesStarted: 0,
  worldsEntered: [],
  anyInteraction: false,
});

const getSession = (): SessionData => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const s = freshSession();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
};

const saveSession = (s: SessionData) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
};

export const useSessionMetrics = () => {
  const { trackEvent } = useAnalytics();
  const { user } = useAuth();
  const firedBounceRef = useRef(false);

  // --- 1. Time to first action ---
  const recordFirstAction = useCallback(() => {
    if (!user) return;
    const s = getSession();
    if (s.firstActionAt) return; // already recorded
    s.firstActionAt = Date.now();
    s.anyInteraction = true;
    saveSession(s);

    const ttfa = Math.round((s.firstActionAt - s.startedAt) / 1000);
    trackEvent("session_first_action", { duration: ttfa });
  }, [user, trackEvent]);

  // --- 2. Games started per session ---
  const recordGameStarted = useCallback((gameId: string) => {
    if (!user) return;
    const s = getSession();
    s.gamesStarted += 1;
    s.anyInteraction = true;
    saveSession(s);

    trackEvent("session_game_started", { game_id: gameId, score: s.gamesStarted });
  }, [user, trackEvent]);

  // --- 3. World entry ---
  const recordWorldEntry = useCallback((worldId: string) => {
    if (!user) return;
    const s = getSession();
    if (!s.worldsEntered.includes(worldId)) {
      s.worldsEntered.push(worldId);
    }
    s.anyInteraction = true;
    saveSession(s);

    trackEvent("session_world_entry", { feature_name: worldId });
  }, [user, trackEvent]);

  // --- 4. Bounce detection (fires on page hide if no interaction) ---
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !firedBounceRef.current) {
        const s = getSession();
        if (!s.anyInteraction) {
          firedBounceRef.current = true;
          const duration = Math.round((Date.now() - s.startedAt) / 1000);
          trackEvent("session_bounce", { duration });
        }
      }
    };

    // Also fire on beforeunload for desktop browsers
    const handleBeforeUnload = () => {
      const s = getSession();
      if (!s.anyInteraction && !firedBounceRef.current) {
        firedBounceRef.current = true;
        const duration = Math.round((Date.now() - s.startedAt) / 1000);
        trackEvent("session_bounce", { duration });
      }
      // Always fire session_end with summary
      const final = getSession();
      const totalDuration = Math.round((Date.now() - final.startedAt) / 1000);
      trackEvent("session_end", {
        duration: totalDuration,
        score: final.gamesStarted, // games started count
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, trackEvent]);

  // Mark any interaction (generic fallback)
  const recordInteraction = useCallback(() => {
    const s = getSession();
    if (!s.anyInteraction) {
      s.anyInteraction = true;
      saveSession(s);
    }
  }, []);

  return {
    recordFirstAction,
    recordGameStarted,
    recordWorldEntry,
    recordInteraction,
  };
};
