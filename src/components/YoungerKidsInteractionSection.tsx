import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const YoungerKidsInteractionSection = () => {
  const { t } = useTranslation();

  const improvements = [
    {
      icon: "🖐️",
      title: t("youngerKids.improvements.tapDrag.title", "Tap & Drag Interactions"),
      description: t(
        "youngerKids.improvements.tapDrag.description",
        "More hands-on daily tasks: drag toothpaste, tap teeth to clean, and drag floss between teeth."
      ),
    },
    {
      icon: "🎭",
      title: t("youngerKids.improvements.mascotReactions.title", "Mascot Mini-Reactions"),
      description: t(
        "youngerKids.improvements.mascotReactions.description",
        "Quick waves, cheers, and happy dances for every small win — not just the final reward."
      ),
    },
    {
      icon: "⭐",
      title: t("youngerKids.improvements.progress.title", "Visual Progress"),
      description: t(
        "youngerKids.improvements.progress.description",
        "Clear progress with stars, smiley faces, and XP fills — so kids don’t have to read to understand what to do next."
      ),
    },
    {
      icon: "🎁",
      title: t("youngerKids.improvements.collectibles.title", "Collectibles & Stickers"),
      description: t(
        "youngerKids.improvements.collectibles.description",
        "Stickers kids can tap/drag into a collection to build ownership and bring them back tomorrow."
      ),
    },
  ];

  return (
    <section id="younger-kids" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
            {t("youngerKids.badge", "Ages 4–6 Focus")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("youngerKids.title", "Enhancing Interaction for Younger Kids")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              "youngerKids.subtitle",
              "Based on feedback from younger players, we’re adding more direct, hands-on interactions so kids can engage independently — while keeping it fun for ages 7–9 too."
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {improvements.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-float transition-shadow"
            >
              <div className="w-14 h-14 gradient-hero rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 bg-card rounded-2xl p-6 md:p-8 shadow-card"
        >
          <h3 className="font-display text-2xl font-bold text-foreground mb-3">
            {t("youngerKids.examples.title", "Example mini-quests")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">🪥 {t("youngerKids.examples.brushing.title", "Brushing Quest")}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{t("youngerKids.examples.brushing.s1", "Drag toothpaste onto the toothbrush (sparkle feedback).")}</li>
                <li>{t("youngerKids.examples.brushing.s2", "Tap teeth to clean (sparkles + mascot cheer).")}</li>
                <li>{t("youngerKids.examples.brushing.s3", "Finish with a dance + stars + XP fill.")}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">🧵 {t("youngerKids.examples.floss.title", "Flossing Quest")}</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{t("youngerKids.examples.floss.s1", "Tap and drag floss between teeth (sparkle + sound).")}</li>
                <li>{t("youngerKids.examples.floss.s2", "Mascot gives a thumbs-up after each success.")}</li>
                <li>{t("youngerKids.examples.floss.s3", "Completion shows stars + XP fill + reward.")}</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default YoungerKidsInteractionSection;
