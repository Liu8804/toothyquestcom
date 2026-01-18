import { motion } from "framer-motion";
import { Shield, Heart, Star, Users } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Safe & Kid-Friendly",
      description: "A secure, playful world designed specifically for little ones ages 3-9",
    },
    {
      icon: Heart,
      title: "Fun Learning",
      description: "Multiple-choice questions, hints, and colorful animations keep kids engaged",
    },
    {
      icon: Star,
      title: "42 Quests + Rewards",
      description: "5 FREE quests to start, unlock all 42 for just $3.99!",
    },
    {
      icon: Users,
      title: "Parent Dashboard",
      description: "Track your child's progress and watch their smile grow brighter",
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
            🦷✨ About ToothyQuest ✨🦷
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What's Inside ToothyQuest?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Join Toothy and friends on a magical adventure where brushing, flossing, and healthy habits are FUN! 
            Kids explore exciting quests, chase sugar bugs, learn about healthy snacks, and even discover the magic 
            of braces—all in a safe, playful world.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">🎮 5 FREE quests to start</span>
            <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full font-semibold">❓ Multiple-choice questions & hints</span>
            <span className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-full font-semibold">🦷 Bonus braces adventures</span>
            <span className="bg-mint/10 text-mint-foreground px-3 py-1.5 rounded-full font-semibold">✨ Colorful animations & rewards</span>
          </div>
          <p className="text-lg font-bold text-primary mt-6">
            🎉 Unlock all 42 quests for just $3.99!
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
