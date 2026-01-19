import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useStreakReminders = () => {
  const { user } = useAuth();

  const sendStreakReminder = useCallback(async (
    email: string,
    childName: string,
    currentStreak: number,
    reminderType: "streak_at_risk" | "streak_broken" | "encouragement"
  ) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const response = await supabase.functions.invoke("send-streak-reminder", {
        body: {
          email,
          child_name: childName,
          current_streak: currentStreak,
          reminder_type: reminderType,
        },
      });

      if (response.error) throw response.error;

      console.log("Streak reminder sent:", response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error sending streak reminder:", error);
      return { success: false, error: error.message };
    }
  }, [user]);

  const updateStreak = useCallback(async (
    currentStreak: number,
    lastActivityDate: Date | null
  ) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Upsert user streak data - cast to any to handle new table not in types yet
      const { error } = await (supabase
        .from("user_streaks" as any)
        .upsert({
          user_id: user.id,
          current_streak: currentStreak,
          last_activity_date: today,
          longest_streak: currentStreak, // Update if higher
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        }) as any);

      if (error) console.error("Error updating streak:", error);
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  }, [user]);

  return {
    sendStreakReminder,
    updateStreak,
  };
};

export default useStreakReminders;
