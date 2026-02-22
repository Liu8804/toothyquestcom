import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { buildFunctionsHeaders } from "@/lib/functionsAuth";
import { TOOTHY_PHRASES, getPhrase, getRandomPhrase, PhraseCategory, ToothyPhrase, getLocalizedText } from "@/config/toothyPhrases";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { useMascotSounds } from "./useMascotSounds";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";
import { unlockAudioContext, registerVoiceAudio, stopAllMedia } from "./useAudioManager";

/**
 * Hook for speaking Toothy's playful phrases with matching sounds
 * 
 * Uses ONLY ElevenLabs AI voice (LSfMSUsuD24K9gbY84R5)
 * No browser speechSynthesis fallback - consistent character voice only
 * 
 * Supports English and Spanish based on current language
 */
export const useToothyPhrases = () => {
  const { i18n } = useTranslation();
  const { 
    playSparkleChime, 
    playDing, 
    playWoohoo, 
    playToothTapShine,
    playBrushStart,
    playBrushComplete,
  } = useMascotSounds();

  /**
   * Get the text in the current language
   */
  const getTextForPhrase = useCallback((phrase: ToothyPhrase): string => {
    return getLocalizedText(phrase, i18n.language);
  }, [i18n.language]);

  /**
   * Speak a phrase with ElevenLabs AI voice ONLY
   * No browser TTS fallback - we want consistent Toothy voice everywhere
   */
  const speakPhrase = useCallback(async (phrase: ToothyPhrase) => {
    const voiceVolume = getEffectiveVolume("voice");
    if (voiceVolume === 0) return;

    // Stop any existing audio first
    stopAllMedia();
    unlockAudioContext();

    // Map phrase mood to voice mood
    const voiceMood = phrase.mood === "excited" ? "excited" : phrase.mood as VoiceMood;
    const voiceSettings = getVoiceForMood(voiceMood);

    // Get localized text
    const text = getTextForPhrase(phrase);

    try {
      const headers = await buildFunctionsHeaders();
      
      console.log("[ToothyPhrases] Speaking:", text, "with mood:", phrase.mood, "lang:", i18n.language);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            text,
            voiceId: voiceSettings.voiceId,
            voiceSettings: {
              stability: voiceSettings.stability,
              similarityBoost: voiceSettings.similarityBoost,
              style: voiceSettings.style,
              speed: voiceSettings.speed,
            },
          }),
        }
      );

      if (!response.ok) {
        // Check for quota errors specifically
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData?.error?.includes?.("quota") || errorData?.error?.includes?.("credits")) {
            console.info("[ToothyPhrases] Voice quota exceeded - continuing silently");
            return; // Gracefully continue without voice
          }
        }
        console.warn("[ToothyPhrases] TTS request failed:", response.status);
        return; // Continue without voice
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = Math.min(voiceVolume, 0.9);
      
      // Register with audio manager for proper coordination
      registerVoiceAudio(audio);
      
      await audio.play();
      
      // Cleanup
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      // Silently continue - voice is optional
      console.info("[ToothyPhrases] Voice unavailable, continuing silently:", error);
    }
  }, [getTextForPhrase, i18n.language]);

  /**
   * Speak "Yay! You made me sparkle!" with sparkle sound
   */
  const saySparkle = useCallback(() => {
    playSparkleChime();
    speakPhrase(getPhrase("sparkle"));
  }, [playSparkleChime, speakPhrase]);

  /**
   * Speak "Let's brush together!" with brush start sound
   */
  const sayBrushTogether = useCallback(() => {
    playBrushStart();
    speakPhrase(getPhrase("brushTogether"));
  }, [playBrushStart, speakPhrase]);

  /**
   * Speak "All clean! Woohoo!" with celebration sound
   */
  const sayAllClean = useCallback(() => {
    playWoohoo();
    speakPhrase(getPhrase("allClean"));
  }, [playWoohoo, speakPhrase]);

  /**
   * Speak "Tap my teeth to shine!" with ding sound
   */
  const sayTapTeeth = useCallback(() => {
    playDing();
    speakPhrase(getPhrase("tapTeeth"));
  }, [playDing, speakPhrase]);

  /**
   * Speak "Look at my shiny smile!" with sparkle sound
   */
  const sayShinySmile = useCallback(() => {
    playSparkleChime();
    speakPhrase(getPhrase("shinySmile"));
  }, [playSparkleChime, speakPhrase]);

  /**
   * Speak "Hooray! We did it!" with big celebration
   */
  const sayHooray = useCallback(() => {
    playWoohoo();
    speakPhrase(getPhrase("hooray"));
  }, [playWoohoo, speakPhrase]);

  /**
   * Play ding sound for tooth tap (no voice - just quick feedback)
   */
  const playToothTapDing = useCallback(() => {
    playToothTapShine();
  }, [playToothTapShine]);

  /**
   * Speak a random encouragement phrase
   */
  const sayEncouragement = useCallback(() => {
    playDing();
    speakPhrase(getRandomPhrase("encouragement"));
  }, [playDing, speakPhrase]);

  /**
   * Speak a random celebration phrase
   */
  const sayCelebration = useCallback(() => {
    playWoohoo();
    speakPhrase(getRandomPhrase("celebration"));
  }, [playWoohoo, speakPhrase]);

  /**
   * Speak a welcome greeting - uses the provided greeting text with cheerful voice
   * Supports both English and Spanish based on current language
   */
  const sayWelcome = useCallback((greetingText: string) => {
    playSparkleChime();
    speakPhrase({
      text: greetingText,
      textEs: greetingText, // If custom text is passed, use it for both
      emoji: "✨",
      category: "greeting",
      mood: "encouraging",
    });
  }, [playSparkleChime, speakPhrase]);

  /**
   * Speak a random greeting phrase
   */
  const sayGreeting = useCallback(() => {
    playSparkleChime();
    speakPhrase(getRandomPhrase("greeting"));
  }, [playSparkleChime, speakPhrase]);

  return {
    // Specific phrases
    saySparkle,
    sayBrushTogether,
    sayAllClean,
    sayTapTeeth,
    sayShinySmile,
    sayHooray,
    // Quick sounds (no voice)
    playToothTapDing,
    // Random category phrases
    sayEncouragement,
    sayCelebration,
    sayGreeting,
    // Welcome greeting
    sayWelcome,
    // Generic speak function
    speakPhrase,
    // Utility
    getTextForPhrase,
  };
};

export default useToothyPhrases;
