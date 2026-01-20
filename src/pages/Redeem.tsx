import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Sparkles, Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ConfettiCelebration from "@/components/ConfettiCelebration";

const Redeem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    if (!user) {
      toast.error("Please sign in to redeem a code");
      return;
    }

    setIsRedeeming(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("redeem-code", {
        body: { code: code.trim() },
      });

      if (fnError) {
        setError("Failed to redeem code. Please try again.");
        return;
      }

      if (data?.success) {
        if (data.already_unlocked) {
          toast.info("You already have full access!");
        } else {
          setRedeemed(true);
          setShowConfetti(true);
          toast.success(data.message || "Code redeemed successfully!");
        }
      } else {
        setError(data?.message || "Invalid code");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      {showConfetti && <ConfettiCelebration isActive={showConfetti} />}
      
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary via-bubble to-star p-8 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + i * 20}%`,
                    top: `${20 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                  }}
                >
                  {["🎁", "✨", "🦷", "⭐", "🎉"][i]}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Redeem Promo Code
            </h1>
            <p className="text-white/90">
              Enter your code to unlock premium features!
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {redeemed ? (
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-mint/20">
                  <Check className="w-10 h-10 text-mint" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Success! 🎉
                </h2>
                <p className="text-muted-foreground mb-6">
                  You now have full access to all ToothyQuest features!
                </p>
                <Button onClick={() => navigate("/")} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Exploring
                </Button>
              </motion.div>
            ) : (
              <>
                {!user && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      Please sign in first to redeem a code
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="promoCode" className="text-sm font-medium text-foreground">
                    Promo Code
                  </label>
                  <Input
                    id="promoCode"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="TQ-XXXX-XXXX-XXXX"
                    className="text-center text-lg font-mono tracking-wider h-14"
                    disabled={isRedeeming}
                  />
                  {error && (
                    <motion.div
                      className="flex items-center gap-2 text-destructive text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}
                </div>

                <Button
                  onClick={handleRedeem}
                  disabled={isRedeeming || !user || !code.trim()}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-bubble to-star hover:opacity-90 text-white"
                >
                  {isRedeeming ? (
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redeeming...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Redeem Code
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Promo codes are case-insensitive. Contact support if you have issues.
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Redeem;
