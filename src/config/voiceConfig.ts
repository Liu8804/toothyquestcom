/**
 * Single consistent voice configuration for ToothyQuest
 * 
 * Goal: Create a familiar "friendly guide" voice that kids recognize
 * and feel comfortable with every time they use the app.
 * 
 * Voice: Lily (pFZP5JQG7iQjIQuC4Bku) - Warm, kid-friendly, natural
 */

// The ONE consistent voice for all app narration
export const TOOTHY_VOICE = {
  voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - warm, gentle, kid-friendly
  name: "Toothy's Friend",
  
  // Base settings for natural, expressive delivery
  baseSettings: {
    stability: 0.45,        // Allows natural expression
    similarityBoost: 0.75,  // Maintains voice consistency
    style: 0.6,             // Expressive but not over the top
    speed: 0.95,            // Natural pace for kids
  },
  
  // Emotional variations using the SAME voice
  moods: {
    // For quiz questions, story narration
    neutral: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.5,
      speed: 0.95,
    },
    
    // "Yay! You got it right! 🎉 Tooth-tastic job!"
    excited: {
      stability: 0.35,
      similarityBoost: 0.8,
      style: 0.8,
      speed: 1.0,
    },
    
    // "Hmm… let's think about this one!"
    curious: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.6,
      speed: 0.9,
    },
    
    // "Almost! Want to try again?"
    encouraging: {
      stability: 0.45,
      similarityBoost: 0.75,
      style: 0.65,
      speed: 0.92,
    },
    
    // "Great effort! You're learning so much!"
    positive: {
      stability: 0.4,
      similarityBoost: 0.78,
      style: 0.7,
      speed: 0.95,
    },
    
    // Calm bedtime/gentle moments
    calm: {
      stability: 0.6,
      similarityBoost: 0.7,
      style: 0.4,
      speed: 0.88,
    },
  },
} as const;

export type VoiceMood = keyof typeof TOOTHY_VOICE.moods;

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
    ...TOOTHY_VOICE.baseSettings,
  };
};
