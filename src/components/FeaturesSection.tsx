import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: "🦷",
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
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-bold mb-4">
            {t("features.badge")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t("features.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-float hover:-translate-y-1 transition-all text-center group"
            >
              <motion.div
                className="text-4xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring" }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(feature.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
