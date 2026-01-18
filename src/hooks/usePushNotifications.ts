import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface NotificationPreferences {
  morning_reminder: boolean;
  evening_reminder: boolean;
  streak_alerts: boolean;
  morning_time: string;
  evening_time: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  morning_reminder: true,
  evening_reminder: true,
  streak_alerts: true,
  morning_time: "07:30",
  evening_time: "19:30",
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);
  }, []);

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPreferences({
        morning_reminder: data.morning_reminder,
        evening_reminder: data.evening_reminder,
        streak_alerts: data.streak_alerts,
        morning_time: data.morning_time?.slice(0, 5) || "07:30",
        evening_time: data.evening_time?.slice(0, 5) || "19:30",
      });
    }
  }, [user]);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    if (!user || !isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  }, [user, isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;

      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID keys placeholder - in production, use real VAPID keys
      const applicationServerKey = urlBase64ToUint8Array(
        "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
      );

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const subscriptionData = subscription.toJSON();
      
      // Save to database
      await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint || "",
        p256dh: subscriptionData.keys?.p256dh || "",
        auth: subscriptionData.keys?.auth || "",
      });

      // Create default preferences if not exists
      await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...DEFAULT_PREFERENCES,
          morning_time: DEFAULT_PREFERENCES.morning_time + ":00",
          evening_time: DEFAULT_PREFERENCES.evening_time + ":00",
        });

      setIsSubscribed(true);
      await loadPreferences();
      return true;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  }, [user, isSupported, requestPermission, loadPreferences]);

  // Unsubscribe
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  }, [user, isSupported]);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPrefs: Partial<NotificationPreferences>) => {
      if (!user) return;

      const updated = { ...preferences, ...newPrefs };
      
      await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          morning_reminder: updated.morning_reminder,
          evening_reminder: updated.evening_reminder,
          streak_alerts: updated.streak_alerts,
          morning_time: updated.morning_time + ":00",
          evening_time: updated.evening_time + ":00",
        });

      setPreferences(updated);
    },
    [user, preferences]
  );

  // Show local notification (for testing/immediate notifications)
  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/app-icon.png",
        badge: "/app-icon.png",
        ...options,
      });
    },
    [isSupported]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([checkSubscription(), loadPreferences()]);
      setLoading(false);
    };
    init();
  }, [checkSubscription, loadPreferences]);

  return {
    isSupported,
    isSubscribed,
    preferences,
    loading,
    subscribe,
    unsubscribe,
    updatePreferences,
    showNotification,
    requestPermission,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}
