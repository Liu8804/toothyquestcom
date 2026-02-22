import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import FunFactCard from "@/components/FunFactCard";
import { TrailPath } from "@/components/hybrid-ui";
import ThemedSectionWrapper from "@/components/ThemedSectionWrapper";

const factEmojis = ["🦷", "🚀", "🧚", "✨", "🐘", "👅"];

// Scattered positions for desktop
const desktopPositions = [
  { x: 10, y: 25 },
  { x: 35, y: 60 },
  { x: 55, y: 20 },
  { x: 75, y: 55 },
  { x: 90, y: 25 },
  { x: 50, y: 80 },
];

export const FunFactsSection = () => {
  const { t } = useTranslation();
  const facts = t("funFacts.facts", { returnObjects: true }) as string[];

  return (
    <ThemedSectionWrapper theme="meadow" id="facts" className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("funFacts.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("funFacts.subtitle")}
          </p>
        </div>

        {/* Desktop: Scattered world layout */}
        <div className="hidden md:block relative w-full h-[400px] mb-8">
          <TrailPath
            points={desktopPositions}
            width={100}
            height={100}
            variant="rainbow"
            strokeWidth={2}
            delay={0.3}
            showGlowDots={true}
            className="absolute inset-0 w-full h-full"
          />
          {facts.map((fact, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${desktopPositions[index]?.x ?? 50}%`,
                top: `${desktopPositions[index]?.y ?? 50}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <FunFactCard
                fact={fact}
                emoji={factEmojis[index] || "🦷"}
                index={index}
              />
            </div>
          ))}

          {/* Ambient decorations */}
          {["🫧", "✨", "💫"].map((deco, i) => (
            <motion.span
              key={i}
              className="absolute text-lg opacity-30 pointer-events-none select-none"
              style={{ left: `${20 + i * 30}%`, top: `${5 + (i % 2) * 85}%` }}
              animate={{ y: [0, -12, 0], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
            >
              {deco}
            </motion.span>
          ))}
        </div>

        {/* Mobile: Zigzag trail */}
        <div className="md:hidden space-y-2">
          {facts.map((fact, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative">
                {index < facts.length - 1 && (
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-6 z-0"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <div className="w-full h-full bg-gradient-to-b from-primary/30 to-primary/10" />
                  </motion.div>
                )}
                <motion.div
                  className={`flex items-center gap-4 ${isEven ? "flex-row" : "flex-row-reverse"}`}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <FunFactCard
                    fact={fact}
                    emoji={factEmojis[index] || "🦷"}
                    index={index}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </ThemedSectionWrapper>
  );
};

export default FunFactsSection;
