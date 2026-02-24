import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import VoicePersonalityQuiz from "./VoicePersonalityQuiz";

export const FeaturesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setShowQuiz(true);
    window.addEventListener("toothyquest:openVoiceQuiz", handler);
    return () => window.removeEventListener("toothyquest:openVoiceQuiz", handler);
  }, []);

  const features = [
    {
      icon: "🛡️",
      title: "Safe & Kid-Friendly",
      description: "Ad-free, secure, and designed specifically for kids ages 3–9.",
    },
    {
      icon: "❤️",
      title: "Learning Through Play",
      description: "Games, stories, and colorful animations make brushing feel fun — not forced.",
    },
    {
      icon: "⭐",
      title: "50+ Quests & Rewards",
      description: "Kids stay motivated with stars, badges, and exciting challenges.",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Parent Dashboard",
      description: "Parents can easily track progress, habits, and milestones.",
    },
  ];

  const handleStartAdventure = () => {
    window.dispatchEvent(new Event("toothyquest:openAuth"));
  };

  return (
    <section id="features" className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            🦷 What's Inside ToothyQuest?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join Toothy and friends on fun quests that turn brushing, flossing, and healthy habits into a game. Kids earn rewards, beat sugar bugs, and build confidence — all in a safe, playful world.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card hover:shadow-float transition-shadow text-center"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Button
            onClick={handleStartAdventure}
            size="lg"
            className="rounded-full px-8 py-3 font-display font-bold text-sm sm:text-base shadow-lg"
          >
            🚀 Start the Adventure
          </Button>
        </motion.div>

        {/* Voice Personality Quiz Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <motion.button
            onClick={() => setShowQuiz(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-primary via-accent to-candy p-1 rounded-3xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="bg-card rounded-[22px] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.span 
                  className="text-5xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎙️
                </motion.span>
                <div className="text-left">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Find Your Perfect Storyteller Voice!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Take a fun quiz to discover which voice personality matches you best ✨
                  </p>
                </div>
              </div>
              <motion.div 
                className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-display font-bold text-sm"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Take Quiz! 🎯
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* AI Story Creator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <motion.button
            onClick={() => navigate("/ai-stories")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-secondary via-candy to-sparkle p-1 rounded-3xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="bg-card rounded-[22px] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.span
                  className="text-5xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  ✨
                </motion.span>
                <div className="text-left">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {t("dentalStories.pageTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dentalStories.subtitle")} 🦷
                  </p>
                </div>
              </div>
              <motion.div
                className="hidden sm:flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-display font-bold text-sm"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Try It! ✨
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Voice Quiz Modal */}
      <VoicePersonalityQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
      />
    </section>
  );
};

export default FeaturesSection;
