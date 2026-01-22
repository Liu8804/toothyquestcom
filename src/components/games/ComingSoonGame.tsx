import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Game } from "@/data/games";
import { Button } from "@/components/ui/button";

interface ComingSoonGameProps {
  game: Game;
  onBack: () => void;
}

const ComingSoonGame = ({ game, onBack }: ComingSoonGameProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="text-8xl mb-6"
      >
        {game.emoji}
      </motion.div>
      
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">
        {game.name}
      </h2>
      
      <p className="text-lg text-muted-foreground mb-4 max-w-md">
        {game.shortDescription}
      </p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/10 to-bubble/10 rounded-2xl p-6 mb-6 max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">Coming Soon!</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          This exciting game is being developed. Check back soon to play!
        </p>
      </motion.div>
      
      {game.ageRange && (
        <p className="text-sm text-muted-foreground mb-4">
          Ages: {game.ageRange}
        </p>
      )}
      
      <div className="bg-muted/50 rounded-xl p-4 mb-6 max-w-md">
        <p className="text-sm font-medium text-foreground mb-1">
          🎓 For Parents:
        </p>
        <p className="text-sm text-muted-foreground">
          {game.instructionsParents}
        </p>
      </div>
      
      <Button onClick={onBack} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Games
      </Button>
    </div>
  );
};

export default ComingSoonGame;
