import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EncouragementResult {
  message: string;
  isAIGenerated: boolean;
}

const fallbackMessages = [
  "Amazing job! Your teeth are sparkling like stars! ⭐",
  "Wow, what a Super Brusher! Keep up the fantastic work! 🦷",
  "You're a true Tooth Hero! Your smile is so bright! ✨",
  "Incredible brushing! The sugar bugs don't stand a chance! 🌟",
  "Fantastic! You brushed like a champion! 🏆",
];

export const useAIEncouragement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getEncouragement = useCallback(async (
    childName?: string,
    sessionType?: string,
    durationSeconds?: number
  ): Promise<EncouragementResult> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-encouragement", {
        body: { childName, sessionType, durationSeconds },
      });

      if (error) {
        console.error("Error getting AI encouragement:", error);
        throw error;
      }

      if (data?.message) {
        return { message: data.message, isAIGenerated: true };
      }

      // Use fallback if AI message not available
      if (data?.fallbackMessage) {
        return { message: data.fallbackMessage, isAIGenerated: false };
      }

      throw new Error("No message received");
    } catch (error) {
      console.error("AI encouragement error:", error);
      // Return a random fallback message
      const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      const personalizedFallback = childName 
        ? randomFallback.replace("Super Brusher", childName).replace("Tooth Hero", childName)
        : randomFallback;
      return { message: personalizedFallback, isAIGenerated: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getEncouragement, isLoading };
};

export default useAIEncouragement;
