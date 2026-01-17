import { motion } from "framer-motion";
import { Play, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingBubbles from "@/components/FloatingBubbles";
import StarRating from "@/components/StarRating";
import toothyQuestLogo from "@/assets/toothyquest-logo.jpeg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-sky overflow-hidden">
      <FloatingBubbles />
      
      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-candy/30 blur-xl" />
      <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-mint/30 blur-xl" />
      <div className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-accent/30 blur-xl" />

      <div className="container mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* Header */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-2">
            <img 
              src={toothyQuestLogo} 
              alt="ToothyQuest Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#adventures" className="text-foreground/80 hover:text-primary font-semibold transition-colors">
              Adventures
            </a>
            <a href="#facts" className="text-foreground/80 hover:text-primary font-semibold transition-colors">
              Fun Facts
            </a>
            <a href="#games" className="text-foreground/80 hover:text-primary font-semibold transition-colors">
              Games
            </a>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-8">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent-foreground">
                For brave little heroes ages 3-9!
              </span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-gradient-hero">ToothyQuest!</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Join your friendly tooth mascot on exciting quests to learn about dental health! Explore brushing, flossing, healthy eating, and more while earning rewards for every adventure. Let's make dental care fun! 🌟
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button variant="hero" size="xl">
                <Play className="w-6 h-6" />
                Start Adventure
              </Button>
              <Button variant="outline" size="xl">
                <Heart className="w-6 h-6" />
                Meet Toothy
              </Button>
            </div>

            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <StarRating count={5} size="md" />
              <span className="text-sm text-muted-foreground font-medium">
                Loved by 10,000+ little heroes!
              </span>
            </div>
          </motion.div>

          {/* Right Content - Main Logo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 flex justify-center relative"
          >
          <div className="relative flex flex-col items-center">
              <motion.img
                src={toothyQuestLogo}
                alt="ToothyQuest - Friendly Tooth Character"
                className="w-72 md:w-96 lg:w-[28rem] h-auto drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Greeting text under logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Hi! I'm Toothy. 
                  <span className="text-primary"> Ready for an adventure?</span> 🌟
                </p>
              </motion.div>
              
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -top-4 -right-4 bg-card rounded-2xl p-3 shadow-float"
              >
                <span className="text-2xl">🎮</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-3 shadow-float"
              >
                <span className="text-2xl">📚</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute top-1/2 -right-8 bg-card rounded-2xl p-3 shadow-float"
              >
                <span className="text-2xl">⭐</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
