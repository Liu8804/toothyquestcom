import { motion } from "framer-motion";
import gatewayImage from "@/assets/tooth-kingdom-gateway.png";
import InteractiveToothCharacter from "@/components/InteractiveToothCharacter";
import kingMascot from "@/assets/mascot-emotions/kingdom-mascot-waving.png";

const ToothKingdomGateway = () => {
  return (
    <section className="relative overflow-hidden py-6 md:py-10">
      {/* Gateway Banner Image */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-5xl px-4"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-star/30">
          <img
            src={gatewayImage}
            alt="Welcome to the Tooth Kingdom"
            className="w-full h-auto object-cover"
          />
          
          {/* Sparkle overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xl md:text-2xl"
                style={{
                  left: `${10 + i * 11}%`,
                  top: `${15 + (i % 3) * 25}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              >
                ✨
              </motion.span>
            ))}
          </div>

          {/* Animated gate glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-star/10 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Floating Kingdom Mascot */}
        <motion.div
          className="absolute -bottom-6 right-4 md:right-8 z-10"
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <InteractiveToothCharacter
            src={kingMascot}
            alt="Tooth Kingdom Mascot"
            size="md"
            tips={[
              "Welcome to the Tooth Kingdom! 👑",
              "Every brave smile earns a star! ⭐",
              "I'm King Toothy, your royal guide! 🦷",
              "Let's explore the kingdom together! 🏰",
            ]}
          />
        </motion.div>
      </motion.div>

      {/* Kingdom subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 px-4"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome to the Tooth Kingdom 👑
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Explore magical worlds, complete quests, and become a Dental Champion!
        </p>
      </motion.div>
    </section>
  );
};

export default ToothKingdomGateway;
