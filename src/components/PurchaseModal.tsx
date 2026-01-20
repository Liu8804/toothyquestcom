import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock, Unlock, RefreshCw, Crown, Star, Check, Zap, Gift, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePurchase, purchaseMessages, PRICING, PlanType } from "@/hooks/usePurchase";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PaymentLoadingOverlay from "./PaymentLoadingOverlay";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseModal = ({ isOpen, onClose }: PurchaseModalProps) => {
  const { purchase, restorePurchase, isLoading, isRestoring, isPurchased, refetchPurchase } = usePurchase();
  const { playWinFanfare, playAchievementUnlock } = useGameSounds();
  const { user, session } = useAuth();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) return;
    if (!user || !session?.access_token) {
      toast.error("Please sign in to redeem a code");
      return;
    }

    setIsRedeemingCode(true);
    setPromoError("");

    try {
      const { data, error } = await supabase.functions.invoke("redeem-code", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { code: promoCode.trim() },
      });

      if (error) {
        setPromoError("Failed to redeem code");
        return;
      }

      if (data?.success) {
        if (data.already_unlocked) {
          toast.info("You already have full access!");
        } else {
          playAchievementUnlock();
          toast.success(data.message || "Code redeemed!");
          refetchPurchase();
          setTimeout(onClose, 1500);
        }
        setPromoCode("");
      } else {
        setPromoError(data?.message || "Invalid code");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      setPromoError("Something went wrong");
    } finally {
      setIsRedeemingCode(false);
    }
  };

  const handlePurchase = async () => {
    const success = await purchase(() => {
      setShowLoadingOverlay(true);
    }, selectedPlan);
    if (success) {
      playWinFanfare();
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchase();
    if (success) {
      playAchievementUnlock();
      setTimeout(onClose, 2000);
    }
  };

  const features = [
    { emoji: "🎮", text: "50+ interactive quests & mini-games" },
    { emoji: "🏆", text: "Points, badges, streaks & Tooth Pets" },
    { emoji: "✨", text: "Fun animations & celebrations" },
    { emoji: "📈", text: "Motivation for healthy habits" },
    { emoji: "💡", text: "Safe & educational for ages 4-10" },
  ];

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg bg-gradient-to-b from-card to-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-primary via-bubble to-star p-6 text-center">
              {/* Floating decorations */}
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
                    {["⭐", "🦷", "✨", "🌟", "👑"][i]}
                  </motion.div>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Crown icon */}
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Turn Dental Care into a Fun Adventure! ✨
              </h2>
              <p className="text-white/90 text-sm">
                Join thousands of kids exploring 50+ quests, games, and rewards!
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Already purchased state */}
              {isPurchased ? (
                <motion.div
                  className="text-center py-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-mint/20">
                    <Check className="w-8 h-8 text-mint" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    You're All Set!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {purchaseMessages.purchaseSuccess}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Plan Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Monthly Plan */}
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === "monthly"
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Monthly</p>
                        <p className="text-2xl font-bold text-foreground">{PRICING.monthly.label}</p>
                        <p className="text-xs text-muted-foreground">one-time</p>
                      </div>
                      {selectedPlan === "monthly" && (
                        <motion.div
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </button>

                    {/* Annual Plan */}
                    <button
                      onClick={() => setSelectedPlan("annual")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === "annual"
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {/* Best Value Badge */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                          SAVE {PRICING.annual.savings}!
                        </span>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Annual</p>
                        <p className="text-2xl font-bold text-foreground">{PRICING.annual.label}</p>
                        <p className="text-xs text-muted-foreground">one-time</p>
                      </div>
                      {selectedPlan === "annual" && (
                        <motion.div
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </button>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">What your child gets:</p>
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-xl">{feature.emoji}</span>
                        <span className="text-foreground text-sm">{feature.text}</span>
                        <Star className="w-3 h-3 text-star ml-auto" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Purchase button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isLoading || isRestoring}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-bubble to-star hover:opacity-90 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-5 h-5" />
                        Opening Checkout...
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Unlock className="w-5 h-5" />
                        Unlock Now - {selectedPlan === "annual" ? PRICING.annual.label : PRICING.monthly.label}
                      </span>
                    )}
                  </Button>

                  {/* Grandfather clause notice */}
                  <p className="text-xs text-center text-muted-foreground">
                    🎉 Existing subscribers at $3.99 stay at old price
                  </p>

                  {/* Promo Code Section */}
                  <div className="border-t border-muted pt-4 space-y-3">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Gift className="w-4 h-4 text-primary" />
                      Have a promo code?
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        placeholder="Enter code"
                        className="font-mono text-sm"
                        disabled={isRedeemingCode}
                      />
                      <Button
                        onClick={handleRedeemCode}
                        disabled={isRedeemingCode || !promoCode.trim() || !session?.access_token}
                        variant="secondary"
                        size="sm"
                      >
                        {isRedeemingCode ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Redeem"
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {promoError}
                      </p>
                    )}
                    {!user && (
                      <p className="text-xs text-muted-foreground">
                        Sign in to use a promo code
                      </p>
                    )}
                  </div>

                  {/* Restore button */}
                  <Button
                    onClick={handleRestore}
                    disabled={isLoading || isRestoring}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    {isRestoring ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Restoring...
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Restore Purchase
                      </span>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <PaymentLoadingOverlay isVisible={showLoadingOverlay} />
  </>
  );
};

export default PurchaseModal;
