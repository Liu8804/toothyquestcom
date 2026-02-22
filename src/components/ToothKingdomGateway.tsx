import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import gatewayImage from "@/assets/tooth-kingdom-gateway.webp";

const ToothKingdomGateway = () => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === "es";

  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl mx-auto px-4"
      >
        {/* Castle gateway image */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-amber-300/50">
          <img
            src={gatewayImage}
            alt="Tooth Kingdom Gateway"
            className="w-full h-auto object-cover aspect-[16/9]"
          />
          {/* Bottom gradient for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Title overlay */}
          <div className="absolute bottom-4 md:bottom-8 left-0 right-0 text-center px-4">
            <motion.h2
              className="font-display text-2xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {isSpanish ? "Bienvenido al Reino Dental 👑" : "Welcome to the Tooth Kingdom 👑"}
            </motion.h2>
            <motion.p
              className="text-white/90 max-w-md mx-auto text-sm md:text-base mt-1 drop-shadow-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              {isSpanish
                ? "¡Explora mundos mágicos y completa misiones!"
                : "Explore magical worlds and complete quests!"}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ToothKingdomGateway;
