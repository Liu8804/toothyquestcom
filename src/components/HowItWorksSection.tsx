import { motion } from "framer-motion";

const steps = [
  {
    emoji: "🪥",
    title: "Play & Learn",
    description: "Kids explore fun games and stories that teach healthy brushing habits.",
  },
  {
    emoji: "⭐",
    title: "Earn Rewards",
    description: "Kids earn stars, badges, and encouragement for brushing and learning.",
  },
  {
    emoji: "😁",
    title: "Build Confidence",
    description: "Brushing becomes a habit — and dentist visits feel less scary.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center mb-10"
        >
          How ToothyQuest Works
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-6 shadow-card text-center flex flex-col items-center gap-3"
            >
              <span className="text-4xl">{step.emoji}</span>
              <div className="flex items-center gap-2">
                <span className="bg-primary/15 text-primary font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
