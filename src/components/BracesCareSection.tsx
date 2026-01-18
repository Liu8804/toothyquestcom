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

// Animated Braces Mouth Component
const AnimatedBracesMouth = ({ activeAnimation }: { activeAnimation: string }) => {
  return (
    <div className="relative w-64 h-48 mx-auto">
      {/* Mouth outline */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-pink-200 to-pink-300 rounded-[50%] border-4 border-pink-400"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Teeth row - top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`top-${i}`}
            className="relative"
            animate={
              activeAnimation === "brush"
                ? { y: [0, -2, 0], rotate: [0, 5, -5, 0] }
                : {}
            }
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-6 h-8 bg-white rounded-b-lg border-2 border-gray-200 shadow-sm" />
            <motion.div
              className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-400 rounded-sm border border-gray-500"
              animate={
                activeAnimation === "smile"
                  ? { backgroundColor: ["#9CA3AF", "#EC4899", "#8B5CF6", "#3B82F6", "#9CA3AF"] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            />
            {i < 5 && (
              <div className="absolute top-4 left-6 w-2 h-0.5 bg-gray-500" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Teeth row - bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bottom-${i}`}
            className="relative"
            animate={
              activeAnimation === "brush"
                ? { y: [0, 2, 0], rotate: [0, -5, 5, 0] }
                : {}
            }
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-6 h-7 bg-white rounded-t-lg border-2 border-gray-200 shadow-sm" />
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-3 bg-gray-400 rounded-sm border border-gray-500"
              animate={
                activeAnimation === "smile"
                  ? { backgroundColor: ["#9CA3AF", "#10B981", "#F59E0B", "#EF4444", "#9CA3AF"] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Toothbrush animation */}
      {activeAnimation === "brush" && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 right-0"
          initial={{ x: 50, opacity: 0 }}
          animate={{ 
            x: [50, -20, 50],
            y: [0, -10, 10, 0],
            rotate: [0, -15, 15, 0],
            opacity: 1 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-4xl">🪥</div>
          <motion.span
            className="absolute -top-2 -left-2 text-lg"
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ✨
          </motion.span>
        </motion.div>
      )}

      {/* Floss animation */}
      {activeAnimation === "floss" && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
          animate={{ 
            y: [-30, 30, -30],
            scaleY: [1, 1.2, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1 h-16 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full" />
        </motion.div>
      )}

      {/* Rinse animation */}
      {activeAnimation === "rinse" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute w-3 h-3 bg-blue-300/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [-10, -30],
                x: [0, (Math.random() - 0.5) * 20],
                opacity: [0.8, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </>
      )}

      {/* Food warning animation */}
      {activeAnimation === "food" && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <div className="relative">
            <span className="text-4xl">🍬</span>
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🚫
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Protect animation */}
      {activeAnimation === "protect" && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-6xl opacity-60">🛡️</div>
        </motion.div>
      )}

      {/* Smile/celebration animation */}
      {activeAnimation === "smile" && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={`star-${i}`}
              className="absolute text-xl"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              ⭐
            </motion.span>
          ))}
        </>
      )}
    </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-2xl p-5 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-br ' + tip.color + ' text-white shadow-float scale-105' 
          : 'bg-card shadow-card hover:shadow-float hover:-translate-y-1'
        }
      `}
    >
      <motion.div
        className="text-4xl mb-3"
        animate={isActive ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        {tip.icon}
      </motion.div>

      <h3 className={`font-display text-lg font-bold mb-2 ${isActive ? 'text-white' : 'text-foreground'}`}>
        {t(tip.titleKey)}
      </h3>

      <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-muted-foreground'}`}>
        {t(tip.descriptionKey)}
      </p>

      {isActive && (
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      )}
    </motion.div>
  );
};

const BracesCareSection = () => {
  const { t } = useTranslation();
  const [activeTip, setActiveTip] = useState<string>("brush");
  const [showQuiz, setShowQuiz] = useState(false);

  const activeTipData = bracesTips.find(tip => tip.id === activeTip);

  return (
    <section id="braces-care" className="py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden relative">
      {/* Floating Bracey mascots */}
      <motion.div
        className="absolute top-10 left-10 hidden lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <BraceyMascot 
          mood="winking" 
          size="sm" 
          message={t("bracesCare.braceyMessages.help")}
          autoRotateMessages 
          messages={[
            t("bracesCare.braceyMessages.help"),
            t("bracesCare.braceyMessages.cool"),
            t("bracesCare.braceyMessages.doThis")
          ]}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-10 hidden lg:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <BraceyMascot 
          mood="encouraging" 
          size="sm" 
          message={t("bracesCare.braceyMessages.great")}
          autoRotateMessages
          messages={[
            t("bracesCare.braceyMessages.great"),
            t("bracesCare.braceyMessages.keepUp"),
            t("bracesCare.braceyMessages.expert")
          ]}
        />
      </motion.div>

      <div className="container mx-auto px-4">
        {/* Header with Bracey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Centered Bracey at top */}
          <div className="flex justify-center mb-6">
            <BraceyMascot 
              mood="excited" 
              size="lg" 
              message={t("bracesCare.welcome")}
              showMessage={true}
            />
          </div>

          <motion.span 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-600 px-4 py-2 rounded-full text-sm font-bold mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-lg">🦷</span>
            {t("bracesCare.badge")}
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("bracesCare.title")}{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {t("bracesCare.titleHighlight")}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("bracesCare.subtitle")}
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Animation Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 shadow-card">
              <AnimatedBracesMouth activeAnimation={activeTipData?.animation || "brush"} />
              
              {/* Bracey with tip-specific message */}
              <motion.div
                key={activeTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <BraceyMascot 
                  mood={activeTip === "avoid" ? "thinking" : "happy"} 
                  size="sm" 
                  message={activeTipData ? t(activeTipData.messageKey) : ""} 
                  showMessage={true}
                />
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-4 -left-4 text-3xl"
                animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🪥
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 text-3xl"
                animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                ✨
              </motion.div>
            </div>
          </motion.div>

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
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
                  className="gap-3 px-8 py-6 text-lg rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Gamepad2 className="w-6 h-6" />
                  {t("bracesCare.playQuiz")}
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    🎯
                  </motion.span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fun fact footer with Bracey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 rounded-2xl">
            <BraceyMascot mood="winking" size="sm" showMessage={false} />
            <p className="text-muted-foreground text-left">
              <span className="font-bold text-foreground">Fun Fact:</span> Most kids wear braces for 1-3 years. 
              Taking great care of them means a <span className="text-pink-500 font-bold">beautiful smile</span> when they come off! 
            </p>
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              😁
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BracesCareSection;
