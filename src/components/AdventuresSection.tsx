import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Music, MessageCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import AdventureCard from "@/components/AdventureCard";
import SingAlongModal from "@/components/SingAlongModal";
import ChatWithToothy from "@/components/ChatWithToothy";
import GamesModal from "@/components/games/GamesModal";
import DentalOfficeTour from "@/components/DentalOfficeTour";

export const AdventuresSection = () => {
  const { t } = useTranslation();
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isSongsOpen, setIsSongsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const adventures = [
    {
      titleKey: "adventures.storyTime.title",
      descriptionKey: "adventures.storyTime.description",
      icon: BookOpen,
      color: "teal" as const,
      action: "scroll-to-stories",
      backgroundImage: "/sections/story-time.webp",
    },
    {
      titleKey: "adventures.funGames.title",
      descriptionKey: "adventures.funGames.description",
      icon: Gamepad2,
      color: "coral" as const,
      action: "open-game",
      backgroundImage: "/sections/games.webp",
    },
    {
      titleKey: "adventures.singAlong.title",
      descriptionKey: "adventures.singAlong.description",
      icon: Music,
      color: "purple" as const,
      action: "open-songs",
    },
    {
      titleKey: "adventures.chatWithToothy.title",
      descriptionKey: "adventures.chatWithToothy.description",
      icon: MessageCircle,
      color: "gold" as const,
      action: "open-chat",
    },
    {
      titleKey: "adventures.exploreOffice.title",
      descriptionKey: "adventures.exploreOffice.description",
      icon: Search,
      color: "mint" as const,
      action: "open-tour",
      isNew: true,
      backgroundImage: "/sections/explore-office.webp",
    },
  ];

  const handleAdventureClick = (action: string) => {
    switch (action) {
      case "open-game":
        setIsGameOpen(true);
        break;
      case "open-songs":
        setIsSongsOpen(true);
        break;
      case "open-chat":
        setIsChatOpen(true);
        break;
      case "open-tour":
        setIsTourOpen(true);
        break;
      case "scroll-to-stories":
        document.getElementById("stories")?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <section id="adventures" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
              {t("adventures.badge")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t("adventures.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("adventures.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {adventures.map((adventure, index) => (
              <AdventureCard
                key={adventure.titleKey}
                title={t(adventure.titleKey)}
                description={t(adventure.descriptionKey)}
                icon={adventure.icon}
                color={adventure.color}
                delay={index * 0.1}
                onClick={() => handleAdventureClick(adventure.action)}
                isNew={'isNew' in adventure ? adventure.isNew : false}
                backgroundImage={'backgroundImage' in adventure ? adventure.backgroundImage : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <GamesModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
      <SingAlongModal isOpen={isSongsOpen} onClose={() => setIsSongsOpen(false)} />
      <ChatWithToothy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <DentalOfficeTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
};

export default AdventuresSection;
