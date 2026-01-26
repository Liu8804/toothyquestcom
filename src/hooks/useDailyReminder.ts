import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { usePushNotifications } from "./usePushNotifications";

interface DailyReminderSettings {
  enabled: boolean;
  reminderTime: string; // HH:mm format
  loading: boolean;
}

// Local storage for offline support
const REMINDER_CACHE_KEY = "toothyquest_daily_reminder";

const getISODateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const useDailyReminder = () => {
  const { user } = useAuth();
  const { showNotification, isSupported, isSubscribed } = usePushNotifications();
  
  const [settings, setSettings] = useState<DailyReminderSettings>({
    enabled: true,
    reminderTime: "19:00",
    loading: true,
  });

  // Load reminder settings from database
  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("daily_task_reminder, daily_task_reminder_time, last_reminder_sent_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading reminder settings:", error);
        // Try loading from cache
        const cached = localStorage.getItem(`${REMINDER_CACHE_KEY}_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings({
            enabled: parsed.enabled,
            reminderTime: parsed.reminderTime,
            loading: false,
          });
        } else {
          setSettings(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      const reminderSettings = {
        enabled: data?.daily_task_reminder ?? true,
        reminderTime: data?.daily_task_reminder_time?.slice(0, 5) || "19:00",
        loading: false,
      };

      setSettings(reminderSettings);

      // Cache settings
      localStorage.setItem(
        `${REMINDER_CACHE_KEY}_${user.id}`,
        JSON.stringify({
          enabled: reminderSettings.enabled,
          reminderTime: reminderSettings.reminderTime,
        })
      );
    } catch (err) {
      console.error("Reminder settings fetch error:", err);
      setSettings(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Update reminder settings
  const updateSettings = useCallback(
    async (newSettings: Partial<Pick<DailyReminderSettings, "enabled" | "reminderTime">>) => {
      if (!user) return;

      const updated = {
        enabled: newSettings.enabled ?? settings.enabled,
        reminderTime: newSettings.reminderTime ?? settings.reminderTime,
      };

      // Optimistic update
      setSettings(prev => ({ ...prev, ...updated }));

      try {
        const { error } = await supabase
          .from("notification_preferences")
          .upsert({
            user_id: user.id,
            daily_task_reminder: updated.enabled,
            daily_task_reminder_time: updated.reminderTime + ":00",
          });

        if (error) {
          console.error("Error updating reminder settings:", error);
        } else {
          // Update cache
          localStorage.setItem(
            `${REMINDER_CACHE_KEY}_${user.id}`,
            JSON.stringify(updated)
          );
        }
      } catch (err) {
        console.error("Failed to update reminder settings:", err);
      }
    },
    [user, settings]
  );

  // Check if a reminder should be sent (called from Index or a scheduled check)
  const checkAndSendReminder = useCallback(
    async (taskCompleted: boolean, childName?: string) => {
      if (!user || !settings.enabled || taskCompleted || !isSupported || !isSubscribed) {
        return { sent: false, reason: "conditions not met" };
      }

      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      
      // Check if current time is around reminder time (within 5 minute window)
      const [reminderHour, reminderMin] = settings.reminderTime.split(":").map(Number);
      const reminderMinutes = reminderHour * 60 + reminderMin;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (Math.abs(currentMinutes - reminderMinutes) > 5) {
        return { sent: false, reason: "not reminder time yet" };
      }

      // Check if we already sent a reminder today
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("last_reminder_sent_at")
        .eq("user_id", user.id)
        .maybeSingle();

      const lastSent = prefs?.last_reminder_sent_at;
      if (lastSent) {
        const lastSentDate = new Date(lastSent).toISOString().split("T")[0];
        if (lastSentDate === getISODateString()) {
          return { sent: false, reason: "already sent today" };
        }
      }

      // Send the notification
      await showNotification("🦷 Time to Brush!", {
        body: childName
          ? `Hey ${childName}! Don't forget your daily brushing quest!`
          : "Don't forget your daily brushing quest!",
        tag: "daily-task-reminder",
        icon: "/app-icon.png",
      });

      // Update last sent timestamp
      await supabase
        .from("notification_preferences")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("user_id", user.id);

      console.log("Daily reminder sent");
      return { sent: true };
    },
    [user, settings, isSupported, isSubscribed, showNotification]
  );

  // Schedule reminder check (runs periodically when app is open)
  const scheduleReminderCheck = useCallback(
    (taskCompleted: boolean, childName?: string) => {
      // Check every minute if conditions match
      const checkInterval = setInterval(() => {
        checkAndSendReminder(taskCompleted, childName);
      }, 60000); // Check every minute

      // Initial check
      checkAndSendReminder(taskCompleted, childName);

      return () => clearInterval(checkInterval);
    },
    [checkAndSendReminder]
  );

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    ...settings,
    updateSettings,
    checkAndSendReminder,
    scheduleReminderCheck,
    refetch: loadSettings,
  };
};

export default useDailyReminder;
