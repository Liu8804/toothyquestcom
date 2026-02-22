import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import BraceyMascot from "@/components/BraceyMascot";
import BracesFoodQuizGame from "@/components/games/BracesFoodQuizGame";

interface BracesTip {
  id: string;
  titleKey: string;
  descriptionKey: string;
  messageKey: string;
  icon: string;
  animation: "brush" | "floss" | "rinse" | "food" | "protect" | "smile";
  color: string;
}

const bracesTips: BracesTip[] = [
  {
    id: "brush",
    titleKey: "bracesCare.tips.brush.title",
    descriptionKey: "bracesCare.tips.brush.description",
    messageKey: "bracesCare.tips.brush.message",
    icon: "🪥",
    animation: "brush",
    color: "from-primary to-secondary",
  },
  {
    id: "floss",
    titleKey: "bracesCare.tips.floss.title",
    descriptionKey: "bracesCare.tips.floss.description",
    messageKey: "bracesCare.tips.floss.message",
    icon: "🧵",
    animation: "floss",
    color: "from-mint to-primary",
  },
  {
    id: "rinse",
    titleKey: "bracesCare.tips.rinse.title",
    descriptionKey: "bracesCare.tips.rinse.description",
    messageKey: "bracesCare.tips.rinse.message",
    icon: "💧",
    animation: "rinse",
    color: "from-sky to-mint",
  },
  {
    id: "avoid",
    titleKey: "bracesCare.tips.avoid.title",
    descriptionKey: "bracesCare.tips.avoid.description",
    messageKey: "bracesCare.tips.avoid.message",
    icon: "🍬",
    animation: "food",
    color: "from-candy to-sunset",
  },
  {
    id: "protect",
    titleKey: "bracesCare.tips.protect.title",
    descriptionKey: "bracesCare.tips.protect.description",
    messageKey: "bracesCare.tips.protect.message",
    icon: "🛡️",
    animation: "protect",
    color: "from-secondary to-accent",
  },
  {
    id: "visit",
    titleKey: "bracesCare.tips.visit.title",
    descriptionKey: "bracesCare.tips.visit.description",
    messageKey: "bracesCare.tips.visit.message",
    icon: "🏥",
    animation: "smile",
    color: "from-accent to-primary",
  },
];

// Braces Care Illustration Component with real images
const BracesCareIllustration = ({ activeTip }: { activeTip: string }) => {
  // Map tips to specific images
  const imageMap: Record<string, string> = {
    brush: "/braces/braces-care-hero.webp",
    floss: "/braces/braces-care-progress.webp",
    rinse: "/braces/braces-care-doctor.webp",
    avoid: "/braces/braces-tips-infographic.webp",
    protect: "/braces/braces-adventure.webp",
    visit: "/braces/orthodontic-fun.webp",
  };

  const currentImage = imageMap[activeTip] || imageMap.brush;

  return (
    <motion.div 
      className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden shadow-lg"
      key={activeTip}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <img 
        src={currentImage}
        alt="Braces care illustration"
        className="w-full h-full object-cover"
      />
      {/* Overlay removed for cleaner look */}
    </motion.div>
  );
};

// Tip Card Component
const TipCard = ({ 
  tip, 
  index, 
  isActive, 
  onClick,
  t
}: { 
  tip: BracesTip; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
  t: (key: string) => string;
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-2xl p-5 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-br ' + tip.color + ' text-white shadow-float scale-105' 
          : 'bg-card shadow-card hover:shadow-float hover:-translate-y-1'
        }
      `}
    >
      <div className="text-3xl mb-3">
        {tip.icon}
      </div>

      <h3 className={`font-display text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-foreground'}`}>
        {t(tip.titleKey)}
      </h3>

      <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-muted-foreground'}`}>
        {t(tip.descriptionKey)}
      </p>

    </div>
  );
};

const BracesCareSection = () => {
  const { t } = useTranslation();
  const [activeTip, setActiveTip] = useState<string>("brush");
  const [showQuiz, setShowQuiz] = useState(false);

  const activeTipData = bracesTips.find(tip => tip.id === activeTip);

  return (
    <section id="braces-care" className="py-12 bg-gradient-to-b from-muted/30 to-background overflow-hidden relative">
      {/* Floating mascots removed for cleaner look */}

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {/* Centered Bracey at top */}
          <div className="flex justify-center mb-6">
            <BraceyMascot 
              mood="excited" 
              size="lg" 
              message={t("bracesCare.welcome")}
              showMessage={true}
            />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("bracesCare.title")}{" "}
            <span className="text-primary">
              {t("bracesCare.titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("bracesCare.subtitle")}
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Animation Display */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-muted/50 rounded-3xl p-8 shadow-card">
              <BracesCareIllustration activeTip={activeTip} />
              
              {/* Bracey with tip-specific message */}
              <div className="flex justify-center mt-6">
                <BraceyMascot 
                  mood={activeTip === "avoid" ? "thinking" : "happy"} 
                  size="sm" 
                  message={activeTipData ? t(activeTipData.messageKey) : ""} 
                  showMessage={true}
                />
              </div>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="order-1 lg:order-2">
            <div className="grid sm:grid-cols-2 gap-4">
              {bracesTips.map((tip, index) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  index={index}
                  isActive={activeTip === tip.id}
                  onClick={() => setActiveTip(tip.id)}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Food Quiz Game Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BraceyMascot 
                mood="excited" 
                size="md" 
                message={t("bracesCare.readyToTest")}
                showMessage={true}
              />
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("bracesCare.quizTitle")}
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("bracesCare.quizSubtitle")}
            </p>
          </div>

          <AnimatePresence>
            {showQuiz ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <BracesFoodQuizGame onClose={() => setShowQuiz(false)} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                  <Button
                    onClick={() => setShowQuiz(true)}
                    size="lg"
                    className="gap-3 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Gamepad2 className="w-6 h-6" />
                    {t("bracesCare.playQuiz")}
                  </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fun fact footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-muted/50 px-6 py-4 rounded-2xl">
            <BraceyMascot mood="winking" size="sm" showMessage={false} />
            <p className="text-muted-foreground text-left text-sm">
              <span className="font-bold text-foreground">Fun Fact:</span> Most kids wear braces for 1-3 years. 
              Taking great care of them means a <span className="text-primary font-bold">beautiful smile</span> when they come off! 
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BracesCareSection;
