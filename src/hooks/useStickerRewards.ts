import { useCallback } from "react";

// Sticker reward mappings
const QUEST_STICKER_MAP: Record<string, string> = {
  // Brushing quests
  "morning-brush": "morning-star",
  "evening-brush": "night-owl",
  "brush-timer": "brush-champ",
  "brush-2min": "brush-champ",
  // Flossing quests
  "floss-quest": "floss-boss",
  "floss-adventure": "clean-machine",
  // Achievement quests
  "first-quest": "super-star",
  "quest-master": "champion",
  "dental-hero": "hero",
};

const STREAK_STICKER_MAP: Record<number, string> = {
  3: "streak-3",
  7: "streak-7",
  30: "streak-30",
};

const BRUSHING_STICKERS = ["brush-champ", "sparkle-teeth", "morning-star", "night-owl"];
const COMPLETION_STICKERS = ["super-star", "champion", "hero"];

export function useStickerRewards() {
  // Get currently unlocked sticker IDs from localStorage
  const getUnlockedStickers = useCallback((): string[] => {
    try {
      const saved = localStorage.getItem("toothyquest_stickers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // Save unlocked stickers to localStorage
  const saveUnlockedStickers = useCallback((stickerIds: string[]) => {
    const unique = [...new Set(stickerIds)];
    localStorage.setItem("toothyquest_stickers", JSON.stringify(unique));
  }, []);

  // Unlock a specific sticker by ID
  const unlockSticker = useCallback((stickerId: string): boolean => {
    const current = getUnlockedStickers();
    if (current.includes(stickerId)) {
      return false; // Already unlocked
    }
    saveUnlockedStickers([...current, stickerId]);
    return true;
  }, [getUnlockedStickers, saveUnlockedStickers]);

  // Award sticker based on quest completion
  const awardQuestSticker = useCallback((questId: string): string | null => {
    // Check for specific quest mapping
    const mappedSticker = QUEST_STICKER_MAP[questId];
    if (mappedSticker) {
      const isNew = unlockSticker(mappedSticker);
      return isNew ? mappedSticker : null;
    }

    // For brushing-related quests, award a random brushing sticker
    if (questId.toLowerCase().includes("brush")) {
      const current = getUnlockedStickers();
      const available = BRUSHING_STICKERS.filter(s => !current.includes(s));
      if (available.length > 0) {
        const sticker = available[Math.floor(Math.random() * available.length)];
        unlockSticker(sticker);
        return sticker;
      }
    }

    // For story completions, award completion stickers
    if (questId.startsWith("story-") || questId.includes("adventure")) {
      const current = getUnlockedStickers();
      const available = COMPLETION_STICKERS.filter(s => !current.includes(s));
      if (available.length > 0) {
        const sticker = available[Math.floor(Math.random() * available.length)];
        unlockSticker(sticker);
        return sticker;
      }
    }

    return null;
  }, [unlockSticker, getUnlockedStickers]);

  // Award sticker based on streak milestone
  const awardStreakSticker = useCallback((currentStreak: number): string | null => {
    const stickerId = STREAK_STICKER_MAP[currentStreak];
    if (stickerId) {
      const isNew = unlockSticker(stickerId);
      return isNew ? stickerId : null;
    }
    return null;
  }, [unlockSticker]);

  // Award first-time completion sticker
  const awardFirstQuestSticker = useCallback((): string | null => {
    const current = getUnlockedStickers();
    if (!current.includes("super-star")) {
      unlockSticker("super-star");
      return "super-star";
    }
    return null;
  }, [getUnlockedStickers, unlockSticker]);

  // Get sticker info by ID
  const getStickerInfo = useCallback((stickerId: string): { emoji: string; name: string } | null => {
    const stickerMap: Record<string, { emoji: string; name: string }> = {
      "brush-champ": { emoji: "🪥", name: "Brush Champ" },
      "sparkle-teeth": { emoji: "✨", name: "Sparkle Teeth" },
      "morning-star": { emoji: "🌅", name: "Morning Star" },
      "night-owl": { emoji: "🌙", name: "Night Owl" },
      "floss-boss": { emoji: "🦷", name: "Floss Boss" },
      "clean-machine": { emoji: "🫧", name: "Clean Machine" },
      "super-star": { emoji: "⭐", name: "Super Star" },
      "champion": { emoji: "🏆", name: "Champion" },
      "hero": { emoji: "🦸", name: "Dental Hero" },
      "streak-3": { emoji: "🔥", name: "3 Day Streak" },
      "streak-7": { emoji: "💪", name: "7 Day Streak" },
      "streak-30": { emoji: "👑", name: "30 Day King" },
      "clinic-visitor": { emoji: "🏥", name: "Clinic Explorer" },
    };
    return stickerMap[stickerId] || null;
  }, []);

  // Award clinic visitor sticker
  const awardClinicVisitSticker = useCallback((): string | null => {
    const isNew = unlockSticker("clinic-visitor");
    return isNew ? "clinic-visitor" : null;
  }, [unlockSticker]);

  return {
    getUnlockedStickers,
    unlockSticker,
    awardQuestSticker,
    awardStreakSticker,
    awardFirstQuestSticker,
    awardClinicVisitSticker,
    getStickerInfo,
  };
}