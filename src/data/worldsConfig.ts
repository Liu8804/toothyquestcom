// World and Phase configuration for ToothyQuest
// Maps all 67 quests into a world/phase structure

export interface Phase {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  emoji: string;
  badgeName: string;
  badgeNameEs: string;
  color: string;
  questIds: string[];
}

export interface World {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  emoji: string;
  color: string;
  isLocked: boolean;
  phases: Phase[];
}

// Phase 1 - Before the Visit: Prepare kids emotionally and introduce basic habits
const PHASE_1_QUESTS = [
  "dental-castle-welcome", // NEW: Episode 1 - Welcome to Dental Castle
  "before-appointment-calm", // NEW: Calm breathing guide
  "sparkle-start",        // Quest 1 - Welcome/start
  "brushing-basics",      // Quest 2 - Brushing basics
  "floss-fun",            // Quest 3 - Flossing basics
  "healthy-bites",        // Quest 4 - Healthy eating
  "brave-little-tooth",   // Quest 7 - Losing teeth (emotional prep)
  "tooth-fairy-adventure", // Quest 8 - Tooth fairy (emotional reward)
  "magic-mouthwash",      // Quest 13 - Mouthwash
  "brush-and-bounce",     // Quest 14 - Fun brushing
  "mouth-habits",         // Quest 55 - Habit awareness
  "baby-teeth-matter",    // Quest 64 - Baby teeth importance
  "tooth-safety-rules",   // Quest 67 - Safety rules
];

// Phase 2 - At the Dentist: Introduce the dental environment and tools
const PHASE_2_QUESTS = [
  "magic-chair-ride",     // NEW: Episode 2 - Magic Chair
  "meet-dental-tools",    // NEW: Meet friendly dental tools
  "friendly-dentist",     // Quest 17 - Friendly dentist intro
  "explore-office-tour",  // Quest 25 - Office tour
  "shy-tooth",            // Quest 23 - Shy tooth at dentist
  "dentist-visits",       // Quest 63 - Dentist day
  "bracey-first-day",     // Quest 5 - First braces day
  "braces-helpers",       // Quest 57 - Braces introduction
  "tooth-separators",     // Quest 58 - Space makers
  "dental-expanders",     // Quest 59 - Jaw expanders
];

// Phase 3 - During the Checkup: Proper procedures, protection, cooperation
const PHASE_3_QUESTS = [
  "counting-cleaning",    // NEW: Episode 3 - Counting & Cleaning
  "cavity-monster-trouble", // Quest 9 - Cavity awareness
  "captain-floss",        // Quest 10 - Floss hero
  "sugar-bug-hunt",       // Quest 11 - Sugar bugs
  "smile-quest",          // Quest 12 - Daily care quest
  "plaque-pirates",       // Quest 16 - Plaque fight
  "brushing-timer-challenge", // Quest 27 - Timer challenge
  "super-smile-squad",    // Quest 28 - Team brushing
  "mouthguards-hero",     // Quest 60 - Mouthguards
  "sports-shield",        // Quest 54 - Sports protection
  "dental-trauma",        // Quest 56 - Tooth rescue
  "plaque-and-germs",     // Quest 65 - Plaque patrol
];

// Phase 4 - After the Visit: Celebrate, review, reinforce habits
const PHASE_4_QUESTS = [
  "mission-complete-celebration", // NEW: Episode 4 - Mission Complete!
  "after-appointment-celebration", // NEW: Post-appointment celebration
  "tooth-fairy-lost-map", // Quest 29 - Tooth fairy reward
  "moonlight-tooth-parade", // Quest 30 - Celebration parade
  "dreamland-dental-adventure", // Quest 32 - Sweet dreams
  "shiny-tooth-club",     // Quest 15 - Rewards for habits
  "first-adventure-complete", // Quest 6 - First adventure milestone
];

