import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useStickerRewards } from "./useStickerRewards";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  loading: boolean;
}

// Use ISO date string (YYYY-MM-DD) for timezone-safe comparisons
const getISODateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getYesterdayISODate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getISODateString(yesterday);
};

// Local storage key for offline fallback
const STREAK_STORAGE_KEY = "toothyquest_streak_cache";

interface CachedStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  pendingSync: boolean;
  lastSyncAt: string;
}

const getCachedStreak = (userId: string): CachedStreak | null => {
  try {
    const cached = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as CachedStreak;
    return data.userId === userId ? data : null;
  } catch {
    return null;
  }
};

const setCachedStreak = (data: CachedStreak): void => {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache streak data:", e);
  }
};

export const useStreak = () => {
  const { user } = useAuth();
  const { awardStreakSticker, getStickerInfo } = useStickerRewards();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    loading: true,
  });

  // Fetch streak from Supabase (single source of truth)
  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreakData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching streak:", error);
        // Fallback to cached data if offline
        const cached = getCachedStreak(user.id);
        if (cached) {
          setStreakData({
            currentStreak: cached.currentStreak,
            longestStreak: cached.longestStreak,
            lastActivityDate: cached.lastActivityDate,
            loading: false,
          });
        } else {
          setStreakData(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      const streakInfo = {
        currentStreak: data?.current_streak ?? 0,
        longestStreak: data?.longest_streak ?? 0,
        lastActivityDate: data?.last_activity_date ?? null,
        loading: false,
      };

      setStreakData(streakInfo);

      // Cache for offline use
      setCachedStreak({
        userId: user.id,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        lastActivityDate: streakInfo.lastActivityDate,
        pendingSync: false,
        lastSyncAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Streak fetch error:", err);
      // Use cached data on network error
      const cached = getCachedStreak(user.id);
      if (cached) {
        setStreakData({
          currentStreak: cached.currentStreak,
          longestStreak: cached.longestStreak,
          lastActivityDate: cached.lastActivityDate,
          loading: false,
        });
      } else {
        setStreakData(prev => ({ ...prev, loading: false }));
      }
    }
  }, [user]);

  // Increment streak ONLY when a daily task is completed
  const incrementStreak = useCallback(async (): Promise<{
    newStreak: number;
    isNewDay: boolean;
    streakMaintained: boolean;
    newSticker: { emoji: string; name: string } | null;
  }> => {
    if (!user) {
      return { newStreak: 0, isNewDay: false, streakMaintained: false, newSticker: null };
    }

    const today = getISODateString();
    const yesterday = getYesterdayISODate();

    // Check if already completed today
    if (streakData.lastActivityDate === today) {
      return {
        newStreak: streakData.currentStreak,
        isNewDay: false,
        streakMaintained: true,
        newSticker: null,
      };
    }

    // Calculate new streak
    let newStreak: number;
    let streakMaintained: boolean;

    if (streakData.lastActivityDate === yesterday) {
      // Continuing streak
      newStreak = streakData.currentStreak + 1;
      streakMaintained = true;
    } else if (streakData.lastActivityDate === null) {
      // First ever activity
      newStreak = 1;
      streakMaintained = true;
    } else {
      // Streak broken - start fresh
      newStreak = 1;
      streakMaintained = false;
    }

    const newLongest = Math.max(newStreak, streakData.longestStreak);

    try {
      // Upsert to Supabase
      const { error } = await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) {
        console.error("Error updating streak:", error);
        // Cache locally for later sync
        setCachedStreak({
          userId: user.id,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
          pendingSync: true,
          lastSyncAt: new Date().toISOString(),
        });
      } else {
        // Update cache
        setCachedStreak({
          userId: user.id,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
          pendingSync: false,
          lastSyncAt: new Date().toISOString(),
        });
      }

      // Update local state
      setStreakData({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: today,
        loading: false,
      });

      // Award streak sticker if milestone reached
      const streakStickerId = awardStreakSticker(newStreak);
      const newSticker = streakStickerId ? getStickerInfo(streakStickerId) : null;

      return { newStreak, isNewDay: true, streakMaintained, newSticker };
    } catch (err) {
      console.error("Network error updating streak:", err);
      // Store locally for sync when online
      setCachedStreak({
        userId: user.id,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: today,
        pendingSync: true,
        lastSyncAt: new Date().toISOString(),
      });

      setStreakData({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: today,
        loading: false,
      });

      // Award streak sticker if milestone reached
      const streakStickerId = awardStreakSticker(newStreak);
      const newSticker = streakStickerId ? getStickerInfo(streakStickerId) : null;

      return { newStreak, isNewDay: true, streakMaintained, newSticker };
    }
  }, [user, streakData, awardStreakSticker, getStickerInfo]);

  // Sync pending offline changes when online
  const syncPendingStreak = useCallback(async () => {
    if (!user) return;

    const cached = getCachedStreak(user.id);
    if (!cached?.pendingSync) return;

    try {
      const { error } = await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: cached.currentStreak,
          longest_streak: cached.longestStreak,
          last_activity_date: cached.lastActivityDate,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (!error) {
        setCachedStreak({
          ...cached,
          pendingSync: false,
          lastSyncAt: new Date().toISOString(),
        });
        console.log("Pending streak synced successfully");
      }
    } catch (err) {
      console.error("Failed to sync pending streak:", err);
    }
  }, [user]);

  // Check if task was completed today
  const hasCompletedToday = useCallback((): boolean => {
    return streakData.lastActivityDate === getISODateString();
  }, [streakData.lastActivityDate]);

  // Get streak milestone info
  const getMilestone = useCallback(() => {
    const streak = streakData.currentStreak;
    if (streak >= 30) return { label: "Champion!", level: 4 };
    if (streak >= 14) return { label: "Superstar!", level: 3 };
    if (streak >= 7) return { label: "On Fire!", level: 2 };
    return { label: "Keep Going!", level: 1 };
  }, [streakData.currentStreak]);

  // Load streak on mount and sync pending
  useEffect(() => {
    fetchStreak();
    syncPendingStreak();
  }, [fetchStreak, syncPendingStreak]);

  // Listen for online status to sync
  useEffect(() => {
    const handleOnline = () => {
      syncPendingStreak();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingStreak]);

  return {
    ...streakData,
    incrementStreak,
    hasCompletedToday,
    getMilestone,
    refetch: fetchStreak,
  };
};

export default useStreak;
