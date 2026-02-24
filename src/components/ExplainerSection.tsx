import { motion } from "framer-motion";

const ExplainerSection = () => {
  return (
    <section className="py-8 bg-background">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          ToothyQuest turns daily brushing into a fun adventure with games, stories, and rewards that motivate kids to care for their smiles.
        </motion.p>
      </div>
    </section>
  );
};

export default ExplainerSection;
