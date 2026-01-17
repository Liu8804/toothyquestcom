import { motion } from "framer-motion";
import { Shield, Heart, Star, Users } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Safe & Kid-Friendly",
      description: "A secure environment designed specifically for children",
    },
    {
      icon: Heart,
      title: "Fun Learning",
      description: "Making dental health education enjoyable",
    },
    {
      icon: Star,
      title: "Earn Rewards",
      description: "Badges and achievements for every milestone",
    },
    {
      icon: Users,
      title: "Parent Dashboard",
      description: "Track your child's dental adventures",
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
            ℹ️ About ToothyQuest
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About ToothyQuest
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ToothyQuest is a fun and educational app for kids ages 3–9. Kids complete daily quests, 
            learn healthy habits, and earn badges for brushing, flossing, and making smart choices 
            for their teeth. Parents can track progress and support their child's dental adventures—all 
            in a safe, kid-friendly environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
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
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
