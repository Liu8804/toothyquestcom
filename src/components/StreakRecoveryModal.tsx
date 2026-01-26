import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle, Flame, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStreakRecovery } from "@/hooks/useStreakRecovery";
import MascotWithExpression from "@/components/MascotWithExpression";
import ConfettiCelebration from "@/components/ConfettiCelebration";

interface StreakRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecovered: (newStreak: number) => void;
  currentStreak: number;
  previousStreak: number;
  childName?: string;
}

const StreakRecoveryModal = ({
  isOpen,
  onClose,
  onRecovered,
  currentStreak,
  previousStreak,
  childName,
}: StreakRecoveryModalProps) => {
  const { canRecover, loading, recoverStreak } = useStreakRecovery();
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecover = useCallback(async () => {
    if (!parentConfirmed) {
      setError("Please confirm you are a parent/guardian");
      return;
    }

    setIsRecovering(true);
    setError(null);

    const result = await recoverStreak(currentStreak, previousStreak, parentConfirmed);

    setIsRecovering(false);

    if (result.success) {
      setRecovered(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      onRecovered(result.newStreak);
    } else {
      setError(result.error || "Failed to recover streak");
    }
  }, [parentConfirmed, currentStreak, previousStreak, recoverStreak, onRecovered]);

  if (!isOpen) return null;

  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 rounded-3xl shadow-float p-6 text-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-white hover:bg-background/30 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {loading ? (
              <div className="py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-12 h-12 text-white mx-auto" />
                </motion.div>
                <p className="text-white mt-4">Checking recovery options...</p>
              </div>
            ) : recovered ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-4"
                >
                  <MascotWithExpression expression="celebrating" size="lg" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <CheckCircle className="w-16 h-16 text-mint mx-auto" />
                </motion.div>

                <h2 className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  Streak Recovered! 🎉
                </h2>

                <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Flame className="w-6 h-6 text-orange-200" />
                    <span className="font-bold text-2xl">{previousStreak} day streak restored!</span>
                  </div>
                </div>

                <p className="text-white/90 mb-4">
                  Complete today's task to keep it going! 💪
                </p>

                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                >
                  Let's Brush!
                </Button>
              </>
            ) : !canRecover ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mb-4"
                >
                  <MascotWithExpression expression="winking" size="lg" />
                </motion.div>

                <AlertTriangle className="w-12 h-12 text-white/80 mx-auto mb-4" />

                <h2 className="font-display text-xl font-bold text-white mb-2">
                  Recovery Used This Week
                </h2>

                <p className="text-white/90 mb-4">
                  You can only use streak recovery once per week. Start a fresh streak today!
                </p>

                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-white/90 rounded-full font-display font-bold shadow-card px-8"
                >
                  Start Fresh
                </Button>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4"
                >
                  <MascotWithExpression expression="excited" size="lg" />
                </motion.div>

                <h2 className="font-display text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  Oops! Streak at Risk! 😰
                </h2>

                <p className="text-white/90 mb-4">
                  {childName || "Someone"} missed yesterday's brushing quest...
                </p>

                <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between text-white mb-2">
                    <span>Lost streak:</span>
                    <span className="font-bold text-orange-200 line-through">
                      {previousStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span>Recover to:</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-200" />
                      <span className="font-bold text-green-200">{previousStreak} days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="parent-confirm"
                      checked={parentConfirmed}
                      onCheckedChange={(checked) => setParentConfirmed(checked === true)}
                      className="mt-1 border-white data-[state=checked]:bg-white data-[state=checked]:text-orange-600"
                    />
                    <label
                      htmlFor="parent-confirm"
                      className="text-sm text-white/90 text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 inline mr-1" />
                      I am a parent/guardian and approve this one-time streak recovery (once per week)
                    </label>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-200 text-sm mb-4 bg-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 rounded-full border-white/50 text-white hover:bg-white/10"
                  >
                    Start Fresh
                  </Button>
                  <Button
                    onClick={handleRecover}
                    disabled={!parentConfirmed || isRecovering}
                    size="lg"
                    className="flex-1 bg-white text-orange-600 hover:bg-white/90 rounded-full font-display font-bold shadow-card disabled:opacity-50"
                  >
                    {isRecovering ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Recover Streak
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-white/60 text-xs mt-4">
                  Recovery available once per week
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default StreakRecoveryModal;
