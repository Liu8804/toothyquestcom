import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Child {
  id: string;
  name: string;
  avatar_emoji: string;
  birth_year: number | null;
}

interface QuestProgress {
  quest_id: string;
  completed_at: string;
  xp_earned: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xp_required: number;
  quest_count_required: number;
}

interface EarnedBadge {
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export const useQuestProgress = (childId?: string) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch children for parent
  const fetchChildren = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", user.id);

    if (!error && data) {
      setChildren(data);
      if (data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    }
  }, [user, selectedChild]);

  // Fetch quest progress for selected child
  const fetchProgress = useCallback(async () => {
    const currentChildId = childId || selectedChild?.id;
    if (!currentChildId) return;

    const { data, error } = await supabase
      .from("quest_progress")
      .select("quest_id, completed_at, xp_earned")
      .eq("child_id", currentChildId);

    if (!error && data) {
      setQuestProgress(data);
      setTotalXp(data.reduce((sum, q) => sum + q.xp_earned, 0));
    }
  }, [childId, selectedChild]);

  // Fetch earned badges
  const fetchEarnedBadges = useCallback(async () => {
    const currentChildId = childId || selectedChild?.id;
    if (!currentChildId) return;

    const { data, error } = await supabase
      .from("earned_badges")
      .select(`
        badge_id,
        earned_at,
        badge:badges(*)
      `)
      .eq("child_id", currentChildId);

    if (!error && data) {
      setEarnedBadges(data as unknown as EarnedBadge[]);
    }
  }, [childId, selectedChild]);

  // Fetch all badges
  const fetchAllBadges = useCallback(async () => {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("quest_count_required", { ascending: true });

    if (!error && data) {
      setAllBadges(data);
    }
  }, []);

  // Complete a quest
  const completeQuest = useCallback(async (questId: string, xpEarned = 10) => {
    const currentChildId = childId || selectedChild?.id;
    if (!currentChildId) return { success: false, newBadges: [] };

    // Insert quest progress
    const { error } = await supabase
      .from("quest_progress")
      .upsert({
        child_id: currentChildId,
        quest_id: questId,
        xp_earned: xpEarned,
      }, { onConflict: "child_id,quest_id" });

    if (error) {
      console.error("Error completing quest:", error);
      return { success: false, newBadges: [] };
    }

    // Refresh progress
    await fetchProgress();

    // Check for new badges
    const newQuestCount = questProgress.length + 1;
    const newTotalXp = totalXp + xpEarned;
    const newBadges: Badge[] = [];

    for (const badge of allBadges) {
      const alreadyEarned = earnedBadges.some(eb => eb.badge_id === badge.id);
      if (alreadyEarned) continue;

      const meetsXpRequirement = badge.xp_required > 0 && newTotalXp >= badge.xp_required;
      const meetsQuestRequirement = badge.quest_count_required > 0 && newQuestCount >= badge.quest_count_required;

      if (meetsXpRequirement || meetsQuestRequirement) {
        const { error: badgeError } = await supabase
          .from("earned_badges")
          .insert({
            child_id: currentChildId,
            badge_id: badge.id,
          });

        if (!badgeError) {
          newBadges.push(badge);
        }
      }
    }

    await fetchEarnedBadges();

    return { success: true, newBadges };
  }, [childId, selectedChild, questProgress, totalXp, allBadges, earnedBadges, fetchProgress, fetchEarnedBadges]);

  // Add a child
  const addChild = useCallback(async (name: string, avatarEmoji: string, birthYear?: number) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("children")
      .insert({
        parent_id: user.id,
        name,
        avatar_emoji: avatarEmoji,
        birth_year: birthYear,
      })
      .select()
      .single();

    if (!error && data) {
      await fetchChildren();
      return data;
    }
    return null;
  }, [user, fetchChildren]);

  // Check if quest is completed
  const isQuestCompleted = useCallback((questId: string) => {
    return questProgress.some(q => q.quest_id === questId);
  }, [questProgress]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChildren(), fetchAllBadges()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedChild || childId) {
      fetchProgress();
      fetchEarnedBadges();
    }
  }, [selectedChild, childId, fetchProgress, fetchEarnedBadges]);

  return {
    children,
    selectedChild,
    setSelectedChild,
    questProgress,
    earnedBadges,
    allBadges,
    totalXp,
    loading,
    completeQuest,
    addChild,
    isQuestCompleted,
    refreshData: () => Promise.all([fetchProgress(), fetchEarnedBadges()]),
  };
};
