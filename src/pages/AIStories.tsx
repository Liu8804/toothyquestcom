import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, BookOpen, Users, Volume2, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { useTranslation } from "react-i18next";
import Seo from "@/components/Seo";

const AGE_RANGES = [
  { value: "3-5", label: "Ages 3-5", emoji: "🧸" },
  { value: "6-7", label: "Ages 6-7", emoji: "🦸" },
  { value: "8-9", label: "Ages 8-9", emoji: "🚀" },
];

const VISIT_TYPES = [
  { value: "first-visit", label: "First Visit", emoji: "🏥" },
  { value: "cleaning", label: "Cleaning", emoji: "✨" },
  { value: "filling", label: "Filling", emoji: "🦷" },
  { value: "braces", label: "Braces", emoji: "😁" },
  { value: "wiggly-tooth", label: "Wiggly Tooth", emoji: "🧚" },
];

interface StoryResult {
  title: string;
  story: string;
  parentScript: string[];
  funFact: string;
}

const AIStories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const narration = useStoryNarration();

  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<string | null>(null);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showParentScript, setShowParentScript] = useState(false);

  const generateStory = async () => {
    if (!ageRange || !visitType) return;
    setIsLoading(true);
    setError(null);
    setStory(null);
    narration.stop();

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-dental-story", {
        body: { ageRange, visitType },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setStory(data);
    } catch (err) {
      console.error("Story generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNarrate = () => {
    if (!story) return;
    if (narration.isPlaying && !narration.isPaused) {
      narration.pause();
    } else if (narration.isPaused) {
      narration.resume();
    } else {
      narration.play(story.story, "encouraging");
    }
  };

  const resetForm = () => {
    setStory(null);
    setError(null);
    setShowParentScript(false);
    narration.stop();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold font-fredoka text-foreground">{t("dentalStories.pageTitle")}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {!story ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Intro */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Create a short, kid-friendly dental story to help your child feel calm, confident, and prepared for their next dental visit.
                </p>
                <p className="text-2xl">🦷✨</p>
                <h2 className="text-xl font-bold font-fredoka text-foreground">
                  {t("dentalStories.title")}
                </h2>
              </div>

              {/* Age Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Child's Age
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age.value}
                      onClick={() => setAgeRange(age.value)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        ageRange === age.value
                          ? "border-primary bg-primary/10 scale-105 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className="text-2xl mb-1">{age.emoji}</div>
                      <div className="text-xs font-semibold text-foreground">{age.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visit Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Visit Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VISIT_TYPES.map((visit) => (
                    <button
                      key={visit.value}
                      onClick={() => setVisitType(visit.value)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        visitType === visit.value
                          ? "border-primary bg-primary/10 scale-105 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className="text-2xl mb-1">{visit.emoji}</div>
                      <div className="text-xs font-semibold text-foreground">{visit.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateStory}
                disabled={!ageRange || !visitType || isLoading}
                className="w-full py-6 text-lg font-bold font-fredoka rounded-2xl"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Toothy is writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create My Story!
                  </>
                )}
              </Button>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Story Card */}
              <div className="bg-card rounded-3xl border border-border shadow-lg overflow-hidden">
                {/* Story Header */}
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-5">
                  <h2 className="text-xl font-bold font-fredoka text-foreground">{story.title}</h2>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="bg-primary/20 px-2 py-1 rounded-full">
                      {AGE_RANGES.find((a) => a.value === ageRange)?.label}
                    </span>
                    <span className="bg-secondary/20 px-2 py-1 rounded-full">
                      {VISIT_TYPES.find((v) => v.value === visitType)?.label}
                    </span>
                  </div>
                </div>

                {/* Story Body */}
                <div className="p-5 space-y-4">
                  {story.story.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-foreground leading-relaxed text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Fun Fact */}
                <div className="mx-5 mb-5 p-4 rounded-2xl bg-accent/10 border border-accent/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-accent-foreground font-medium">{story.funFact}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleNarrate}
                  variant="outline"
                  className="flex-1 py-5 rounded-2xl font-bold"
                  disabled={narration.isLoading}
                >
                  {narration.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Volume2 className="h-4 w-4 mr-2" />
                  )}
                  {narration.isPlaying && !narration.isPaused
                    ? "Pause"
                    : narration.isPaused
                    ? "Resume"
                    : "Listen"}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 py-5 rounded-2xl font-bold"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Story
                </Button>
              </div>

              {/* Parent Script */}
              <div className="bg-card rounded-3xl border border-border overflow-hidden">
                <button
                  onClick={() => setShowParentScript(!showParentScript)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-bold font-fredoka text-foreground flex items-center gap-2">
                    👨‍👩‍👧 Parent Guidance Script
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {showParentScript ? "Hide" : "Show"}
                  </span>
                </button>
                <AnimatePresence>
                  {showParentScript && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Use these talking points to prepare your child before their visit:
                        </p>
                        <ul className="space-y-2">
                          {story.parentScript.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center px-4">
                This story is AI-generated for entertainment and comfort purposes only. It does not constitute medical advice. Always consult your dental professional for health guidance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIStories;
