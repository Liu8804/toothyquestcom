import { motion } from "framer-motion";
import { Sword, Map, Trophy, Scroll } from "lucide-react";
import type { Story } from "@/data/stories";

interface StoryCardProps {
  story: Story;
  index: number;
  onClick: () => void;
}

const questIcons = [Sword, Map, Trophy, Scroll];

const StoryCard = ({ story, index, onClick }: StoryCardProps) => {
  const QuestIcon = questIcons[index % questIcons.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl overflow-hidden shadow-card hover:shadow-float transition-all duration-300 border-2 border-primary/20 hover:border-primary/50">
        {/* Quest banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        {/* Story illustration */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={story.illustrationPath}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center text-7xl">
            {story.emoji}
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          
          {/* Quest badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-display font-bold text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
              {index + 1}
            </div>
            <div className="bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-2 py-1 rounded-lg text-xs font-bold shadow-md">
              QUEST
            </div>
          </div>
          
          {/* Difficulty stars */}
          <div className="absolute top-3 right-3 flex gap-0.5">
            {[...Array(Math.min(3, Math.floor(index / 3) + 1))].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm drop-shadow-md">⭐</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <QuestIcon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {story.title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {story.story.slice(0, 80)}...
          </p>

          {/* Start quest button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all bg-primary/10 px-3 py-2 rounded-xl">
              <Scroll className="w-4 h-4" />
              <span>Start Quest</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </div>
            
            {/* XP reward badge */}
            <div className="flex items-center gap-1 bg-accent/20 text-accent-foreground px-2 py-1 rounded-lg text-xs font-bold">
              <Trophy className="w-3 h-3 text-accent" />
              <span>+{(index + 1) * 10} XP</span>
            </div>
          </div>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl" />
      </div>
    </motion.div>
  );
};

export default StoryCard;