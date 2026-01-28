import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Sparkles, Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ConfettiCelebration from "@/components/ConfettiCelebration";

const TesterInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    if (!user || !session?.access_token) {
      toast.error("Please sign in to use an invitation code");
      return;
    }

    setIsRedeeming(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("redeem-tester-invite", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { code: code.trim() },
      });

      if (fnError) {
        setError("Failed to redeem invitation. Please try again.");
        return;
      }

      if (data?.success) {
        setRedeemed(true);
        setShowConfetti(true);
        toast.success(data.message || "Invitation redeemed successfully!");
      } else if (data?.already_tester) {
        toast.info("You already have tester access!");
        navigate("/");
      } else {
        setError(data?.message || "Invalid invitation code");
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
          <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-8 text-center">
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
                  {["🧪", "✨", "🦷", "⭐", "🎉"][i]}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white/20 backdrop-blur-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FlaskConical className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Tester Invitation
            </h1>
            <p className="text-white/90">
              Enter your code to unlock 7 days of full access!
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
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-purple-100">
                  <Check className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Welcome, Tester! 🧪
                </h2>
                <p className="text-muted-foreground mb-6">
                  You now have 7 days of full access to all ToothyQuest features!
                </p>
                <Button onClick={() => navigate("/")} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Exploring
                </Button>
              </motion.div>
            ) : (
              <>
                {!user && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      Please sign in first to use an invitation code
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="inviteCode" className="text-sm font-medium text-foreground">
                    Invitation Code
                  </label>
                  <Input
                    id="inviteCode"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="TQ-TEST-XXXXXXXX"
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
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:opacity-90 text-white"
                >
                  {isRedeeming ? (
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Activating...
                    </motion.div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Activate Tester Mode
                    </span>
                  )}
                </Button>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">What you get:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✨ All quests and adventures unlocked</li>
                    <li>🎮 All mini-games available</li>
                    <li>🏆 All rewards and badges accessible</li>
                    <li>⏰ 7 days of full access</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TesterInvite;
