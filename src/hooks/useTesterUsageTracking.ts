import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTesterMode } from "@/hooks/useTesterMode";

/**
 * Hook to track screen visits and time spent for tester accounts
 */
export const useTesterUsageTracking = (screenName: string) => {
  const { user } = useAuth();
  const { isTester, isActive } = useTesterMode();
  const sessionIdRef = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  );
  const startTimeRef = useRef<number>(Date.now());
  const hasLoggedVisitRef = useRef<boolean>(false);

  // Log screen visit when component mounts
  const logScreenVisit = useCallback(async () => {
    if (!user?.id || !isTester || !isActive || hasLoggedVisitRef.current) return;

    hasLoggedVisitRef.current = true;

    try {
      await supabase.from("tester_usage_logs").insert({
        user_id: user.id,
        screen_name: screenName,
        session_id: sessionIdRef.current,
        time_spent_seconds: 0,
        metadata: {
          device: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to log screen visit:", error);
    }
  }, [user?.id, isTester, isActive, screenName]);

  // Update time spent when component unmounts or screen changes
  const logTimeSpent = useCallback(async () => {
    if (!user?.id || !isTester || !isActive) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      // Update the most recent log for this screen and session
      await supabase
        .from("tester_usage_logs")
        .update({ time_spent_seconds: timeSpent })
        .eq("user_id", user.id)
        .eq("screen_name", screenName)
        .eq("session_id", sessionIdRef.current);

      // Also update the activity summary
      await updateActivitySummary(user.id, timeSpent);
    } catch (error) {
      console.error("Failed to log time spent:", error);
    }
  }, [user?.id, isTester, isActive, screenName]);

  // Update activity summary table
  const updateActivitySummary = async (userId: string, additionalTime: number) => {
    try {
      // First try to get existing summary
      const { data: existing } = await supabase
        .from("tester_activity_summary")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("tester_activity_summary")
          .update({
            total_screens_visited: existing.total_screens_visited + 1,
            total_time_spent_seconds: existing.total_time_spent_seconds + additionalTime,
            last_activity_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("tester_activity_summary").insert({
          user_id: userId,
          total_screens_visited: 1,
          total_time_spent_seconds: additionalTime,
          last_activity_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to update activity summary:", error);
    }
  };

  // Log quest completion for testers
  const logQuestCompleted = useCallback(async () => {
    if (!user?.id || !isTester || !isActive) return;

    try {
      const { data: existing } = await supabase
        .from("tester_activity_summary")
        .select("quests_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("tester_activity_summary")
          .update({
            quests_completed: existing.quests_completed + 1,
            last_activity_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Failed to log quest completion:", error);
    }
  }, [user?.id, isTester, isActive]);

  // Log game played for testers
  const logGamePlayed = useCallback(async () => {
    if (!user?.id || !isTester || !isActive) return;

    try {
      const { data: existing } = await supabase
        .from("tester_activity_summary")
        .select("games_played")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("tester_activity_summary")
          .update({
            games_played: existing.games_played + 1,
            last_activity_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Failed to log game played:", error);
    }
  }, [user?.id, isTester, isActive]);

  useEffect(() => {
    void logScreenVisit();

    // Log time spent when unmounting
    return () => {
      void logTimeSpent();
    };
  }, [logScreenVisit, logTimeSpent]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        void logTimeSpent();
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [logTimeSpent]);

  return {
    logQuestCompleted,
    logGamePlayed,
  };
};
