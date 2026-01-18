import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Music, MessageCircle, Search } from "lucide-react";
import AdventureCard from "@/components/AdventureCard";
import SingAlongModal from "@/components/SingAlongModal";
import ChatWithToothy from "@/components/ChatWithToothy";
import GamesModal from "@/components/games/GamesModal";
import DentalOfficeTour from "@/components/DentalOfficeTour";

const adventures = [
  {
    title: "Story Time",
    description: "Join Toothy on magical adventures that make dental visits feel like exciting quests!",
    icon: BookOpen,
    color: "teal" as const,
    action: "scroll-to-stories",
  },
  {
    title: "Fun Games",
    description: "Play tooth-brushing games and earn stars for being a dental superhero!",
    icon: Gamepad2,
    color: "coral" as const,
    action: "open-game",
  },
  {
    title: "Sing Along",
    description: "Learn fun songs about brushing and flossing that make dental care a party!",
    icon: Music,
    color: "purple" as const,
    action: "open-songs",
  },
  {
    title: "Chat with Toothy",
    description: "Have friendly conversations and ask any questions about your dental visit!",
    icon: MessageCircle,
    color: "gold" as const,
    action: "open-chat",
  },
  {
    title: "Explore the Office",
    description: "Take a fun virtual tour of the dental office and discover cool equipment!",
    icon: Search,
    color: "mint" as const,
    action: "open-tour",
    isNew: true,
  },
];

export const AdventuresSection = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isSongsOpen, setIsSongsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

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
              🚀 Choose Your Adventure
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Exciting Ways to Explore!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pick an adventure and discover how fun taking care of your teeth can be!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {adventures.map((adventure, index) => (
              <AdventureCard
                key={adventure.title}
                title={adventure.title}
                description={adventure.description}
                icon={adventure.icon}
                color={adventure.color}
                delay={index * 0.1}
                onClick={() => handleAdventureClick(adventure.action)}
                isNew={'isNew' in adventure ? adventure.isNew : false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Fun Games Modal */}
      <GamesModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />

      {/* Sing Along Modal */}
      <SingAlongModal isOpen={isSongsOpen} onClose={() => setIsSongsOpen(false)} />

      {/* Chat with Toothy Modal */}
      <ChatWithToothy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Dental Office Tour Modal */}
      <DentalOfficeTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
};

export default AdventuresSection;
