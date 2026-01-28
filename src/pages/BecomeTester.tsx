import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Sparkles, ArrowRight, Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import { signUpSchema, signInSchema } from "@/lib/validation";

const AVATAR_OPTIONS = ["😁", "🌟", "🦸", "🧚", "🦋", "🐻", "🐰", "🦊", "🐱", "✨"];

type Step = "auth" | "setup" | "complete";

const BecomeTester = () => {
  const navigate = useNavigate();
  const { user, session, signIn, signUp } = useAuth();
  const [step, setStep] = useState<Step>("auth");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Auth state
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // Child setup state
  const [childNickname, setChildNickname] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("😁");
  const [setupLoading, setSetupLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (user && session) {
      // Check if already a tester
      checkAndActivateTester();
    }
  }, [user, session]);

  const checkAndActivateTester = async () => {
    if (!user || !session?.access_token) return;

    try {
      // Check if already a tester
      const { data: testerInfo } = await supabase.rpc("get_tester_info");
      
      if (testerInfo && testerInfo.length > 0 && testerInfo[0].is_tester) {
        // Already a tester, go to setup or home
        const { data: children } = await supabase
          .from("children")
          .select("id")
          .eq("parent_id", user.id)
          .limit(1);
        
        if (children && children.length > 0) {
          toast.info("You already have tester access!");
          navigate("/");
        } else {
          setStep("setup");
        }
        return;
      }

      // Auto-activate as tester
      const { error } = await supabase.functions.invoke("activate-public-tester", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        console.error("Failed to activate tester:", error);
        toast.error("Failed to activate tester mode");
        return;
      }

      // Check if user has children already
      const { data: children } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1);

      if (children && children.length > 0) {
        setShowConfetti(true);
        setStep("complete");
      } else {
        setStep("setup");
      }
    } catch (err) {
      console.error("Error checking tester status:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    // Validate
    if (authMode === "signup") {
      const result = signUpSchema.safeParse({ email, password, displayName: parentName });
      if (!result.success) {
        setAuthError(result.error.errors[0]?.message || "Validation failed");
        setAuthLoading(false);
        return;
      }
    } else {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        setAuthError(result.error.errors[0]?.message || "Validation failed");
        setAuthLoading(false);
        return;
      }
    }

    let authResult;
    if (authMode === "signup") {
      authResult = await signUp(email.trim(), password, parentName.trim());
    } else {
      authResult = await signIn(email.trim(), password);
    }

    setAuthLoading(false);

    if (authResult.error) {
      setAuthError(authResult.error.message);
    }
    // The useEffect will handle the next step when user is set
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childNickname.trim() || !user) return;

    setSetupLoading(true);

    try {
      // Add child
      const { error } = await supabase.from("children").insert({
        parent_id: user.id,
        name: childNickname.trim(),
        avatar_emoji: avatarEmoji,
      });

      if (error) {
        toast.error("Failed to add child");
        setSetupLoading(false);
        return;
      }

      setShowConfetti(true);
      setStep("complete");
    } catch (err) {
      console.error("Setup error:", err);
      toast.error("Something went wrong");
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-background to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20 flex items-center justify-center p-4">
      {showConfetti && <ConfettiCelebration isActive={showConfetti} />}

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
              {step === "complete" ? "You're All Set!" : "Welcome to ToothyQuest!"}
            </h1>
            <p className="text-white/90">
              {step === "auth" && "Join as a tester and get 7 days of full access!"}
              {step === "setup" && "Let's set up your child's profile"}
              {step === "complete" && "Start your dental adventure today!"}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === "auth" && (
                <motion.form
                  key="auth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleAuth}
                  className="space-y-4"
                >
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="parentName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Your Name
                      </Label>
                      <Input
                        id="parentName"
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Parent's name"
                        required
                        maxLength={100}
                        className="rounded-xl"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      required
                      maxLength={255}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      maxLength={128}
                      className="rounded-xl"
                    />
                  </div>

                  {authError && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                      {authError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : authMode === "signup" ? (
                      "Create Account & Start Testing"
                    ) : (
                      "Sign In & Start Testing"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
                      className="ml-1 text-primary hover:underline"
                    >
                      {authMode === "signup" ? "Sign in" : "Sign up"}
                    </button>
                  </p>

                  <div className="bg-muted/50 rounded-xl p-4 space-y-2 mt-4">
                    <h3 className="font-semibold text-sm text-foreground">What you get:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✨ All 67+ quests unlocked</li>
                      <li>🎮 30+ mini-games available</li>
                      <li>🏆 All rewards and badges accessible</li>
                      <li>⏰ 7 days of full access</li>
                    </ul>
                  </div>
                </motion.form>
              )}

              {step === "setup" && (
                <motion.form
                  key="setup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSetup}
                  className="space-y-6"
                >
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground">
                      You have <span className="font-bold text-primary">7 days</span> of full access!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childNickname">Child's Nickname</Label>
                    <Input
                      id="childNickname"
                      type="text"
                      value={childNickname}
                      onChange={(e) => setChildNickname(e.target.value)}
                      placeholder="Enter nickname"
                      required
                      maxLength={50}
                      className="rounded-xl h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Choose Avatar</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAvatarEmoji(emoji)}
                          className={`text-2xl p-3 rounded-xl transition-all ${
                            avatarEmoji === emoji
                              ? "bg-primary/20 ring-2 ring-primary scale-110"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={setupLoading || !childNickname.trim()}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl"
                  >
                    {setupLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Today's Quest
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {step === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="text-6xl">🎉</div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome to Tester Mode!
                    </h2>
                    <p className="text-muted-foreground">
                      You have full access for 7 days to explore all quests and mini-games.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate("/")}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start Exploring
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tester Mode indicator */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <FlaskConical className="w-4 h-4" />
            Tester Mode — 7 Day Free Trial
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BecomeTester;
