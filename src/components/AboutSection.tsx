import { motion } from "framer-motion";
import { Shield, Heart, Star, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AboutSection = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Shield,
      titleKey: "about.features.safe.title",
      descriptionKey: "about.features.safe.description",
    },
    {
      icon: Heart,
      titleKey: "about.features.funLearning.title",
      descriptionKey: "about.features.funLearning.description",
    },
    {
      icon: Star,
      titleKey: "about.features.quests.title",
      descriptionKey: "about.features.quests.description",
    },
    {
      icon: Users,
      titleKey: "about.features.parentDashboard.title",
      descriptionKey: "about.features.parentDashboard.description",
    },
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-bold mb-4">
            {t('about.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            {t('about.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">{t('about.freeQuests')}</span>
            <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full font-semibold">{t('about.multipleChoice')}</span>
            <span className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full font-semibold">{t('about.bracesAdventures')}</span>
            <span className="bg-mint/10 text-mint-foreground px-3 py-1.5 rounded-full font-semibold">{t('about.animations')}</span>
          </div>
          <p className="text-lg font-bold text-primary mt-6">
            {t('about.unlockPrice')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-float transition-shadow text-center"
            >
              <div className="w-14 h-14 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
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

export default AboutSection;
