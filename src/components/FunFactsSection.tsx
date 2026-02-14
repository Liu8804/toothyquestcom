import { useTranslation } from "react-i18next";
import FunFactCard from "@/components/FunFactCard";

const factEmojis = ["🦷", "🚀", "🧚", "✨", "🐘", "👅"];

export const FunFactsSection = () => {
  const { t } = useTranslation();
  const facts = t("funFacts.facts", { returnObjects: true }) as string[];

  return (
    <section id="facts" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("funFacts.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("funFacts.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facts.map((fact, index) => (
            <FunFactCard
              key={index}
              fact={fact}
              emoji={factEmojis[index] || "🦷"}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FunFactsSection;
