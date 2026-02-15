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
    <section id="about" className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="bg-card rounded-2xl p-5 shadow-card text-center"
            >
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
