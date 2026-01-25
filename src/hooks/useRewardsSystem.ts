import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useStreak } from "./useStreak";
import {
  LEVELS,
  ACHIEVEMENT_BADGES,
  BONUS_REWARDS,
  TOOTH_PETS,
  getLevelForPoints,
  getNextLevel,
  getProgressToNextLevel,
  getQuestPoints,
  getQuestCategory,
  getRandomChestItem,
  type Level,
  type AchievementBadge,
  type ToothPet,
} from "@/data/rewardsConfig";

interface RewardsState {
  totalPoints: number;
  currentLevel: Level;
  nextLevel: Level | null;
  progressToNextLevel: number;
  unlockedBadges: string[];
  unlockedPets: string[];
  questsCompleted: number;
  dailyBonusClaimed: boolean;
}

interface QuestCompletionResult {
  success: boolean;
  pointsEarned: number;
  bonusPoints: number;
  newTotalPoints: number;
  leveledUp: boolean;
  newLevel?: Level;
  newBadges: AchievementBadge[];
  newPets: ToothPet[];
  chestItem?: ReturnType<typeof getRandomChestItem>;
  streakBonus: number;
}

// Use ISO date for timezone-safe comparisons
const getISODateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useRewardsSystem = (childId?: string) => {
  const { user } = useAuth();
  // Use the consolidated streak hook - single source of truth
  const { currentStreak, longestStreak, hasCompletedToday } = useStreak();
  
  const [state, setState] = useState<RewardsState>({
    totalPoints: 0,
    currentLevel: LEVELS[0],
    nextLevel: LEVELS[1],
    progressToNextLevel: 0,
    unlockedBadges: [],
    unlockedPets: ['toothy'], // Everyone starts with Toothy
    questsCompleted: 0,
    dailyBonusClaimed: false,
  });
  const [loading, setLoading] = useState(true);
  const [questCategories, setQuestCategories] = useState<Record<string, number>>({});

  // Load rewards data from Supabase
  const loadRewardsData = useCallback(async () => {
    if (!childId) return;
    
    setLoading(true);
    
    try {
      // Fetch quest progress from Supabase
      const { data: progressData } = await supabase
        .from("quest_progress")
        .select("quest_id, xp_earned")
        .eq("child_id", childId);

      const totalPoints = progressData?.reduce((sum, q) => sum + q.xp_earned, 0) || 0;
      const questsCompleted = progressData?.length || 0;

      // Calculate category completions for badges
      const categories: Record<string, number> = {};
      progressData?.forEach(q => {
        const cat = getQuestCategory(q.quest_id);
        if (cat) {
          categories[cat] = (categories[cat] || 0) + 1;
        }
      });
      setQuestCategories(categories);

      // Load cached badges/pets from localStorage (for offline)
      const localData = JSON.parse(localStorage.getItem(`rewards_${childId}`) || '{}');
      const today = getISODateString();

      // Check daily bonus - only claimable AFTER task completion
      const dailyBonusClaimed = localData.lastDailyBonus === today;

      // Calculate level
      const currentLevel = getLevelForPoints(totalPoints);
      const nextLevel = getNextLevel(totalPoints);
      const progressToNextLevel = getProgressToNextLevel(totalPoints);

      // Check for unlocked pets based on level
      const unlockedPets = ['toothy']; // Base pet
      if (questsCompleted >= 5) unlockedPets.push('brushy');
      if (questsCompleted >= 10) unlockedPets.push('flossy');
      if (currentLevel.level >= 2) unlockedPets.push('sparkle');
      if (currentLevel.level >= 3) unlockedPets.push('minty');
      if (currentLevel.level >= 4) unlockedPets.push('goldie');

      // Check for unlocked badges using streak from consolidated hook
      const unlockedBadges: string[] = [];
      ACHIEVEMENT_BADGES.forEach(badge => {
        let unlocked = false;
        switch (badge.requirement.type) {
          case 'quest_category':
            unlocked = (categories[badge.requirement.category || ''] || 0) >= badge.requirement.count;
            break;
          case 'quest_count':
            unlocked = questsCompleted >= badge.requirement.count;
            break;
          case 'points':
            unlocked = totalPoints >= badge.requirement.count;
            break;
          case 'streak':
            // Use streak from consolidated hook
            unlocked = currentStreak >= badge.requirement.count;
            break;
        }
        if (unlocked) unlockedBadges.push(badge.id);
      });

      setState({
        totalPoints,
        currentLevel,
        nextLevel,
        progressToNextLevel,
        unlockedBadges,
        unlockedPets,
        questsCompleted,
        dailyBonusClaimed,
      });

      // Save updated data to localStorage for offline
      localStorage.setItem(`rewards_${childId}`, JSON.stringify({
        ...localData,
        unlockedBadges,
        unlockedPets,
      }));

    } catch (error) {
      console.error("Error loading rewards data:", error);
    }
    
    setLoading(false);
  }, [childId, currentStreak]);

  useEffect(() => {
    loadRewardsData();
  }, [loadRewardsData]);

  // Claim daily bonus - only allowed AFTER task completion
  const claimDailyBonus = useCallback(async (): Promise<number> => {
    if (!childId || state.dailyBonusClaimed) return 0;
    
    // Check if daily task was completed
    if (!hasCompletedToday()) {
      console.log("Cannot claim daily bonus - task not completed");
      return 0;
    }

    const today = getISODateString();
    const localData = JSON.parse(localStorage.getItem(`rewards_${childId}`) || '{}');
    
    localStorage.setItem(`rewards_${childId}`, JSON.stringify({
      ...localData,
      lastDailyBonus: today,
    }));

    setState(prev => ({
      ...prev,
      dailyBonusClaimed: true,
      totalPoints: prev.totalPoints + BONUS_REWARDS.dailyOpen,
    }));

    return BONUS_REWARDS.dailyOpen;
  }, [childId, state.dailyBonusClaimed, hasCompletedToday]);

  // Complete a quest with full rewards calculation
  const completeQuestWithRewards = useCallback(async (
    questId: string,
    correctAnswers: number = 0
  ): Promise<QuestCompletionResult> => {
    if (!childId) {
      return {
        success: false,
        pointsEarned: 0,
        bonusPoints: 0,
        newTotalPoints: state.totalPoints,
        leveledUp: false,
        newBadges: [],
        newPets: [],
        streakBonus: 0,
      };
    }

    const questConfig = getQuestPoints(questId);
    const basePoints = questConfig.basePoints;
    const bonusPoints = correctAnswers * BONUS_REWARDS.correctAnswer;
    
    // Streak bonus - use consolidated streak
    let streakBonus = 0;
    if (currentStreak >= 3 && currentStreak % 3 === 0) {
      streakBonus = BONUS_REWARDS.streakBonus;
    }

    const totalEarned = basePoints + bonusPoints + streakBonus;
    const newTotalPoints = state.totalPoints + totalEarned;

    // Check for level up
    const oldLevel = state.currentLevel;
    const newLevel = getLevelForPoints(newTotalPoints);
    const leveledUp = newLevel.level > oldLevel.level;

    // Check for new badges
    const newQuestsCompleted = state.questsCompleted + 1;
    const questCat = getQuestCategory(questId);
    const newCategories = { ...questCategories };
    if (questCat) {
      newCategories[questCat] = (newCategories[questCat] || 0) + 1;
    }

    const newBadges: AchievementBadge[] = [];
    ACHIEVEMENT_BADGES.forEach(badge => {
      if (state.unlockedBadges.includes(badge.id)) return;
      
      let unlocked = false;
      switch (badge.requirement.type) {
        case 'quest_category':
          unlocked = (newCategories[badge.requirement.category || ''] || 0) >= badge.requirement.count;
          break;
        case 'quest_count':
          unlocked = newQuestsCompleted >= badge.requirement.count;
          break;
        case 'points':
          unlocked = newTotalPoints >= badge.requirement.count;
          break;
        case 'streak':
          unlocked = currentStreak >= badge.requirement.count;
          break;
      }
      if (unlocked) newBadges.push(badge);
    });

    // Check for new pets
    const newPets: ToothPet[] = [];
    TOOTH_PETS.forEach(pet => {
      if (state.unlockedPets.includes(pet.id)) return;
      
      let unlocked = false;
      if (pet.id === 'brushy' && newQuestsCompleted >= 5) unlocked = true;
      if (pet.id === 'flossy' && newQuestsCompleted >= 10) unlocked = true;
      if (pet.id === 'sparkle' && newLevel.level >= 2) unlocked = true;
      if (pet.id === 'minty' && newLevel.level >= 3) unlocked = true;
      if (pet.id === 'goldie' && newLevel.level >= 4) unlocked = true;
      
      if (unlocked) newPets.push(pet);
    });

    // Mystery chest (random chance after quest completion)
    const chestItem = Math.random() < 0.3 ? getRandomChestItem() : undefined;

    // Save to Supabase
    const { error } = await supabase
      .from("quest_progress")
      .upsert({
        child_id: childId,
        quest_id: questId,
        xp_earned: totalEarned,
      }, { onConflict: "child_id,quest_id" });

    if (error) {
      console.error("Error saving quest progress:", error);
      return {
        success: false,
        pointsEarned: 0,
        bonusPoints: 0,
        newTotalPoints: state.totalPoints,
        leveledUp: false,
        newBadges: [],
        newPets: [],
        streakBonus: 0,
      };
    }

    // Update local storage
    const localData = JSON.parse(localStorage.getItem(`rewards_${childId}`) || '{}');
    localStorage.setItem(`rewards_${childId}`, JSON.stringify({
      ...localData,
      unlockedBadges: [...state.unlockedBadges, ...newBadges.map(b => b.id)],
      unlockedPets: [...state.unlockedPets, ...newPets.map(p => p.id)],
    }));

    // Update state
    setState(prev => ({
      ...prev,
      totalPoints: newTotalPoints,
      currentLevel: newLevel,
      nextLevel: getNextLevel(newTotalPoints),
      progressToNextLevel: getProgressToNextLevel(newTotalPoints),
      questsCompleted: newQuestsCompleted,
      unlockedBadges: [...prev.unlockedBadges, ...newBadges.map(b => b.id)],
      unlockedPets: [...prev.unlockedPets, ...newPets.map(p => p.id)],
    }));

    setQuestCategories(newCategories);

    return {
      success: true,
      pointsEarned: basePoints,
      bonusPoints,
      newTotalPoints,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      newBadges,
      newPets,
      chestItem,
      streakBonus,
    };
  }, [childId, state, questCategories, currentStreak]);

  // Get all available badges with unlock status
  const getAllBadges = useCallback(() => {
    return ACHIEVEMENT_BADGES.map(badge => ({
      ...badge,
      unlocked: state.unlockedBadges.includes(badge.id),
    }));
  }, [state.unlockedBadges]);

  // Get all pets with unlock status
  const getAllPets = useCallback(() => {
    return TOOTH_PETS.map(pet => ({
      ...pet,
      unlocked: state.unlockedPets.includes(pet.id),
    }));
  }, [state.unlockedPets]);

  return {
    ...state,
    // Expose streak from consolidated hook
    streak: currentStreak,
    longestStreak,
    loading,
    claimDailyBonus,
    completeQuestWithRewards,
    getAllBadges,
    getAllPets,
    refreshRewards: loadRewardsData,
    levels: LEVELS,
  };
};
