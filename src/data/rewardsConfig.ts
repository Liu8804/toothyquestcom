// ToothyQuest Rewards System Configuration

export interface QuestPointsConfig {
  questId: string;
  basePoints: number;
  bonusPerQuestion: number;
  totalPossible: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Level {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  reward: string;
  emoji: string;
  unlockDescription: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: {
    type: 'quest_category' | 'quest_count' | 'points' | 'streak';
    category?: string;
    count: number;
  };
  color: string;
}

export interface ToothPet {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockCondition: string;
  rarity: 'common' | 'rare' | 'legendary';
}

// Levels / Progression System
export const LEVELS: Level[] = [
  {
    level: 1,
    name: "Tooth Explorer",
    minPoints: 0,
    maxPoints: 100,
    reward: "Unlock first mini-game bonus",
    emoji: "🦷",
    unlockDescription: "Start your dental adventure!",
  },
  {
    level: 2,
    name: "Cavity Crusher",
    minPoints: 101,
    maxPoints: 250,
    reward: "Unlock new tooth pet animation",
    emoji: "💪",
    unlockDescription: "Crush those cavities!",
  },
  {
    level: 3,
    name: "Smile Superhero",
    minPoints: 251,
    maxPoints: 500,
    reward: "Unlock special sparkle confetti",
    emoji: "🦸",
    unlockDescription: "You're a true hero!",
  },
  {
    level: 4,
    name: "Plaque Protector",
    minPoints: 501,
    maxPoints: Infinity,
    reward: "Unlock ultimate Tooth Trophy case display",
    emoji: "🛡️",
    unlockDescription: "Master of dental hygiene!",
  },
];

// Quest Points Mapping
export const QUEST_POINTS: QuestPointsConfig[] = [
  { questId: "cavity-castle-rescue", basePoints: 50, bonusPerQuestion: 10, totalPossible: 70, difficulty: 'hard' },
  { questId: "tunnel-adventure", basePoints: 60, bonusPerQuestion: 10, totalPossible: 80, difficulty: 'hard' },
  { questId: "tooth-train-track", basePoints: 40, bonusPerQuestion: 10, totalPossible: 60, difficulty: 'medium' },
  { questId: "sparkle-shower", basePoints: 30, bonusPerQuestion: 10, totalPossible: 50, difficulty: 'easy' },
  { questId: "tooth-armor", basePoints: 50, bonusPerQuestion: 10, totalPossible: 70, difficulty: 'hard' },
  { questId: "little-tooth-farewell", basePoints: 40, bonusPerQuestion: 10, totalPossible: 60, difficulty: 'medium' },
  { questId: "superhero-shield", basePoints: 50, bonusPerQuestion: 10, totalPossible: 70, difficulty: 'hard' },
  { questId: "tooth-detective", basePoints: 40, bonusPerQuestion: 10, totalPossible: 60, difficulty: 'medium' },
  { questId: "adventure-tooth", basePoints: 45, bonusPerQuestion: 10, totalPossible: 65, difficulty: 'medium' },
  { questId: "sparkle-potion", basePoints: 35, bonusPerQuestion: 10, totalPossible: 55, difficulty: 'easy' },
  { questId: "tooth-fixing-fairy", basePoints: 40, bonusPerQuestion: 10, totalPossible: 60, difficulty: 'medium' },
  { questId: "sports-shield", basePoints: 45, bonusPerQuestion: 10, totalPossible: 65, difficulty: 'medium' },
];

// Default points for quests not in the mapping
export const DEFAULT_QUEST_POINTS = { basePoints: 30, bonusPerQuestion: 10, difficulty: 'easy' as const };

// Achievement Badges
export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "brushing-badge",
    name: "Brushing Badge",
    description: "Complete 3 cleaning quests",
    emoji: "🪥",
    requirement: { type: 'quest_category', category: 'cleaning', count: 3 },
    color: "from-primary to-bubble",
  },
  {
    id: "cavity-hero",
    name: "Cavity Hero Badge",
    description: "Complete 3 filling/root canal quests",
    emoji: "🦸",
    requirement: { type: 'quest_category', category: 'treatment', count: 3 },
    color: "from-secondary to-candy",
  },
  {
    id: "shiny-smile",
    name: "Shiny Smile Badge",
    description: "Complete all whitening or bonding quests",
    emoji: "✨",
    requirement: { type: 'quest_category', category: 'cosmetic', count: 2 },
    color: "from-star to-accent",
  },
  {
    id: "brave-tooth",
    name: "Brave Tooth Badge",
    description: "Complete an extraction/wisdom tooth quest",
    emoji: "💎",
    requirement: { type: 'quest_category', category: 'extraction', count: 1 },
    color: "from-accent to-mint",
  },
  {
    id: "streak-champion",
    name: "Streak Champion",
    description: "Complete quests 3 days in a row",
    emoji: "🔥",
    requirement: { type: 'streak', count: 3 },
    color: "from-secondary to-star",
  },
  {
    id: "quest-master",
    name: "Quest Master",
    description: "Complete 10 quests total",
    emoji: "👑",
    requirement: { type: 'quest_count', count: 10 },
    color: "from-star to-secondary",
  },
  {
    id: "point-collector",
    name: "Point Collector",
    description: "Earn 500 total Sparkle Points",
    emoji: "💰",
    requirement: { type: 'points', count: 500 },
    color: "from-accent to-star",
  },
];