export const WORLDS: World[] = [
  {
    id: "dental-castle",
    name: "Dental Castle Adventure",
    nameEs: "Aventura en el Castillo Dental",
    description: "A magical journey that helps kids feel brave before, during, and after the dentist.",
    descriptionEs: "Un viaje mágico que ayuda a los niños a sentirse valientes antes, durante y después del dentista.",
    emoji: "🏰",
    color: "from-primary to-secondary",
    isLocked: false,
    phases: [
      {
        id: "before-visit",
        name: "Before the Visit",
        nameEs: "Antes de la Visita",
        description: "Get ready for your dental adventure! Learn healthy habits and feel brave.",
        descriptionEs: "¡Prepárate para tu aventura dental! Aprende hábitos saludables y siéntete valiente.",
        emoji: "🌈",
        badgeName: "Calm Explorer",
        badgeNameEs: "Explorador Tranquilo",
        color: "bg-gradient-to-br from-sky-400 to-blue-500",
        questIds: PHASE_1_QUESTS,
      },
      {
        id: "at-dentist",
        name: "At the Dentist",
        nameEs: "En el Dentista",
        description: "Welcome to the Dental Castle! Meet the friendly tools and helpers.",
        descriptionEs: "¡Bienvenido al Castillo Dental! Conoce las herramientas y ayudantes amigables.",
        emoji: "🏰",
        badgeName: "Dental Castle Helper",
        badgeNameEs: "Ayudante del Castillo Dental",
        color: "bg-gradient-to-br from-violet-400 to-purple-500",
        questIds: PHASE_2_QUESTS,
      },
      {
        id: "during-checkup",
        name: "During the Checkup",
        nameEs: "Durante el Chequeo",
        description: "Teeth are counted and cleaned gently. You're doing amazing!",
        descriptionEs: "Los dientes se cuentan y limpian suavemente. ¡Lo estás haciendo increíble!",
        emoji: "🧼",
        badgeName: "Sparkle Smile",
        badgeNameEs: "Sonrisa Brillante",
        color: "bg-gradient-to-br from-emerald-400 to-green-500",
        questIds: PHASE_3_QUESTS,
      },
      {
        id: "after-visit",
        name: "After the Visit",
        nameEs: "Después de la Visita",
        description: "Celebrate your bravery! You're a dental champion!",
        descriptionEs: "¡Celebra tu valentía! ¡Eres un campeón dental!",
        emoji: "🎉",
        badgeName: "Fear-Free Champion",
        badgeNameEs: "Campeón Sin Miedo",
        color: "bg-gradient-to-br from-amber-400 to-orange-500",
        questIds: PHASE_4_QUESTS,
      },
    ],
  },
  {
    id: "brush-hero",
    name: "Brush Like a Hero",
    nameEs: "Cepilla Como un Héroe",
    description: "Master the art of brushing with fun challenges and power-ups!",
    descriptionEs: "¡Domina el arte del cepillado con desafíos divertidos y poderes!",
    emoji: "🦸",
    color: "from-coral to-secondary",
    isLocked: true,
    phases: [],
  },
  {
    id: "food-cavities",
    name: "Food & Cavities",
    nameEs: "Comida y Caries",
    description: "Learn which foods are tooth friends and which are sneaky sugar bugs!",
    descriptionEs: "¡Aprende qué alimentos son amigos de los dientes y cuáles son bichos de azúcar!",
    emoji: "🍎",
    color: "from-mint to-primary",
    isLocked: true,
    phases: [],
  },
  {
    id: "braces-world",
    name: "Braces World",
    nameEs: "Mundo de Brackets",
    description: "Special adventures for kids with braces! Learn to keep your brackets sparkling.",
    descriptionEs: "¡Aventuras especiales para niños con brackets! Aprende a mantener tus brackets brillantes.",
    emoji: "✨",
    color: "from-star to-accent",
    isLocked: true,
    phases: [],
  },
];

// Helper function to get phase for a quest
export function getPhaseForQuest(questId: string): { world: World; phase: Phase } | null {
  for (const world of WORLDS) {
    for (const phase of world.phases) {
      if (phase.questIds.includes(questId)) {
        return { world, phase };
      }
    }
  }
  return null;
}

// Helper function to get all quests in order for a phase
export function getQuestsForPhase(phaseId: string): string[] {
  for (const world of WORLDS) {
    const phase = world.phases.find(p => p.id === phaseId);
    if (phase) {
      return phase.questIds;
    }
  }
  return [];
}

// Get phase progress
export function getPhaseProgress(phaseId: string, completedQuests: string[]): number {
  const questIds = getQuestsForPhase(phaseId);
  if (questIds.length === 0) return 0;
  const completed = questIds.filter(id => completedQuests.includes(id)).length;
  return Math.round((completed / questIds.length) * 100);
}

// Check if phase is completed
export function isPhaseCompleted(phaseId: string, completedQuests: string[]): boolean {
  const questIds = getQuestsForPhase(phaseId);
  return questIds.length > 0 && questIds.every(id => completedQuests.includes(id));
}

// Get next incomplete quest in a phase
export function getNextQuestInPhase(phaseId: string, completedQuests: string[]): string | null {
  const questIds = getQuestsForPhase(phaseId);
  return questIds.find(id => !completedQuests.includes(id)) || null;
}
