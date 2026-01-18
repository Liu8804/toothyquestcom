import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LeaderboardEntry {
  child_id: string;
  display_name: string;
  avatar_emoji: string | null;
  total_xp: number;
  quests_completed: number;
  badges_earned: number;
  rank: number;
}

interface LeaderboardProfile {
  id: string;
  child_id: string;
  display_name: string;
  is_public: boolean;
}

export const useLeaderboard = (selectedChildId?: string) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myProfile, setMyProfile] = useState<LeaderboardProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch public leaderboard
  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_public_leaderboard", {
      limit_count: 50,
    });

    if (!error && data) {
      const rankedData = (data as LeaderboardEntry[]).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
      setLeaderboard(rankedData);
    }
  }, []);

  // Fetch my child's leaderboard profile
  const fetchMyProfile = useCallback(async () => {
    if (!selectedChildId) {
      setMyProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("leaderboard_profiles")
      .select("*")
      .eq("child_id", selectedChildId)
      .maybeSingle();

    if (!error) {
      setMyProfile(data as LeaderboardProfile | null);
    }
  }, [selectedChildId]);

  // Join leaderboard (opt-in)
  const joinLeaderboard = useCallback(
    async (displayName: string) => {
      if (!selectedChildId || !user) return { success: false, error: "No child selected" };

      const { data, error } = await supabase
        .from("leaderboard_profiles")
        .insert({
          child_id: selectedChildId,
          display_name: displayName,
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setMyProfile(data as LeaderboardProfile);
      await fetchLeaderboard();
      return { success: true, error: null };
    },
    [selectedChildId, user, fetchLeaderboard]
  );

  // Update visibility
  const toggleVisibility = useCallback(async () => {
    if (!myProfile) return;

    const { error } = await supabase
      .from("leaderboard_profiles")
      .update({ is_public: !myProfile.is_public })
      .eq("id", myProfile.id);

    if (!error) {
      setMyProfile((prev) => (prev ? { ...prev, is_public: !prev.is_public } : null));
      await fetchLeaderboard();
    }
  }, [myProfile, fetchLeaderboard]);

  // Leave leaderboard
  const leaveLeaderboard = useCallback(async () => {
    if (!myProfile) return;

    const { error } = await supabase
      .from("leaderboard_profiles")
      .delete()
      .eq("id", myProfile.id);

    if (!error) {
      setMyProfile(null);
      await fetchLeaderboard();
    }
  }, [myProfile, fetchLeaderboard]);

  // Find my rank
  const getMyRank = useCallback(() => {
    if (!selectedChildId) return null;
    const entry = leaderboard.find((e) => e.child_id === selectedChildId);
    return entry?.rank || null;
  }, [leaderboard, selectedChildId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLeaderboard(), fetchMyProfile()]);
      setLoading(false);
    };
    loadData();
  }, [fetchLeaderboard, fetchMyProfile]);

  return {
    leaderboard,
    myProfile,
    loading,
    joinLeaderboard,
    toggleVisibility,
    leaveLeaderboard,
    getMyRank,
    refreshLeaderboard: fetchLeaderboard,
  };
};
