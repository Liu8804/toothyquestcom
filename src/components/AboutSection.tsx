import { Shield, Heart, Star, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import cartoonWiseTooth from "@/assets/cartoon-wise-tooth.png";
import InteractiveToothCharacter from "@/components/InteractiveToothCharacter";

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
          {/* Interactive wise tooth character */}
          <InteractiveToothCharacter
            src={cartoonWiseTooth}
            alt="Professor Tooth"
            size="lg"
            idleAnimation="wobble"
            tips={[
              "Learning about teeth is super cool! 📚",
              "Your safety is our #1 priority! 🛡️",
              "Fun quests teach healthy habits! ⭐",
              "Parents can see your progress! 👨‍👩‍👧",
              "Knowledge is your smile's superpower! 💪",
            ]}
          />

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card text-center"
            >
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
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
