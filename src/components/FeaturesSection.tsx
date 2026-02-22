import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import VoicePersonalityQuiz from "./VoicePersonalityQuiz";
import cartoonFeaturesHero from "@/assets/cartoon-features-hero.png";
import ThemedSectionWrapper from "@/components/ThemedSectionWrapper";

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
      icon: "🎮",
      titleKey: "features.funQuests.title",
      descriptionKey: "features.funQuests.description",
    },
    {
      icon: "🏆",
      titleKey: "features.earnRewards.title",
      descriptionKey: "features.earnRewards.description",
    },
    {
      icon: "🎨",
      titleKey: "features.friendlyGuide.title",
      descriptionKey: "features.friendlyGuide.description",
    },
    {
      icon: "⏰",
      titleKey: "features.reminders.title",
      descriptionKey: "features.reminders.description",
    },
    {
      icon: "👨‍👩‍👧",
      titleKey: "features.parentDashboard.title",
      descriptionKey: "features.parentDashboard.description",
    },
  ];

  return (
    <ThemedSectionWrapper theme="sunset" id="features" className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          {/* Animated cartoon character */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.img
              src={cartoonFeaturesHero}
              alt="Tooth Hero"
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card hover:shadow-float transition-shadow text-center"
            >
              <motion.div
                className="text-3xl mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>

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
    </ThemedSectionWrapper>
  );
};

export default FeaturesSection;
