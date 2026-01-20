import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Sword, Map, Trophy, Scroll, Lock, CheckCircle, Smile } from "lucide-react";
import type { Story } from "@/data/stories";
import { FREE_QUEST_LIMIT } from "@/hooks/usePurchase";
import { isBracesQuest } from "./BracesQuestEffects";

interface StoryCardProps {
  story: Story;
  index: number;
  onClick: () => void;
  isCompleted?: boolean;
  isLocked?: boolean;
}

const questIcons = [Sword, Map, Trophy, Scroll];

const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(({ story, index, onClick, isCompleted = false, isLocked = false }, ref) => {
  const QuestIcon = questIcons[index % questIcons.length];
  const isFreeQuest = story.isFree === true || index < FREE_QUEST_LIMIT;
  const isBraces = isBracesQuest(story.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: isLocked ? 1 : 1.03, y: isLocked ? 0 : -8 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={onClick}
      className={`cursor-pointer group ${isLocked ? 'opacity-75' : ''}`}
    >
      <div className={`relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl overflow-hidden shadow-card hover:shadow-float transition-all duration-300 border-2 ${
        isCompleted 
          ? 'border-green-500/50 hover:border-green-500' 
          : isLocked 
            ? 'border-muted/50 hover:border-muted' 
            : isBraces
              ? 'border-pink-400/50 hover:border-pink-500'
              : 'border-primary/20 hover:border-primary/50'
      }`}>
        {/* Quest banner */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isCompleted 
            ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-400' 
            : isLocked
              ? 'bg-gradient-to-r from-muted via-muted-foreground/30 to-muted'
              : isBraces
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400'
                : 'bg-gradient-to-r from-primary via-secondary to-accent'
        }`} />
        
        {/* Story illustration */}
        <div className={`relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 ${isLocked ? 'grayscale' : ''}`}>
          <img
            src={story.illustrationPath}
            alt={story.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${isLocked ? '' : 'group-hover:scale-110'}`}
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
            <div className={`w-10 h-10 rounded-xl ${
              isCompleted 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : isLocked
                  ? 'bg-gradient-to-br from-muted to-muted-foreground/50'
                  : isBraces
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                    : 'bg-gradient-to-br from-primary to-primary/80'
            } text-primary-foreground flex items-center justify-center font-display font-bold text-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : isBraces ? <Smile className="w-5 h-5" /> : index + 1}
            </div>
            <div className={`${
              isBraces
                ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                : isFreeQuest 
                  ? 'bg-green-500/90' 
                  : 'bg-secondary/90'
            } backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md`}>
              {isBraces ? '🦷 BRACES' : isFreeQuest ? 'FREE' : 'PREMIUM'}
            </div>
          </div>
          
          {/* Difficulty stars */}
          <div className="absolute top-3 right-3 flex gap-0.5">
            {[...Array(Math.min(3, Math.floor(index / 3) + 1))].map((_, i) => (
              <span key={i} className={`text-sm drop-shadow-md ${isLocked ? 'text-muted-foreground' : isBraces ? 'text-pink-400' : 'text-yellow-400'}`}>⭐</span>
            ))}
          </div>
          
          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">
                  Complete first 5 quests
                </p>
              </div>
            </div>
          )}
          
          {/* Completed overlay */}
          {isCompleted && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-green-500/90 flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${isLocked ? 'bg-muted' : 'bg-primary/10'} flex items-center justify-center`}>
              {isLocked ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <QuestIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <h3 className={`font-display text-lg font-bold line-clamp-1 transition-colors ${
              isLocked ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'
            }`}>
              {story.title}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {story.story.slice(0, 80)}...
          </p>

          {/* Start quest button */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 font-bold text-sm transition-all px-3 py-2 rounded-xl ${
              isCompleted 
                ? 'bg-green-500/10 text-green-600' 
                : isLocked
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary group-hover:gap-3'
            }`}>
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed!</span>
                </>
              ) : isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Scroll className="w-4 h-4" />
                  <span>Start Quest</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </>
              )}
            </div>
            
            {/* XP reward badge */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
              isCompleted 
                ? 'bg-green-500/20 text-green-600' 
                : 'bg-accent/20 text-accent-foreground'
            }`}>
              <Trophy className={`w-3 h-3 ${isCompleted ? 'text-green-500' : 'text-accent'}`} />
              <span>{isCompleted ? '✓' : '+'}{(index + 1) * 10} XP</span>
            </div>
          </div>
        </div>
        
        {/* Corner decoration */}
        <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl ${
          isCompleted 
            ? 'bg-gradient-to-tl from-green-500/10 to-transparent' 
            : 'bg-gradient-to-tl from-primary/10 to-transparent'
        }`} />
      </div>
    </motion.div>
  );
});

StoryCard.displayName = "StoryCard";

export default StoryCard;
