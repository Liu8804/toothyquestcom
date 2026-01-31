import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TOOTHY_PHRASES, getLocalizedText } from "@/config/toothyPhrases";

export interface DailyGreeting {
  message: string;
  emoji: string;
}

// Local storage key for today's completion
const DAILY_COMPLETION_KEY = "toothyquest_daily_quest_completed";

interface CompletionCache {
  date: string;
  completed: boolean;
}

const getISODateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const getCompletionFromCache = (): boolean => {
  try {
    const cached = localStorage.getItem(DAILY_COMPLETION_KEY);
    if (!cached) return false;
    const data: CompletionCache = JSON.parse(cached);
    return data.date === getISODateString() && data.completed;
  } catch {
    return false;
  }
};

const setCompletionToCache = (completed: boolean): void => {
  try {
    const data: CompletionCache = {
      date: getISODateString(),
      completed,
    };
    localStorage.setItem(DAILY_COMPLETION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache completion:", e);
  }
};

// Use date-based seed for consistent greeting per day
const getDailyGreetingIndex = (count: number): number => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % count;
};

// Get greeting phrases from Toothy phrases config
const getGreetingPhrases = () => [
  TOOTHY_PHRASES.brushTogether,
  TOOTHY_PHRASES.sparkle,
  TOOTHY_PHRASES.tapTeeth,
  TOOTHY_PHRASES.shinySmile,
  TOOTHY_PHRASES.keepGoing,
  TOOTHY_PHRASES.helloFriend,
  TOOTHY_PHRASES.welcomeBack,
  TOOTHY_PHRASES.letsHaveFun,
];

export const useDailyGreeting = () => {
  const { i18n } = useTranslation();
  const [isCompleted, setIsCompleted] = useState(() => getCompletionFromCache());

  const greetingPhrases = getGreetingPhrases();

  // Get today's greeting (deterministic based on day)
  const greeting = useMemo<DailyGreeting>(() => {
    const lang = i18n.language;
    
    if (isCompleted) {
      return {
        message: getLocalizedText(TOOTHY_PHRASES.allClean, lang),
        emoji: TOOTHY_PHRASES.allClean.emoji,
      };
    }
    
    const todaysPhrase = greetingPhrases[getDailyGreetingIndex(greetingPhrases.length)];
    return {
      message: getLocalizedText(todaysPhrase, lang),
      emoji: todaysPhrase.emoji,
    };
  }, [isCompleted, i18n.language, greetingPhrases]);

  // Get all greetings in current language
  const allGreetings = useMemo<DailyGreeting[]>(() => {
    const lang = i18n.language;
    return greetingPhrases.map((phrase) => ({
      message: getLocalizedText(phrase, lang),
      emoji: phrase.emoji,
    }));
  }, [i18n.language, greetingPhrases]);

  // Mark today's quest as complete
  const markComplete = () => {
    setIsCompleted(true);
    setCompletionToCache(true);
  };

  // Check cache on mount (in case it changed in another tab)
  useEffect(() => {
    const cached = getCompletionFromCache();
    if (cached !== isCompleted) {
      setIsCompleted(cached);
    }
  }, [isCompleted]);

  return {
    greeting,
    isCompleted,
    markComplete,
    allGreetings,
  };
};

export default useDailyGreeting;
