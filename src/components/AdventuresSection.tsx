import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Music, MessageCircle } from "lucide-react";
import AdventureCard from "@/components/AdventureCard";

const adventures = [
  {
    title: "Story Time",
    description: "Join Toothy on magical adventures that make dental visits feel like exciting quests!",
    icon: BookOpen,
    color: "teal" as const,
  },
  {
    title: "Fun Games",
    description: "Play tooth-brushing games and earn stars for being a dental superhero!",
    icon: Gamepad2,
    color: "coral" as const,
  },
  {
    title: "Sing Along",
    description: "Learn fun songs about brushing and flossing that make dental care a party!",
    icon: Music,
    color: "purple" as const,
  },
  {
    title: "Chat with Toothy",
    description: "Have friendly conversations and ask any questions about your dental visit!",
    icon: MessageCircle,
    color: "gold" as const,
  },
];

export const AdventuresSection = () => {
  return (
    <section id="adventures" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
            🚀 Choose Your Adventure
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Exciting Ways to Explore!
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick an adventure and discover how fun taking care of your teeth can be!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adventures.map((adventure, index) => (
            <AdventureCard
              key={adventure.title}
              {...adventure}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdventuresSection;
