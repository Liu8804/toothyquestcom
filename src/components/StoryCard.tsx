import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { Story } from "@/data/stories";

interface StoryCardProps {
  story: Story;
  index: number;
  onClick: () => void;
}

const StoryCard = ({ story, index, onClick }: StoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-float transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        {/* Story illustration */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-bubble/20">
          <img
            src={story.illustrationPath}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback to emoji display if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center text-7xl">
            {story.emoji}
          </div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          
          {/* Story number badge */}
          <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shadow-lg">
            {index + 1}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{story.emoji}</span>
            <h3 className="font-display text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {story.title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {story.story.slice(0, 80)}...
          </p>

          {/* Read button */}
          <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
            <BookOpen className="w-4 h-4" />
            <span>Read Story</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;
