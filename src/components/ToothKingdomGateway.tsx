import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import gatewayImage from "@/assets/tooth-kingdom-gateway.webp";

const ToothKingdomGateway = () => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === "es";

  return (
    <section className="relative overflow-hidden">
      {/* Full-width kingdom gateway illustration */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full aspect-[16/7] md:aspect-[16/6] max-h-[400px] overflow-hidden rounded-b-3xl"
      >
        <img
          src={gatewayImage}
          alt="Tooth Kingdom Gateway"
          className="w-full h-full object-cover"
        />
        {/* Bottom gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center px-4">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground drop-shadow-lg">
            {isSpanish ? "Bienvenido al Reino Dental 👑" : "Welcome to the Tooth Kingdom 👑"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base mt-1 drop-shadow-md">
            {isSpanish
              ? "¡Explora mundos mágicos, completa misiones y conviértete en un Campeón Dental!"
              : "Explore magical worlds, complete quests, and become a Dental Champion!"}
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default ToothKingdomGateway;
