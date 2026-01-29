import { useState, useEffect, useMemo } from "react";

export interface DailyGreeting {
  message: string;
  emoji: string;
}

const GREETINGS: DailyGreeting[] = [
  { message: "I need help brushing today! Let's make me sparkle ✨", emoji: "✨" },
  { message: "Help me brush today so I can get shiny ✨", emoji: "🦷" },
  { message: "Uh oh! Sugar bugs are coming! Can you save my smile?", emoji: "😬" },
  { message: "My teeth need your super powers today! 💪", emoji: "💪" },
  { message: "Will you help me become sparkly today? 🌟", emoji: "🌟" },
];

const COMPLETION_MESSAGE: DailyGreeting = {
  message: "Yay! I'm so shiny now! 🎉 Come back tomorrow!",
  emoji: "🎉",
};

// Use date-based seed for consistent greeting per day
const getDailyGreetingIndex = (): number => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % GREETINGS.length;
};

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

export const useDailyGreeting = () => {
  const [isCompleted, setIsCompleted] = useState(() => getCompletionFromCache());

  // Get today's greeting (deterministic based on day)
  const greeting = useMemo<DailyGreeting>(() => {
    if (isCompleted) {
      return COMPLETION_MESSAGE;
    }
    return GREETINGS[getDailyGreetingIndex()];
  }, [isCompleted]);

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
    allGreetings: GREETINGS,
  };
};

export default useDailyGreeting;
