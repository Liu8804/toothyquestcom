import { motion } from "framer-motion";

const ToothKingdomGateway = () => {
  return (
    <section className="relative overflow-hidden py-6">
      {/* Kingdom background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-star/10 to-secondary/5" />
      
      {/* Castle gate illustration */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative text-center px-4"
      >
        {/* Castle turrets */}
        <div className="flex items-end justify-center gap-2 mb-1">
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl">🏴</span>
            <div className="w-8 h-16 bg-gradient-to-b from-primary/30 to-primary/10 rounded-t-lg border-x-2 border-t-2 border-primary/20" />
          </motion.div>
          
          <div className="flex flex-col items-center">
            <motion.span
              className="text-5xl md:text-6xl drop-shadow-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              🏰
            </motion.span>
            {/* Gate arch */}
            <div className="w-32 h-12 bg-gradient-to-b from-primary/20 to-transparent rounded-t-[50%] border-x-2 border-t-2 border-primary/20 flex items-end justify-center pb-1">
              <motion.span 
                className="text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚔️
              </motion.span>
            </div>
          </div>
          
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <span className="text-2xl">🏴</span>
            <div className="w-8 h-16 bg-gradient-to-b from-primary/30 to-primary/10 rounded-t-lg border-x-2 border-t-2 border-primary/20" />
          </motion.div>
        </div>

        <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
          Welcome to the Tooth Kingdom 👑
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
          Explore magical worlds, complete quests, and become a Dental Champion!
        </p>

        {/* Decorative kingdom path entrance */}
        <div className="flex justify-center mt-4">
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-lg">🌟</span>
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-star/60 to-primary/60" />
            <span className="text-sm">Enter the Kingdom</span>
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary/60 to-star/60" />
            <span className="text-lg">🌟</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ToothKingdomGateway;
