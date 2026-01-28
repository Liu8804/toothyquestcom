import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTesterMode } from "@/hooks/useTesterMode";

/**
 * In-app notification shown on day 6 of the trial
 */
export const TesterDay6Reminder = () => {
  const { isTester, isActive, daysRemaining } = useTesterMode();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show reminder on day 6 (1 day remaining)
    if (isTester && isActive && daysRemaining === 1 && !isDismissed) {
      const hasSeenReminder = localStorage.getItem("tester_day6_reminder_seen");
      if (!hasSeenReminder) {
        setIsVisible(true);
      }
    }
  }, [isTester, isActive, daysRemaining, isDismissed]);

  const handleDismiss = () => {
    localStorage.setItem("tester_day6_reminder_seen", "true");
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 shadow-lg border border-amber-400/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">
                  Your 7-day test is almost over! ⏰
                </h4>
                <p className="text-xs text-white/90 mt-1">
                  Make sure your child completes today's quest before the trial ends tomorrow!
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={handleDismiss}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Got it!
                </Button>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10 shrink-0"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
