import { toast } from "sonner";

export interface SpeakBrowserTtsOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: () => void;
}

export const canUseBrowserTts = (): boolean => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

export const cancelBrowserTts = (): void => {
  if (!canUseBrowserTts()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
};

/**
 * Pick a FEMALE English voice to match Toothy's character.
 * Prioritizes voices with female-associated names to ensure consistency.
 */
const pickEnglishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  // Female voice name patterns (common across platforms)
  const femaleNames = ["samantha", "karen", "victoria", "tessa", "moira", "fiona", "kate", "susan", "zira", "hazel", "libby", "google us english", "female"];
  
  // First priority: female English voices
  const femaleEnglish = voices.find((v) => {
    const name = v.name.toLowerCase();
    const isEnglish = v.lang?.startsWith("en");
    const isFemale = femaleNames.some(fn => name.includes(fn));
    return isEnglish && isFemale;
  });
  if (femaleEnglish) return femaleEnglish;
  
  // Second: any local English voice (often defaults to female on iOS/Mac)
  const localEnglish = voices.find((v) => v.lang?.startsWith("en") && v.localService);
  if (localEnglish) return localEnglish;
  
  // Third: any English voice
  const anyEnglish = voices.find((v) => v.lang?.startsWith("en"));
  if (anyEnglish) return anyEnglish;
  
  // Fallback to first available
  return voices[0];
};

/**
 * Best-effort browser TTS.
 * Note: Voice loading can be async on some platforms; we try immediate speak first,
 * then retry once when voices become available.
 */
export const speakBrowserTts = (options: SpeakBrowserTtsOptions): void => {
  if (!canUseBrowserTts()) {
    toast.error("Voice playback isn't available on this device.");
    options.onError?.();
    return;
  }

  const { text, rate = 1, pitch = 1, volume = 1, lang = "en-US" } = options;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = Math.max(0, Math.min(1, volume));
  utterance.lang = lang;

  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();

  const speakNow = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      const voice = pickEnglishVoice(voices);
      if (voice) utterance.voice = voice;
      cancelBrowserTts();
      window.speechSynthesis.speak(utterance);
    } catch {
      options.onError?.();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // Some browsers populate voices asynchronously.
    const prev = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = prev ?? null;
      speakNow();
    };
    // Fallback attempt in case onvoiceschanged doesn't fire.
    setTimeout(speakNow, 150);
    return;
  }

  speakNow();
};
