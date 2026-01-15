import { motion } from "framer-motion";
import FunFactCard from "@/components/FunFactCard";

const funFacts = [
  {
    fact: "Your teeth are as unique as your fingerprints! No one else in the whole world has teeth exactly like yours.",
    emoji: "🦷",
  },
  {
    fact: "Dentists have special chairs that can move up, down, and even lay back like a spaceship seat!",
    emoji: "🚀",
  },
  {
    fact: "The tooth fairy collects millions of teeth every year! That's a lot of tiny treasures.",
    emoji: "🧚",
  },
  {
    fact: "Brushing your teeth twice a day keeps cavity bugs away and makes your smile sparkle!",
    emoji: "✨",
  },
  {
    fact: "Elephants have the biggest teeth of any land animal - some are as long as your arm!",
    emoji: "🐘",
  },
  {
    fact: "Your tongue has a unique print just like your fingers - it's your body's special signature!",
    emoji: "👅",
  },
];

export const FunFactsSection = () => {
  return (
    <section id="facts" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-bold mb-4">
            🧠 Did You Know?
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Super Cool Tooth Facts!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Impress your friends and family with these amazing facts about teeth!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funFacts.map((fact, index) => (
            <FunFactCard
              key={index}
              fact={fact.fact}
              emoji={fact.emoji}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FunFactsSection;
