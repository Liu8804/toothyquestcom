import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GameScore {
  id: string;
  child_id: string;
  game_id: string;
  score: number;
  stars_earned: number;
  played_at: string;
}

interface GameAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  game_id: string | null;
  requirement_type: string;
  requirement_value: number;
}

interface EarnedAchievement {
  id: string;
  achievement_id: string;
  child_id: string;
  earned_at: string;
  achievement?: GameAchievement;
}

interface LeaderboardEntry {
  child_name: string;
  avatar_emoji: string;
  score: number;
  stars: number;
}

export const useGameProgress = (childId?: string) => {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [achievements, setAchievements] = useState<GameAchievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    const { data } = await supabase
      .from("game_achievements")
      .select("*");
    if (data) setAchievements(data);
  }, []);

  const fetchScores = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("game_scores")
      .select("*")
      .eq("child_id", childId)
      .order("played_at", { ascending: false });
    if (data) setScores(data);
  }, [childId]);

  const fetchEarnedAchievements = useCallback(async () => {
    if (!childId) return;
    const { data } = await supabase
      .from("earned_achievements")
      .select("*, achievement:game_achievements(*)")
      .eq("child_id", childId);
    if (data) {
      const mapped = data.map(item => ({
        ...item,
        achievement: item.achievement as unknown as GameAchievement
      }));
      setEarnedAchievements(mapped);
    }
  }, [childId]);

  const fetchLeaderboard = useCallback(async (gameId: string) => {
    // Get top scores with child info
    const { data } = await supabase
      .from("game_scores")
      .select(`
        score,
        stars_earned,
        child:children(name, avatar_emoji)
      `)
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(10);

    if (data) {
      const entries: LeaderboardEntry[] = data.map((item: any) => ({
        child_name: item.child?.name || "Anonymous",
        avatar_emoji: item.child?.avatar_emoji || "🦷",
        score: item.score,
        stars: item.stars_earned,
      }));
      setLeaderboard(prev => ({ ...prev, [gameId]: entries }));
    }
  }, []);

  const saveScore = useCallback(async (
    gameId: string,
    score: number,
    starsEarned: number
  ): Promise<GameAchievement[]> => {
    if (!childId) return [];

    // Save the score
    await supabase
      .from("game_scores")
      .insert({
        child_id: childId,
        game_id: gameId,
        score,
        stars_earned: starsEarned,
      });

    // Check for new achievements
    const newAchievements: GameAchievement[] = [];
    
    // Get updated stats
    const { data: allScores } = await supabase
      .from("game_scores")
      .select("game_id, score, stars_earned")
      .eq("child_id", childId);

    if (!allScores) return [];

    const totalGamesPlayed = allScores.length;
    const totalStars = allScores.reduce((sum, s) => sum + s.stars_earned, 0);
    const uniqueGames = new Set(allScores.map(s => s.game_id)).size;
    const highScoreByGame: Record<string, number> = {};
    allScores.forEach(s => {
      if (!highScoreByGame[s.game_id] || s.score > highScoreByGame[s.game_id]) {
        highScoreByGame[s.game_id] = s.score;
      }
    });

    // Get already earned achievement IDs
    const { data: earned } = await supabase
      .from("earned_achievements")
      .select("achievement_id")
      .eq("child_id", childId);
    const earnedIds = new Set(earned?.map(e => e.achievement_id) || []);

    // Check each achievement
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let earned = false;

      switch (achievement.requirement_type) {
        case "games_played":
          earned = totalGamesPlayed >= achievement.requirement_value;
          break;
        case "total_stars":
          earned = totalStars >= achievement.requirement_value;
          break;
        case "all_games":
          earned = uniqueGames >= achievement.requirement_value;
          break;
        case "high_score":
          if (achievement.game_id) {
            const gameScore = highScoreByGame[achievement.game_id] || 0;
            earned = gameScore >= achievement.requirement_value;
          }
          break;
      }

      if (earned) {
        await supabase
          .from("earned_achievements")
          .insert({
            child_id: childId,
            achievement_id: achievement.id,
          });
        newAchievements.push(achievement);
      }
    }

    // Refresh data
    await Promise.all([fetchScores(), fetchEarnedAchievements()]);

    return newAchievements;
  }, [childId, achievements, fetchScores, fetchEarnedAchievements]);

  const getTotalStars = useCallback(() => {
    return scores.reduce((sum, s) => sum + s.stars_earned, 0);
  }, [scores]);

  const getHighScore = useCallback((gameId: string) => {
    const gameScores = scores.filter(s => s.game_id === gameId);
    if (gameScores.length === 0) return 0;
    return Math.max(...gameScores.map(s => s.score));
  }, [scores]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAchievements(), fetchScores(), fetchEarnedAchievements()])
      .finally(() => setLoading(false));
  }, [fetchAchievements, fetchScores, fetchEarnedAchievements]);

  return {
    scores,
    achievements,
    earnedAchievements,
    leaderboard,
    loading,
    saveScore,
    fetchLeaderboard,
    getTotalStars,
    getHighScore,
  };
};
