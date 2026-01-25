import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useStreak } from "./useStreak";

interface DailyTask {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  challengeType: string;
  targetCount: number;
}

interface DailyTaskState {
  task: DailyTask | null;
  isCompleted: boolean;
  currentProgress: number;
  loading: boolean;
}

// Use ISO date for timezone-safe comparisons
const getISODateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Local storage for offline support
const DAILY_TASK_CACHE_KEY = "toothyquest_daily_task";

interface CachedDailyTask {
  date: string;
  task: DailyTask | null;
  isCompleted: boolean;
  currentProgress: number;
  pendingSync: boolean;
  childId?: string;
}

const getCachedTask = (childId?: string): CachedDailyTask | null => {
  try {
    const cached = localStorage.getItem(`${DAILY_TASK_CACHE_KEY}_${childId || "default"}`);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedDailyTask;
    // Only return if it's for today
    return data.date === getISODateString() ? data : null;
  } catch {
    return null;
  }
};

const setCachedTask = (data: CachedDailyTask, childId?: string): void => {
  try {
    localStorage.setItem(`${DAILY_TASK_CACHE_KEY}_${childId || "default"}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache daily task:", e);
  }
};

export const useDailyTask = (childId?: string) => {
  const { user } = useAuth();
  const { incrementStreak, hasCompletedToday } = useStreak();
  
  const [state, setState] = useState<DailyTaskState>({
    task: null,
    isCompleted: false,
    currentProgress: 0,
    loading: true,
  });

  const today = getISODateString();

  // Fetch today's active challenge (single task per day)
  const fetchDailyTask = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Get active challenges - prioritize brushing type
      const { data: challenges, error: challengeError } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (challengeError) {
        console.error("Error fetching challenges:", challengeError);
        // Fallback to cache
        const cached = getCachedTask(childId);
        if (cached) {
          setState({
            task: cached.task,
            isCompleted: cached.isCompleted,
            currentProgress: cached.currentProgress,
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      // Select today's challenge (rotate based on day of year)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const todaysChallenge = challenges && challenges.length > 0
        ? challenges[dayOfYear % challenges.length]
        : null;

      if (!todaysChallenge) {
        setState({ task: null, isCompleted: false, currentProgress: 0, loading: false });
        return;
      }

      const task: DailyTask = {
        id: todaysChallenge.id,
        title: todaysChallenge.title,
        description: todaysChallenge.description,
        emoji: todaysChallenge.emoji,
        xpReward: todaysChallenge.xp_reward,
        challengeType: todaysChallenge.challenge_type,
        targetCount: todaysChallenge.target_count,
      };

      // Check if already completed today
      if (childId) {
        const { data: progress } = await supabase
          .from("daily_challenge_progress")
          .select("*")
          .eq("child_id", childId)
          .eq("challenge_id", todaysChallenge.id)
          .eq("challenge_date", today)
          .maybeSingle();

        const isCompleted = progress?.completed ?? false;
        const currentProgress = progress?.current_count ?? 0;

        setState({
          task,
          isCompleted,
          currentProgress,
          loading: false,
        });

        // Cache for offline
        setCachedTask({
          date: today,
          task,
          isCompleted,
          currentProgress,
          pendingSync: false,
          childId,
        }, childId);
      } else {
        setState({ task, isCompleted: false, currentProgress: 0, loading: false });
      }
    } catch (err) {
      console.error("Daily task fetch error:", err);
      const cached = getCachedTask(childId);
      if (cached) {
        setState({
          task: cached.task,
          isCompleted: cached.isCompleted,
          currentProgress: cached.currentProgress,
          loading: false,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [user, childId, today]);

  // Complete the daily task
  const completeTask = useCallback(async (): Promise<{
    success: boolean;
    xpEarned: number;
    streakUpdated: boolean;
    newStreak: number;
  }> => {
    if (!user || !childId || !state.task || state.isCompleted) {
      return { success: false, xpEarned: 0, streakUpdated: false, newStreak: 0 };
    }

    const newProgress = state.currentProgress + 1;
    const isNowCompleted = newProgress >= state.task.targetCount;

    try {
      // Upsert progress
      const { error } = await supabase
        .from("daily_challenge_progress")
        .upsert({
          child_id: childId,
          challenge_id: state.task.id,
          challenge_date: today,
          current_count: newProgress,
          completed: isNowCompleted,
          completed_at: isNowCompleted ? new Date().toISOString() : null,
        }, {
          onConflict: "child_id,challenge_id,challenge_date",
        });

      if (error) {
        console.error("Error completing task:", error);
        // Cache for later sync
        setCachedTask({
          date: today,
          task: state.task,
          isCompleted: isNowCompleted,
          currentProgress: newProgress,
          pendingSync: true,
          childId,
        }, childId);
      } else {
        setCachedTask({
          date: today,
          task: state.task,
          isCompleted: isNowCompleted,
          currentProgress: newProgress,
          pendingSync: false,
          childId,
        }, childId);
      }

      // Update state
      setState(prev => ({
        ...prev,
        isCompleted: isNowCompleted,
        currentProgress: newProgress,
      }));

      // If completed, increment streak
      let streakResult = { newStreak: 0, isNewDay: false, streakMaintained: false };
      if (isNowCompleted) {
        streakResult = await incrementStreak();
      }

      return {
        success: true,
        xpEarned: isNowCompleted ? state.task.xpReward : 0,
        streakUpdated: streakResult.isNewDay,
        newStreak: streakResult.newStreak,
      };
    } catch (err) {
      console.error("Task completion error:", err);
      // Offline handling
      setCachedTask({
        date: today,
        task: state.task,
        isCompleted: isNowCompleted,
        currentProgress: newProgress,
        pendingSync: true,
        childId,
      }, childId);

      setState(prev => ({
        ...prev,
        isCompleted: isNowCompleted,
        currentProgress: newProgress,
      }));

      return {
        success: true,
        xpEarned: isNowCompleted ? state.task.xpReward : 0,
        streakUpdated: false,
        newStreak: 0,
      };
    }
  }, [user, childId, state.task, state.isCompleted, state.currentProgress, today, incrementStreak]);

  // Sync pending offline tasks
  const syncPendingTask = useCallback(async () => {
    if (!user || !childId) return;

    const cached = getCachedTask(childId);
    if (!cached?.pendingSync || !cached.task) return;

    try {
      const { error } = await supabase
        .from("daily_challenge_progress")
        .upsert({
          child_id: childId,
          challenge_id: cached.task.id,
          challenge_date: cached.date,
          current_count: cached.currentProgress,
          completed: cached.isCompleted,
          completed_at: cached.isCompleted ? new Date().toISOString() : null,
        }, {
          onConflict: "child_id,challenge_id,challenge_date",
        });

      if (!error) {
        setCachedTask({
          ...cached,
          pendingSync: false,
        }, childId);
        console.log("Pending daily task synced");
      }
    } catch (err) {
      console.error("Failed to sync pending task:", err);
    }
  }, [user, childId]);

  // Load on mount
  useEffect(() => {
    fetchDailyTask();
    syncPendingTask();
  }, [fetchDailyTask, syncPendingTask]);

  // Sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      syncPendingTask();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingTask]);

  return {
    ...state,
    completeTask,
    hasCompletedToday: state.isCompleted || hasCompletedToday(),
    refetch: fetchDailyTask,
  };
};

export default useDailyTask;
