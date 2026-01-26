import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface StreakRecoveryState {
  canRecover: boolean;
  lastRecoveryDate: string | null;
  recoveryCountThisWeek: number;
  loading: boolean;
}

// Local storage for offline support
const RECOVERY_CACHE_KEY = "toothyquest_streak_recovery";

const getISODateString = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
  const monday = new Date(now.setDate(diff));
  return getISODateString(monday);
};

const getYesterdayISODate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getISODateString(yesterday);
};

interface CachedRecovery {
  userId: string;
  lastRecoveryDate: string | null;
  pendingSync: boolean;
  restoredStreak: number;
}

const getCachedRecovery = (userId: string): CachedRecovery | null => {
  try {
    const cached = localStorage.getItem(`${RECOVERY_CACHE_KEY}_${userId}`);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedRecovery;
    return data.userId === userId ? data : null;
  } catch {
    return null;
  }
};

const setCachedRecovery = (data: CachedRecovery): void => {
  try {
    localStorage.setItem(`${RECOVERY_CACHE_KEY}_${data.userId}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache recovery data:", e);
  }
};

export const useStreakRecovery = () => {
  const { user } = useAuth();
  
  const [state, setState] = useState<StreakRecoveryState>({
    canRecover: false,
    lastRecoveryDate: null,
    recoveryCountThisWeek: 0,
    loading: true,
  });

  // Check if recovery is available (max 1 per week)
  const checkRecoveryEligibility = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const weekStart = getWeekStart();

      // Get recoveries this week
      const { data: recoveries, error } = await (supabase
        .from("streak_recoveries" as any)
        .select("*")
        .eq("user_id", user.id)
        .gte("recovered_at", weekStart)
        .order("recovered_at", { ascending: false }) as any);

      if (error) {
        console.error("Error checking recovery eligibility:", error);
        // Use cached data
        const cached = getCachedRecovery(user.id);
        if (cached) {
          setState({
            canRecover: !cached.lastRecoveryDate || 
              new Date(cached.lastRecoveryDate) < new Date(weekStart),
            lastRecoveryDate: cached.lastRecoveryDate,
            recoveryCountThisWeek: cached.lastRecoveryDate && 
              new Date(cached.lastRecoveryDate) >= new Date(weekStart) ? 1 : 0,
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      const recoveryCount = recoveries?.length ?? 0;
      const lastRecovery = recoveries?.[0];

      setState({
        canRecover: recoveryCount < 1, // Max 1 recovery per week
        lastRecoveryDate: lastRecovery?.recovered_at ?? null,
        recoveryCountThisWeek: recoveryCount,
        loading: false,
      });
    } catch (err) {
      console.error("Recovery eligibility check error:", err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Recover streak with parent confirmation
  const recoverStreak = useCallback(
    async (
      currentStreak: number,
      previousStreak: number,
      parentConfirmed: boolean
    ): Promise<{ success: boolean; newStreak: number; error?: string }> => {
      if (!user) {
        return { success: false, newStreak: 0, error: "Not authenticated" };
      }

      if (!state.canRecover) {
        return { success: false, newStreak: 0, error: "Recovery not available this week" };
      }

      if (!parentConfirmed) {
        return { success: false, newStreak: 0, error: "Parent confirmation required" };
      }

      const yesterday = getYesterdayISODate();
      const today = getISODateString();
      
      // Calculate restored streak (previous streak + 1 for today's task)
      // But we don't add +1 here - that's done when task completes
      const restoredStreak = previousStreak;

      try {
        // Record the recovery
        const { error: insertError } = await (supabase
          .from("streak_recoveries" as any)
          .insert({
            user_id: user.id,
            recovered_date: yesterday,
            previous_streak: currentStreak,
            restored_streak: restoredStreak,
            parent_confirmed: parentConfirmed,
          }) as any);

        if (insertError) {
          console.error("Error recording recovery:", insertError);
          // Cache for later sync
          setCachedRecovery({
            userId: user.id,
            lastRecoveryDate: new Date().toISOString(),
            pendingSync: true,
            restoredStreak,
          });
        }

        // Update user_streaks to restore the streak
        const { error: updateError } = await supabase
          .from("user_streaks")
          .upsert({
            user_id: user.id,
            current_streak: restoredStreak,
            last_activity_date: yesterday, // Set to yesterday so today's task can continue it
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });

        if (updateError) {
          console.error("Error updating streak:", updateError);
          return { success: false, newStreak: 0, error: "Failed to update streak" };
        }

        // Update local state
        setState(prev => ({
          ...prev,
          canRecover: false,
          lastRecoveryDate: new Date().toISOString(),
          recoveryCountThisWeek: prev.recoveryCountThisWeek + 1,
        }));

        console.log(`Streak recovered: ${currentStreak} → ${restoredStreak}`);
        return { success: true, newStreak: restoredStreak };
      } catch (err) {
        console.error("Streak recovery error:", err);
        return { success: false, newStreak: 0, error: "Network error" };
      }
    },
    [user, state.canRecover]
  );

  // Sync pending offline recoveries
  const syncPendingRecovery = useCallback(async () => {
    if (!user) return;

    const cached = getCachedRecovery(user.id);
    if (!cached?.pendingSync) return;

    try {
      const { error } = await (supabase
        .from("streak_recoveries" as any)
        .insert({
          user_id: user.id,
          recovered_date: cached.lastRecoveryDate?.split("T")[0],
          previous_streak: 0,
          restored_streak: cached.restoredStreak,
          parent_confirmed: true,
        }) as any);

      if (!error) {
        setCachedRecovery({
          ...cached,
          pendingSync: false,
        });
        console.log("Pending recovery synced");
      }
    } catch (err) {
      console.error("Failed to sync pending recovery:", err);
    }
  }, [user]);

  // Check if streak was broken (missed yesterday)
  const checkStreakBroken = useCallback(
    (lastActivityDate: string | null): boolean => {
      if (!lastActivityDate) return false;
      
      const today = getISODateString();
      const yesterday = getYesterdayISODate();
      
      // If last activity was before yesterday, streak is broken
      return lastActivityDate !== today && lastActivityDate !== yesterday;
    },
    []
  );

  // Load on mount
  useEffect(() => {
    checkRecoveryEligibility();
    syncPendingRecovery();
  }, [checkRecoveryEligibility, syncPendingRecovery]);

  // Sync when online
  useEffect(() => {
    const handleOnline = () => {
      syncPendingRecovery();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingRecovery]);

  return {
    ...state,
    recoverStreak,
    checkStreakBroken,
    refetch: checkRecoveryEligibility,
  };
};

export default useStreakRecovery;
