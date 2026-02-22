import { motion } from "framer-motion";

const ToothKingdomGateway = () => {
  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <motion.div
          className="text-5xl md:text-6xl mb-3"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          🏰
        </motion.div>
        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
          Welcome to the Tooth Kingdom 👑
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
          Explore magical worlds, complete quests, and become a Dental Champion!
        </p>
      </motion.div>
    </section>
  );
};

export default ToothKingdomGateway;
