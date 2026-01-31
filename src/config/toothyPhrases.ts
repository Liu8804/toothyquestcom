/**
 * Toothy's Playful Phrases - Kid-friendly voice lines
 * 
 * Short, cheerful phrases for ages 3-6
 * Designed for high energy, slightly higher pitch cartoon effect
 */

export type PhraseCategory = 
  | "sparkle"
  | "brushStart"
  | "brushComplete"
  | "toothTap"
  | "celebration"
  | "encouragement";

export interface ToothyPhrase {
  text: string;
  emoji: string;
  category: PhraseCategory;
  /** Voice mood for ElevenLabs delivery */
  mood: "excited" | "encouraging" | "positive" | "calm";
}

/**
 * Core phrases - short and clear for young kids
 */
export const TOOTHY_PHRASES: Record<string, ToothyPhrase> = {
  // Sparkle/shine reactions
  sparkle: {
    text: "Yay! You made me sparkle!",
    emoji: "✨",
    category: "sparkle",
    mood: "excited",
  },
  shinySmile: {
    text: "Look at my shiny smile!",
    emoji: "😁",
    category: "sparkle", 
    mood: "positive",
  },
  
  // Brushing start
  brushTogether: {
    text: "Let's brush together!",
    emoji: "🪥",
    category: "brushStart",
    mood: "encouraging",
  },
  
  // Brushing complete
  allClean: {
    text: "All clean! Woohoo!",
    emoji: "🎉",
    category: "brushComplete",
    mood: "excited",
  },
  
  // Tooth tap interactions
  tapTeeth: {
    text: "Tap my teeth to shine!",
    emoji: "💫",
    category: "toothTap",
    mood: "encouraging",
  },
  
  // Celebration
  hooray: {
    text: "Hooray! We did it!",
    emoji: "🎊",
    category: "celebration",
    mood: "excited",
  },
  
  // Extra encouragement phrases
  greatJob: {
    text: "Great job, superstar!",
    emoji: "⭐",
    category: "encouragement",
    mood: "positive",
  },
  keepGoing: {
    text: "Keep going! You're amazing!",
    emoji: "🌟",
    category: "encouragement",
    mood: "encouraging",
  },
  soProud: {
    text: "I'm so proud of you!",
    emoji: "💖",
    category: "celebration",
    mood: "positive",
  },
  almostThere: {
    text: "Almost there! You got this!",
    emoji: "💪",
    category: "encouragement",
    mood: "encouraging",
  },
};

/**
 * Get a random phrase by category
 */
export const getRandomPhrase = (category: PhraseCategory): ToothyPhrase => {
  const categoryPhrases = Object.values(TOOTHY_PHRASES).filter(
    (p) => p.category === category
  );
  return categoryPhrases[Math.floor(Math.random() * categoryPhrases.length)];
};

/**
 * Get phrase by key
 */
export const getPhrase = (key: keyof typeof TOOTHY_PHRASES): ToothyPhrase => {
  return TOOTHY_PHRASES[key];
};
