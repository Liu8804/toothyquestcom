import { useCallback } from "react";
import { buildFunctionsHeaders } from "@/lib/functionsAuth";
import { TOOTHY_PHRASES, getPhrase, getRandomPhrase, PhraseCategory, ToothyPhrase } from "@/config/toothyPhrases";
import { getVoiceForMood, VoiceMood } from "@/config/voiceConfig";
import { useMascotSounds } from "./useMascotSounds";
import { getEffectiveVolume } from "@/components/VolumeControlPanel";
import { unlockAudioContext } from "./useAudioManager";

/**
 * Hook for speaking Toothy's playful phrases with matching sounds
 * 
 * Combines AI voice + sparkle/ding sounds for immersive kid experience
 */
export const useToothyPhrases = () => {
  const { 
    playSparkleChime, 
    playDing, 
    playWoohoo, 
    playToothTapShine,
    playBrushStart,
    playBrushComplete,
  } = useMascotSounds();

  /**
   * Speak a phrase with AI voice
   */
  const speakPhrase = useCallback(async (phrase: ToothyPhrase) => {
    const voiceVolume = getEffectiveVolume("voice");
    if (voiceVolume === 0) return;

    unlockAudioContext();

    // Map phrase mood to voice mood (celebration is an extended mood)
    const voiceMood = phrase.mood === "excited" ? "excited" : phrase.mood as VoiceMood;
    const voiceSettings = getVoiceForMood(voiceMood);

    try {
      const headers = await buildFunctionsHeaders();
      
      console.log("[ToothyPhrases] Speaking:", phrase.text, "with mood:", phrase.mood);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            text: phrase.text,
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
        console.warn("[ToothyPhrases] TTS request failed:", response.status);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = Math.min(voiceVolume, 0.9);
      
      await audio.play();
      
      // Cleanup
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.warn("[ToothyPhrases] Error speaking phrase:", error);
    }
  }, []);

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
   */
  const sayWelcome = useCallback((greetingText: string) => {
    playSparkleChime();
    speakPhrase({
      text: greetingText,
      emoji: "✨",
      category: "greeting" as any,
      mood: "encouraging",
    });
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
    // Welcome greeting
    sayWelcome,
    // Generic speak function
    speakPhrase,
  };
};

export default useToothyPhrases;