// Quest Categories for badge tracking
export const QUEST_CATEGORIES: Record<string, string> = {
  "sparkle-shower": "cleaning",
  "sparkle-potion": "cosmetic",
  "tooth-fixing-fairy": "cosmetic",
  "cavity-castle-rescue": "treatment",
  "tunnel-adventure": "treatment",
  "tooth-armor": "treatment",
  "superhero-shield": "treatment",
  "little-tooth-farewell": "extraction",
  "adventure-tooth": "extraction",
  "tooth-train-track": "braces",
  "tooth-detective": "checkup",
  "sports-shield": "protection",
};

// Tooth Pets (unlockable companions)
export const TOOTH_PETS: ToothPet[] = [
  { id: "toothy", name: "Toothy", emoji: "✨", description: "Your first tooth friend!", unlockCondition: "Start playing", rarity: 'common' },
  { id: "brushy", name: "Brushy", emoji: "🪥", description: "A helpful toothbrush pal", unlockCondition: "Complete 5 quests", rarity: 'common' },
  { id: "flossy", name: "Flossy", emoji: "🧵", description: "Gets into tight spots", unlockCondition: "Complete 10 quests", rarity: 'rare' },
  { id: "sparkle", name: "Sparkle", emoji: "✨", description: "Makes everything shine", unlockCondition: "Reach Level 2", rarity: 'rare' },
  { id: "minty", name: "Minty", emoji: "🍃", description: "Fresh and cool", unlockCondition: "Reach Level 3", rarity: 'rare' },
  { id: "goldie", name: "Goldie", emoji: "👑", description: "Legendary tooth royalty", unlockCondition: "Reach Level 4", rarity: 'legendary' },
];

// Mystery Chest items
export const MYSTERY_CHEST_ITEMS = [
  { name: "Sparkle Boost", emoji: "✨", bonusPoints: 5, message: "Bonus sparkles for your next quest!" },
  { name: "Star Sticker", emoji: "⭐", bonusPoints: 10, message: "A golden star just for you!" },
  { name: "Rainbow Badge", emoji: "🌈", bonusPoints: 15, message: "Colors to brighten your day!" },
  { name: "Diamond Tooth", emoji: "💎", bonusPoints: 20, message: "Rare and precious!" },
  { name: "Magic Wand", emoji: "🪄", bonusPoints: 25, message: "Wave away the sugar bugs!" },
  { name: "Crown Jewel", emoji: "👑", bonusPoints: 30, message: "Fit for a smile champion!" },
];

// Bonus rewards
export const BONUS_REWARDS = {
  dailyOpen: 10,      // +10 points for opening app daily
  streakBonus: 20,    // +20 points for 3-day streak
  correctAnswer: 10,  // +10 points per correct quiz answer
};

// Helper functions
export function getLevelForPoints(points: number): Level {
  return LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0];
}

export function getNextLevel(currentPoints: number): Level | null {
  const currentLevel = getLevelForPoints(currentPoints);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  return nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = getLevelForPoints(points);
  const nextLevel = getNextLevel(points);
  
  if (!nextLevel) return 100; // Max level
  
  const pointsInLevel = points - currentLevel.minPoints;
  const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
  
  return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
}

export function getQuestPoints(questId: string): QuestPointsConfig {
  return QUEST_POINTS.find(q => q.questId === questId) || {
    questId,
    ...DEFAULT_QUEST_POINTS,
    totalPossible: DEFAULT_QUEST_POINTS.basePoints + (DEFAULT_QUEST_POINTS.bonusPerQuestion * 2),
  };
}

export function getRandomChestItem() {
  return MYSTERY_CHEST_ITEMS[Math.floor(Math.random() * MYSTERY_CHEST_ITEMS.length)];
}

export function getQuestCategory(questId: string): string | undefined {
  return QUEST_CATEGORIES[questId];
}
