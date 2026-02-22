import { useState } from "react";
import { BookOpen, Gamepad2, Music, MessageCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FloatingNode, TrailPath, RewardBurst } from "@/components/hybrid-ui";
import SingAlongModal from "@/components/SingAlongModal";
import ChatWithToothy from "@/components/ChatWithToothy";
import GamesModal from "@/components/games/GamesModal";
import DentalOfficeTour from "@/components/DentalOfficeTour";
import ThemedSectionWrapper from "@/components/ThemedSectionWrapper";
import cartoonExplorer from "@/assets/cartoon-toothy-explorer.png";

export const AdventuresSection = () => {
  const { t } = useTranslation();
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isSongsOpen, setIsSongsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [burstActive, setBurstActive] = useState(false);

  const adventures = [
    {
      titleKey: "adventures.storyTime.title",
      descriptionKey: "adventures.storyTime.description",
      icon: BookOpen,
      color: "teal" as const,
      action: "scroll-to-stories",
      backgroundImage: "/sections/story-time.webp",
      emoji: "📖",
      reward: "⭐",
    },
    {
      titleKey: "adventures.funGames.title",
      descriptionKey: "adventures.funGames.description",
      icon: Gamepad2,
      color: "coral" as const,
      action: "open-game",
      backgroundImage: "/sections/games.webp",
      emoji: "🎮",
      reward: "🏆",
    },
    {
      titleKey: "adventures.singAlong.title",
      descriptionKey: "adventures.singAlong.description",
      icon: Music,
      color: "purple" as const,
      action: "open-songs",
      backgroundImage: "/sections/sing-along.webp",
      emoji: "🎵",
      reward: "🎶",
    },
    {
      titleKey: "adventures.chatWithToothy.title",
      descriptionKey: "adventures.chatWithToothy.description",
      icon: MessageCircle,
      color: "gold" as const,
      action: "open-chat",
      backgroundImage: "/sections/chat-toothy.webp",
      emoji: "💬",
      reward: "💡",
    },
    {
      titleKey: "adventures.exploreOffice.title",
      descriptionKey: "adventures.exploreOffice.description",
      icon: Search,
      color: "mint" as const,
      action: "open-tour",
      isNew: true,
      backgroundImage: "/sections/explore-office.webp",
      emoji: "🔍",
      reward: "🦷",
    },
  ];

  // Positions for floating nodes in the adventure "world"
  const nodePositions = [
    { x: 15, y: 30 },
    { x: 35, y: 55 },
    { x: 55, y: 25 },
    { x: 75, y: 50 },
    { x: 90, y: 30 },
  ];

  const handleAdventureClick = (action: string) => {
    setBurstActive(true);
    setTimeout(() => setBurstActive(false), 1500);

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
      <ThemedSectionWrapper theme="forest" id="adventures" className="py-12">
        <div className="container mx-auto px-4">
          {/* Cartoon character mascot */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <motion.img
              src={cartoonExplorer}
              alt="Toothy Explorer"
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t("adventures.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("adventures.subtitle")}
            </p>
          </div>

          {/* Floating Node World - Desktop */}
          <div className="hidden md:block relative w-full h-[320px] mb-8">
            {/* Trail connections between nodes */}
            <TrailPath
              points={nodePositions}
              width={100}
              height={100}
              variant="rainbow"
              strokeWidth={2}
              delay={0.5}
              showGlowDots={true}
              className="absolute inset-0 w-full h-full"
            />

            {/* Floating adventure nodes */}
            {adventures.map((adventure, index) => (
              <div
                key={adventure.titleKey}
                className="absolute"
                style={{
                  left: `${nodePositions[index].x}%`,
                  top: `${nodePositions[index].y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <FloatingNode
                  icon={adventure.icon}
                  status="active"
                  delay={index * 0.15}
                  floatIntensity={0.8 + (index % 3) * 0.3}
                  size="lg"
                  onClick={() => handleAdventureClick(adventure.action)}
                  reward={adventure.reward}
                  label={t(adventure.titleKey)}
                  isNew={adventure.isNew}
                  backgroundImage={adventure.backgroundImage}
                />
              </div>
            ))}

            {/* Ambient floating decorations */}
            {["🫧", "✨", "🌟", "💫"].map((deco, i) => (
              <motion.span
                key={i}
                className="absolute text-lg opacity-40 pointer-events-none select-none"
                style={{
                  left: `${10 + i * 25}%`,
                  top: `${10 + (i % 2) * 60}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.8,
                }}
              >
                {deco}
              </motion.span>
            ))}
          </div>

          {/* Mobile: Vertical trail layout */}
          <div className="md:hidden relative space-y-2">
            {adventures.map((adventure, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={adventure.titleKey} className="relative">
                  {/* Trail connector */}
                  {index < adventures.length - 1 && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 z-0"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      <div className="w-full h-full bg-gradient-to-b from-primary/40 to-primary/10" />
                    </motion.div>
                  )}

                  <motion.div
                    className={`flex items-center gap-4 ${isEven ? "flex-row" : "flex-row-reverse"}`}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12 }}
                  >
                    <FloatingNode
                      icon={adventure.icon}
                      status="active"
                      delay={index * 0.1}
                      floatIntensity={0.5}
                      size="md"
                      onClick={() => handleAdventureClick(adventure.action)}
                      isNew={adventure.isNew}
                      backgroundImage={adventure.backgroundImage}
                    />

                    <motion.div
                      className="flex-1 bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-primary/10"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAdventureClick(adventure.action)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-base font-bold text-foreground">
                          {t(adventure.titleKey)}
                        </h3>
                        {adventure.reward && (
                          <span className="text-sm">{adventure.reward}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(adventure.descriptionKey)}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </ThemedSectionWrapper>

      <RewardBurst isActive={burstActive} emoji="✨" position="center" />
      <GamesModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
      <SingAlongModal isOpen={isSongsOpen} onClose={() => setIsSongsOpen(false)} />
      <ChatWithToothy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <DentalOfficeTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
};

export default AdventuresSection;
