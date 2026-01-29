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

const pickEnglishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  return (
    voices.find((v) => v.lang?.startsWith("en") && v.localService) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    voices[0]
  );
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
