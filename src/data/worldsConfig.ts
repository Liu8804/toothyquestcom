// World and Phase configuration for ToothyQuest
// Maps all 67+ quests into a world/phase structure

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

// ===== DENTAL CASTLE ADVENTURE (Dental Visit Prep) =====
// Phase 1 - Before the Visit: Prepare kids emotionally and introduce basic habits
const DENTAL_CASTLE_PHASE_1 = [
  "dental-castle-welcome", // NEW: Episode 1 - Welcome to Dental Castle
  "before-appointment-calm", // NEW: Calm breathing guide
  "sparkle-start",        // Quest 1 - Welcome/start
  "brushing-basics",      // Quest 2 - Brushing basics
  "floss-fun",            // Quest 3 - Flossing basics
  "healthy-bites",        // Quest 4 - Healthy eating
  "brave-little-tooth",   // Quest 7 - Losing teeth (emotional prep)
  "tooth-fairy-adventure", // Quest 8 - Tooth fairy (emotional reward)
];

// Phase 2 - At the Dentist: Introduce the dental environment and tools
const DENTAL_CASTLE_PHASE_2 = [
  "magic-chair-ride",     // NEW: Episode 2 - Magic Chair
  "meet-dental-tools",    // NEW: Meet friendly dental tools
  "dentist-not-scary",    // Quest 19 - Dentist not scary
  "explore-office-tour",  // Quest 25 - Office tour
  "shy-tooth-first-brush", // Quest 17 - Shy tooth at dentist
];

// Phase 3 - During the Checkup: Proper procedures, protection, cooperation
const DENTAL_CASTLE_PHASE_3 = [
  "counting-cleaning",    // NEW: Episode 3 - Counting & Cleaning
  "cavity-monster-trouble", // Quest 9 - Cavity awareness
  "plaque-pirates",       // Quest 16 - Plaque fight
  "tooth-detective",      // Quest 50 - X-ray detective
];

// Phase 4 - After the Visit: Celebrate, review, reinforce habits
const DENTAL_CASTLE_PHASE_4 = [
  "mission-complete-celebration", // NEW: Episode 4 - Mission Complete!
  "after-appointment-celebration", // NEW: Post-appointment celebration
  "first-adventure-complete", // Quest 6 - First adventure milestone
  "tooth-fairy-lost-map", // Quest 29 - Tooth fairy reward
  "moonlight-tooth-parade", // Quest 30 - Celebration parade
];

// ===== BRUSH LIKE A HERO (Brushing Mastery) =====
const BRUSH_HERO_PHASE_1 = [
  "brushing-basics",      // Quest 2 - Brushing basics
  "brush-and-bounce",     // Quest 14 - Fun brushing
  "brushing-timer-challenge", // Quest 27 - Timer challenge
  "super-smile-squad",    // Quest 28 - Team brushing
];

const BRUSH_HERO_PHASE_2 = [
  "magic-mouthwash",      // Quest 13 - Mouthwash
  "bubble-toothpaste-rescue", // Quest 24 - Bubble toothpaste
  "sparkle-potion",       // Quest 52 - Sparkle potion
  "shiny-tooth-club",     // Quest 15 - Rewards for habits
];

const BRUSH_HERO_PHASE_3 = [
  "plaque-pirates",       // Quest 16 - Plaque fight
  "plaque-pirates-battle", // Quest 26 - Plaque pirates battle
  "sugar-bug-hunt",       // Quest 11 - Sugar bugs
  "sugar-bug-sneak-attack", // Quest 21 - Sugar bug sneak attack
];

const BRUSH_HERO_PHASE_4 = [
  "captain-floss",        // Quest 10 - Floss hero
  "captain-floss-hidden-corn", // Quest 25 - Captain floss corn
  "smile-quest",          // Quest 12 - Daily care quest
  "dreamland-dental-adventure", // Quest 32 - Sweet dreams
];

// ===== FOOD & CAVITIES (Nutrition & Prevention) =====
const FOOD_CAVITIES_PHASE_1 = [
  "healthy-bites",        // Quest 4 - Healthy eating
  "apple-crunch",         // Apple crunch story
  "water-superhero",      // Quest 42 - Water hero
  "snack-smart",          // Quest 66 - Snack smart
];

const FOOD_CAVITIES_PHASE_2 = [
  "sugar-bug-hunt",       // Quest 11 - Sugar bugs
  "sugar-bug-sneak-attack", // Quest 21 - Sugar bug sneak attack
  "midnight-snack-mystery", // Quest 23 - Midnight snack
  "tooth-learned-wait",   // Quest 20 - Patience with treats
];

