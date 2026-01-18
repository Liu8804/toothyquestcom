import { useCallback, useRef } from "react";
import { getVoiceSettings } from "@/components/VoiceSettingsModal";

/**
 * A lightweight voice hook for quest narration throughout the app.
 * Uses browser speech synthesis for reliability (ElevenLabs often blocked on free tier).
 */
export const useQuestVoice = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    isSpeakingRef.current = false;
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!(typeof window !== "undefined" && "speechSynthesis" in window)) {
      console.warn("Speech synthesis not available");
      onEnd?.();
      return;
    }

    // Stop any current speech
    stop();

    const voiceSettings = getVoiceSettings();
    
    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = 1;
      
      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.localService) 
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
      };
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        onEnd?.();
      };
      
      utterance.onerror = (event) => {
        console.error("Quest voice error:", event.error);
        isSpeakingRef.current = false;
        if (event.error !== "interrupted" && event.error !== "canceled") {
          onEnd?.();
        }
      };

      utteranceRef.current = utterance;
      isSpeakingRef.current = true;
      window.speechSynthesis.speak(utterance);
    };

    // Wait for voices to load if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speakNow();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      // Fallback timeout
      setTimeout(() => {
        if (!isSpeakingRef.current) {
          window.speechSynthesis.onvoiceschanged = null;
          speakNow();
        }
      }, 150);
    } else {
      speakNow();
    }
  }, [stop]);

  const speakIntro = useCallback((intro: string) => {
    speak(intro);
  }, [speak]);

  const speakQuestComplete = useCallback((questTitle: string, xpEarned: number) => {
    const message = `Quest Complete! ${questTitle}. You earned ${xpEarned} experience points. Great job!`;
    speak(message);
  }, [speak]);

  const speakBadgeEarned = useCallback((badgeName: string) => {
    const message = `Congratulations! You earned a new badge: ${badgeName}!`;
    speak(message);
  }, [speak]);

  const speakEnding = useCallback((ending: string) => {
    speak(ending);
  }, [speak]);

  return {
    speak,
    speakIntro,
    speakQuestComplete,
    speakBadgeEarned,
    speakEnding,
    stop,
  };
};

export default useQuestVoice;
