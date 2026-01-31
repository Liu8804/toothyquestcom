/**
 * Toothy's Playful Phrases - Kid-friendly voice lines
 * 
 * Short, cheerful phrases for ages 3-6
 * Designed for high energy, slightly higher pitch cartoon effect
 * 
 * Supports English and Spanish (bilingual app)
 */

export type PhraseCategory = 
  | "sparkle"
  | "brushStart"
  | "brushComplete"
  | "toothTap"
  | "celebration"
  | "encouragement"
  | "greeting";

export interface ToothyPhrase {
  text: string;
  textEs: string; // Spanish translation
  emoji: string;
  category: PhraseCategory;
  /** Voice mood for ElevenLabs delivery */
  mood: "excited" | "encouraging" | "positive" | "calm";
}

/**
 * Core phrases - short and clear for young kids
 * Each phrase has English (text) and Spanish (textEs) versions
 */
export const TOOTHY_PHRASES: Record<string, ToothyPhrase> = {
  // Sparkle/shine reactions
  sparkle: {
    text: "Yay! You made me sparkle!",
    textEs: "¡Yupi! ¡Me hiciste brillar!",
    emoji: "✨",
    category: "sparkle",
    mood: "excited",
  },
  shinySmile: {
    text: "Look at my shiny smile!",
    textEs: "¡Mira mi sonrisa brillante!",
    emoji: "😁",
    category: "sparkle", 
    mood: "positive",
  },
  
  // Brushing start
  brushTogether: {
    text: "Let's brush together!",
    textEs: "¡Vamos a cepillarnos juntos!",
    emoji: "🪥",
    category: "brushStart",
    mood: "encouraging",
  },
  
  // Brushing complete
  allClean: {
    text: "All clean! Woohoo!",
    textEs: "¡Todo limpio! ¡Yuju!",
    emoji: "🎉",
    category: "brushComplete",
    mood: "excited",
  },
  
  // Tooth tap interactions
  tapTeeth: {
    text: "Tap my teeth to shine!",
    textEs: "¡Toca mis dientes para brillar!",
    emoji: "💫",
    category: "toothTap",
    mood: "encouraging",
  },
  
  // Celebration
  hooray: {
    text: "Hooray! We did it!",
    textEs: "¡Hurra! ¡Lo logramos!",
    emoji: "🎊",
    category: "celebration",
    mood: "excited",
  },
  
  // Extra encouragement phrases
  greatJob: {
    text: "Great job, superstar!",
    textEs: "¡Buen trabajo, superestrella!",
    emoji: "⭐",
    category: "encouragement",
    mood: "positive",
  },
  keepGoing: {
    text: "Keep going! You're amazing!",
    textEs: "¡Sigue así! ¡Eres increíble!",
    emoji: "🌟",
    category: "encouragement",
    mood: "encouraging",
  },
  soProud: {
    text: "I'm so proud of you!",
    textEs: "¡Estoy muy orgulloso de ti!",
    emoji: "💖",
    category: "celebration",
    mood: "positive",
  },
  almostThere: {
    text: "Almost there! You got this!",
    textEs: "¡Ya casi! ¡Tú puedes!",
    emoji: "💪",
    category: "encouragement",
    mood: "encouraging",
  },
  youDidIt: {
    text: "You did it! Amazing!",
    textEs: "¡Lo hiciste! ¡Increíble!",
    emoji: "🌈",
    category: "celebration",
    mood: "excited",
  },
  superStar: {
    text: "You're a super star!",
    textEs: "¡Eres una superestrella!",
    emoji: "💫",
    category: "celebration",
    mood: "excited",
  },
  teethLoveThat: {
    text: "Your teeth love that!",
    textEs: "¡A tus dientes les encanta!",
    emoji: "🦷",
    category: "encouragement",
    mood: "positive",
  },
  
  // Greeting phrases
  helloFriend: {
    text: "Hello, friend! Ready to brush?",
    textEs: "¡Hola, amigo! ¿Listo para cepillarte?",
    emoji: "👋",
    category: "greeting",
    mood: "encouraging",
  },
  welcomeBack: {
    text: "Welcome back, superstar!",
    textEs: "¡Bienvenido de nuevo, superestrella!",
    emoji: "🌟",
    category: "greeting",
    mood: "positive",
  },
  goodMorning: {
    text: "Good morning! Time to shine!",
    textEs: "¡Buenos días! ¡Hora de brillar!",
    emoji: "☀️",
    category: "greeting",
    mood: "encouraging",
  },
  letsHaveFun: {
    text: "Let's have fun together!",
    textEs: "¡Vamos a divertirnos juntos!",
    emoji: "🎈",
    category: "greeting",
    mood: "excited",
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
 * Get a random celebration phrase for variety
 */
export const getRandomCelebration = (): ToothyPhrase => {
  const celebrations = Object.values(TOOTHY_PHRASES).filter(
    (p) => p.category === "celebration"
  );
  return celebrations[Math.floor(Math.random() * celebrations.length)];
};

/**
 * Get a random encouragement phrase
 */
export const getRandomEncouragement = (): ToothyPhrase => {
  const encouragements = Object.values(TOOTHY_PHRASES).filter(
    (p) => p.category === "encouragement"
  );
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

/**
 * Get a random greeting phrase
 */
export const getRandomGreeting = (): ToothyPhrase => {
  const greetings = Object.values(TOOTHY_PHRASES).filter(
    (p) => p.category === "greeting"
  );
  return greetings[Math.floor(Math.random() * greetings.length)];
};

/**
 * Get phrase by key
 */
export const getPhrase = (key: keyof typeof TOOTHY_PHRASES): ToothyPhrase => {
  return TOOTHY_PHRASES[key];
};

/**
 * Get localized text based on current language
 */
export const getLocalizedText = (phrase: ToothyPhrase, lang: string): string => {
  return lang.startsWith("es") ? phrase.textEs : phrase.text;
};
