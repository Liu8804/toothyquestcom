import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp_reward: number;
  challenge_type: string;
  target_count: number;
}

interface ChallengeProgress {
  id: string;
  challenge_id: string;
  current_count: number;
  completed: boolean;
  completed_at: string | null;
  challenge_date: string;
}

interface ChallengeWithProgress extends DailyChallenge {
  progress: ChallengeProgress | null;
}

export const useDailyChallenges = (childId?: string) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchChallenges = useCallback(async () => {
    const { data, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("is_active", true);

    if (!error && data) {
      setChallenges(data);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!childId) return;

    const { data, error } = await supabase
      .from("daily_challenge_progress")
      .select("*")
      .eq("child_id", childId)
      .eq("challenge_date", today);

    if (!error && data) {
      setProgress(data);
    }
  }, [childId, today]);

  const incrementProgress = useCallback(async (
    challengeType: string
  ): Promise<{ completed: boolean; xpEarned: number; challengeTitle: string } | null> => {
    if (!childId || !user) return null;

    // Find challenges of this type
    const matchingChallenges = challenges.filter(c => c.challenge_type === challengeType);
    if (matchingChallenges.length === 0) return null;

    let completedChallenge: { completed: boolean; xpEarned: number; challengeTitle: string } | null = null;

    for (const challenge of matchingChallenges) {
      // Check if progress exists for today
      const existingProgress = progress.find(
        p => p.challenge_id === challenge.id
      );

      if (existingProgress) {
        // Already completed, skip
        if (existingProgress.completed) continue;

        // Update progress
        const newCount = existingProgress.current_count + 1;
        const isCompleted = newCount >= challenge.target_count;

        const { error } = await supabase
          .from("daily_challenge_progress")
          .update({
            current_count: newCount,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq("id", existingProgress.id);

        if (!error && isCompleted) {
          completedChallenge = {
            completed: true,
            xpEarned: challenge.xp_reward,
            challengeTitle: challenge.title,
          };
        }
      } else {
        // Create new progress entry
        const isCompleted = 1 >= challenge.target_count;

        const { error } = await supabase
          .from("daily_challenge_progress")
          .insert({
            child_id: childId,
            challenge_id: challenge.id,
            challenge_date: today,
            current_count: 1,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          });

        if (!error && isCompleted) {
          completedChallenge = {
            completed: true,
            xpEarned: challenge.xp_reward,
            challengeTitle: challenge.title,
          };
        }
      }
    }

    // Refresh progress
    await fetchProgress();

    return completedChallenge;
  }, [childId, user, challenges, progress, today, fetchProgress]);

  const getChallengesWithProgress = useCallback((): ChallengeWithProgress[] => {
    return challenges.map(challenge => ({
      ...challenge,
      progress: progress.find(p => p.challenge_id === challenge.id) || null,
    }));
  }, [challenges, progress]);

  const getCompletedCount = useCallback(() => {
    return progress.filter(p => p.completed).length;
  }, [progress]);

  const getTotalXpEarned = useCallback(() => {
    return progress
      .filter(p => p.completed)
      .reduce((total, p) => {
        const challenge = challenges.find(c => c.id === p.challenge_id);
        return total + (challenge?.xp_reward || 0);
      }, 0);
  }, [progress, challenges]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchChallenges();
      await fetchProgress();
      setLoading(false);
    };
    loadData();
  }, [fetchChallenges, fetchProgress]);

  return {
    challenges,
    progress,
    loading,
    incrementProgress,
    getChallengesWithProgress,
    getCompletedCount,
    getTotalXpEarned,
    refreshProgress: fetchProgress,
  };
};