const FOOD_CAVITIES_PHASE_3 = [
  "cavity-monster-trouble", // Quest 9 - Cavity awareness
  "cavity-monster-second-chance", // Quest 22 - Cavity monster redemption
  "tooth-fixing-fairy",   // Quest 53 - Tooth fixing
  "enamel-army",          // Quest 49 - Fluoride power
];

const FOOD_CAVITIES_PHASE_4 = [
  "sparkle-potion",       // Quest 52 - Sparkle potion
  "fluoride-power",       // Fluoride quest
  "smile-quest",          // Quest 12 - Daily care quest
  "shiny-tooth-club",     // Quest 15 - Shiny tooth club
];

// ===== BRACES WORLD (Orthodontic Care) =====
const BRACES_PHASE_1 = [
  "bracey-first-day",     // Quest 5 - First braces day
  "braces-helpers",       // Quest 57 - Braces introduction
  "tooth-separators",     // Quest 58 - Space makers
  "dental-expanders",     // Quest 59 - Jaw expanders
];

const BRACES_PHASE_2 = [
  "bracey-colorful-bands", // Colorful bands story
  "bracey-wiggly-braces", // Wiggly braces adjustment
  "bracey-sticky-snack",  // Avoiding sticky foods
  "bracey-nighttime",     // Night routine with braces
];

const BRACES_PHASE_3 = [
  "bracey-superpowers",   // Braces superpowers
  "mouthguards-hero",     // Quest 60 - Mouthguards
  "sports-shield",        // Quest 54 - Sports protection
  "mouth-habits",         // Quest 55 - Mouth habits
];

