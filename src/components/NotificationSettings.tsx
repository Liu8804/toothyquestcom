import { motion } from "framer-motion";
import { Bell, BellOff, Clock, Sun, Moon, Flame, X, Check, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useDailyReminder } from "@/hooks/useDailyReminder";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings = ({ isOpen, onClose }: NotificationSettingsProps) => {
  const {
    isSupported,
    isSubscribed,
    preferences,
    loading,
    subscribe,
    unsubscribe,
    updatePreferences,
    showNotification,
  } = usePushNotifications();

  const {
    enabled: dailyReminderEnabled,
    reminderTime: dailyReminderTime,
    loading: dailyReminderLoading,
    updateSettings: updateDailyReminder,
  } = useDailyReminder();

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      toast.success("Notifications enabled! You'll receive brushing reminders.");
    } else {
      toast.error("Failed to enable notifications. Please check your browser permissions.");
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success("Notifications disabled.");
    }
  };

  const handleTestNotification = () => {
    showNotification("🦷 Time to Brush!", {
      body: "Your teeth are waiting for their sparkle session!",
      tag: "test-notification",
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Get reminders to keep those smiles sparkling!
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {!isSupported ? (
          <Card className="rounded-3xl">
            <CardContent className="p-8 text-center">
              <BellOff className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-bold text-lg mb-2">Notifications Not Supported</h3>
              <p className="text-muted-foreground">
                Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge
                for the best experience.
              </p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        ) : !isSubscribed ? (
          <Card className="rounded-3xl">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Bell className="w-20 h-20 mx-auto text-primary mb-6" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold mb-4">
                Never Miss a Brushing Session!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get friendly reminders for morning and evening brushing, plus alerts when your
                streak is at risk!
              </p>
              <ul className="text-left max-w-sm mx-auto space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Morning brushing reminders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Evening brushing reminders
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Streak protection alerts
                </li>
              </ul>
              <Button onClick={handleSubscribe} size="lg" className="rounded-full gap-2">
                <Bell className="w-5 h-5" />
                Enable Notifications
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Notifications Active</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive brushing reminders
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestNotification}
                      className="rounded-full"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnsubscribe}
                      className="rounded-full text-destructive hover:text-destructive"
                    >
                      Disable
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reminder Settings */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Reminder Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Morning Reminder */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Sun className="w-6 h-6 text-star" />
                    <div>
                      <p className="font-medium">Morning Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        Start the day with a fresh smile
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={preferences.morning_time}
                      onChange={(e) => updatePreferences({ morning_time: e.target.value })}
                      className="w-32 rounded-xl"
                      disabled={!preferences.morning_reminder}
                    />
                    <Switch
                      checked={preferences.morning_reminder}
                      onCheckedChange={(checked) =>
                        updatePreferences({ morning_reminder: checked })
                      }
                    />
                  </div>
                </div>

                {/* Evening Reminder */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Moon className="w-6 h-6 text-secondary" />
                    <div>
                      <p className="font-medium">Evening Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        Don't forget before bedtime
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={preferences.evening_time}
                      onChange={(e) => updatePreferences({ evening_time: e.target.value })}
                      className="w-32 rounded-xl"
                      disabled={!preferences.evening_reminder}
                    />
                    <Switch
                      checked={preferences.evening_reminder}
                      onCheckedChange={(checked) =>
                        updatePreferences({ evening_reminder: checked })
                      }
                    />
                  </div>
                </div>

                {/* Daily Task Reminder */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">Daily Brushing Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        Get reminded if daily task isn't done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={dailyReminderTime}
                      onChange={(e) => updateDailyReminder({ reminderTime: e.target.value })}
                      className="w-32 rounded-xl"
                      disabled={!dailyReminderEnabled || dailyReminderLoading}
                    />
                    <Switch
                      checked={dailyReminderEnabled}
                      onCheckedChange={(checked) =>
                        updateDailyReminder({ enabled: checked })
                      }
                      disabled={dailyReminderLoading}
                    />
                  </div>
                </div>

                {/* Streak Alerts */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-medium">Streak Protection</p>
                      <p className="text-sm text-muted-foreground">
                        Get alerted when your streak is at risk
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.streak_alerts}
                    onCheckedChange={(checked) => updatePreferences({ streak_alerts: checked })}
                  />
                </div>

                {/* Email Reminders */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">Email Streak Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get emails when your streak is at risk
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={(preferences as any).email_reminders || false}
                    onCheckedChange={(checked) => updatePreferences({ email_reminders: checked } as any)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
