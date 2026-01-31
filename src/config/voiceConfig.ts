/**
 * Single consistent voice configuration for ToothyQuest
 * 
 * Goal: Create a familiar "friendly guide" voice that kids recognize
 * and feel comfortable with every time they use the app.
 * 
 * Voice: Custom Toothy Voice (LSfMSUsuD24K9gbY84R5) - Warm, kid-friendly
 */

// The ONE consistent voice for all app narration
export const TOOTHY_VOICE = {
  voiceId: "LSfMSUsuD24K9gbY84R5", // Custom Toothy voice
  name: "Toothy's Friend",
  
  // Base settings for natural, expressive delivery
  baseSettings: {
    stability: 0.45,        // Allows natural expression
    similarityBoost: 0.75,  // Maintains voice consistency
    style: 0.6,             // Expressive but not over the top
    speed: 0.95,            // Natural pace for kids
  },
  
  // Emotional variations using the SAME voice
  // Tuned for cheerful, playful, energetic kid-friendly delivery
  moods: {
    // For quiz questions, story narration
    neutral: {
      stability: 0.45,
      similarityBoost: 0.75,
      style: 0.55,
      speed: 1.0,
    },
    
    // "Yay! You made me sparkle!" - High energy celebration
    excited: {
      stability: 0.25,       // More expressive variation
      similarityBoost: 0.85,
      style: 0.9,            // Maximum style for cartoon effect
      speed: 1.1,            // Slightly faster = more energetic
    },
    
    // "Hmm… let's think about this one!"
    curious: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.6,
      speed: 0.95,
    },
    
    // "Let's brush together!" - Warm and inviting
    encouraging: {
      stability: 0.4,
      similarityBoost: 0.8,
      style: 0.75,           // More expressive
      speed: 1.0,
    },
    
    // "Great job, superstar!" - Proud and cheerful
    positive: {
      stability: 0.35,
      similarityBoost: 0.82,
      style: 0.8,
      speed: 1.05,           // Slightly upbeat
    },
    
    // Calm bedtime/gentle moments
    calm: {
      stability: 0.6,
      similarityBoost: 0.7,
      style: 0.4,
      speed: 0.88,
    },
    
    // "Hooray! We did it!" - Maximum celebration energy
    celebration: {
      stability: 0.2,        // Very expressive
      similarityBoost: 0.85,
      style: 0.95,           // Full cartoon energy
      speed: 1.15,           // Fast and energetic
    },
  },
} as const;

export type VoiceMood = keyof typeof TOOTHY_VOICE.moods;

// Extended mood type that includes celebration
export type ExtendedVoiceMood = VoiceMood | "celebration";

/**
 * Get voice settings for a specific emotional context
 */
export const getVoiceForMood = (mood: VoiceMood = "neutral") => {
  return {
    voiceId: TOOTHY_VOICE.voiceId,
    ...TOOTHY_VOICE.moods[mood],
  };
};

/**
 * Get the base voice settings (for general narration)
 */
export const getBaseVoice = () => {
  return {
    voiceId: TOOTHY_VOICE.voiceId,
    name: TOOTHY_VOICE.name,
    ...TOOTHY_VOICE.baseSettings,
  };
};