const BRACES_PHASE_4 = [
  "dental-trauma",        // Quest 56 - Tooth rescue
  "tooth-safety-rules",   // Quest 67 - Safety rules
  "bracey-bands-challenge", // Bands challenge
  "first-adventure-complete", // Quest 6 - Milestone
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
        questIds: DENTAL_CASTLE_PHASE_1,
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
        questIds: DENTAL_CASTLE_PHASE_2,
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
        questIds: DENTAL_CASTLE_PHASE_3,
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
        questIds: DENTAL_CASTLE_PHASE_4,
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
    isLocked: false,
    phases: [
      {
        id: "brush-basics",
        name: "Brushing Basics",
        nameEs: "Fundamentos del Cepillado",
        description: "Learn the magical moves of proper brushing!",
        descriptionEs: "¡Aprende los movimientos mágicos del cepillado correcto!",
        emoji: "🪥",
        badgeName: "Brush Beginner",
        badgeNameEs: "Principiante del Cepillo",
        color: "bg-gradient-to-br from-pink-400 to-rose-500",
        questIds: BRUSH_HERO_PHASE_1,
      },
      {
        id: "sparkle-power",
        name: "Sparkle Power",
        nameEs: "Poder Brillante",
        description: "Unlock the power of toothpaste and mouthwash!",
        descriptionEs: "¡Desbloquea el poder de la pasta y el enjuague!",
        emoji: "✨",
        badgeName: "Sparkle Master",
        badgeNameEs: "Maestro del Brillo",
        color: "bg-gradient-to-br from-yellow-400 to-amber-500",
        questIds: BRUSH_HERO_PHASE_2,
      },
      {
        id: "germ-fighters",
        name: "Germ Fighters",
        nameEs: "Luchadores de Gérmenes",
        description: "Battle plaque pirates and sugar bugs!",
        descriptionEs: "¡Batalla contra piratas de placa y bichos de azúcar!",
        emoji: "⚔️",
        badgeName: "Germ Buster",
        badgeNameEs: "Cazador de Gérmenes",
        color: "bg-gradient-to-br from-red-400 to-orange-500",
        questIds: BRUSH_HERO_PHASE_3,
      },
      {
        id: "floss-hero",
        name: "Floss Hero",
        nameEs: "Héroe del Hilo",
        description: "Become a flossing champion!",
        descriptionEs: "¡Conviértete en campeón del hilo dental!",
        emoji: "🦸‍♂️",
        badgeName: "Floss Champion",
        badgeNameEs: "Campeón del Hilo",
        color: "bg-gradient-to-br from-indigo-400 to-purple-500",
        questIds: BRUSH_HERO_PHASE_4,
      },
    ],
  },
  {
    id: "food-cavities",
    name: "Food & Cavities",
    nameEs: "Comida y Caries",
    description: "Learn which foods are tooth friends and which are sneaky sugar bugs!",
    descriptionEs: "¡Aprende qué alimentos son amigos de los dientes y cuáles son bichos de azúcar!",
    emoji: "🍎",
    color: "from-mint to-primary",
    isLocked: false,
    phases: [
      {
        id: "tooth-friends",
        name: "Tooth-Friendly Foods",
        nameEs: "Alimentos Amigos",
        description: "Discover delicious foods that make teeth happy!",
        descriptionEs: "¡Descubre alimentos deliciosos que hacen felices a los dientes!",
        emoji: "🥕",
        badgeName: "Healthy Eater",
        badgeNameEs: "Comedor Saludable",
        color: "bg-gradient-to-br from-green-400 to-emerald-500",
        questIds: FOOD_CAVITIES_PHASE_1,
      },
      {
        id: "sugar-patrol",
        name: "Sugar Patrol",
        nameEs: "Patrulla del Azúcar",
        description: "Learn to spot sneaky sugars hiding in food!",
        descriptionEs: "¡Aprende a detectar azúcares escondidos en la comida!",
        emoji: "🔍",
        badgeName: "Sugar Detective",
        badgeNameEs: "Detective del Azúcar",
        color: "bg-gradient-to-br from-orange-400 to-red-500",
        questIds: FOOD_CAVITIES_PHASE_2,
      },
      {
        id: "cavity-defense",
        name: "Cavity Defense",
        nameEs: "Defensa Anti-Caries",
        description: "Build your defenses against cavity monsters!",
        descriptionEs: "¡Construye tus defensas contra los monstruos de caries!",
        emoji: "🛡️",
        badgeName: "Cavity Fighter",
        badgeNameEs: "Luchador Anti-Caries",
        color: "bg-gradient-to-br from-purple-400 to-indigo-500",
        questIds: FOOD_CAVITIES_PHASE_3,
      },
      {
        id: "nutrition-champion",
        name: "Nutrition Champion",
        nameEs: "Campeón de Nutrición",
        description: "Master the balance of treats and healthy foods!",
        descriptionEs: "¡Domina el equilibrio entre golosinas y alimentos saludables!",
        emoji: "🏆",
        badgeName: "Nutrition Hero",
        badgeNameEs: "Héroe de la Nutrición",
        color: "bg-gradient-to-br from-teal-400 to-cyan-500",
        questIds: FOOD_CAVITIES_PHASE_4,
      },
    ],
  },
  {
    id: "braces-world",
    name: "Braces World",
    nameEs: "Mundo de Brackets",
    description: "Special adventures for kids with braces! Learn to keep your brackets sparkling.",
    descriptionEs: "¡Aventuras especiales para niños con brackets! Aprende a mantener tus brackets brillantes.",
    emoji: "✨",
    color: "from-star to-accent",
    isLocked: false,
    phases: [
      {
        id: "braces-beginning",
        name: "Braces Beginning",
        nameEs: "Inicio con Brackets",
        description: "Everything you need to know about getting braces!",
        descriptionEs: "¡Todo lo que necesitas saber sobre tener brackets!",
        emoji: "🌟",
        badgeName: "Braces Beginner",
        badgeNameEs: "Principiante de Brackets",
        color: "bg-gradient-to-br from-blue-400 to-indigo-500",
        questIds: BRACES_PHASE_1,
      },
      {
        id: "braces-care",
        name: "Braces Care",
        nameEs: "Cuidado de Brackets",
        description: "Learn the best ways to care for your braces!",
        descriptionEs: "¡Aprende las mejores formas de cuidar tus brackets!",
        emoji: "💎",
        badgeName: "Braces Expert",
        badgeNameEs: "Experto en Brackets",
        color: "bg-gradient-to-br from-pink-400 to-fuchsia-500",
        questIds: BRACES_PHASE_2,
      },
      {
        id: "braces-power",
        name: "Braces Superpowers",
        nameEs: "Superpoderes de Brackets",
        description: "Discover the amazing things braces can do!",
        descriptionEs: "¡Descubre las cosas increíbles que los brackets pueden hacer!",
        emoji: "💪",
        badgeName: "Braces Hero",
        badgeNameEs: "Héroe de Brackets",
        color: "bg-gradient-to-br from-violet-400 to-purple-500",
        questIds: BRACES_PHASE_3,
      },
      {
        id: "braces-champion",
        name: "Braces Champion",
        nameEs: "Campeón de Brackets",
        description: "You're a braces pro! Celebrate your journey!",
        descriptionEs: "¡Eres un profesional de los brackets! ¡Celebra tu viaje!",
        emoji: "🏆",
        badgeName: "Braces Champion",
        badgeNameEs: "Campeón de Brackets",
        color: "bg-gradient-to-br from-amber-400 to-yellow-500",
        questIds: BRACES_PHASE_4,
      },
    ],
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
