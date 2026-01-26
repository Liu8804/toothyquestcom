import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Game } from "@/data/games";

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultySelectorProps {
  game: Game;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

export interface DifficultySettings {
  spawnInterval: number;
  fallSpeed: number;
  timeLimit: number;
  winCondition: number;
  lives?: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, { label: string; emoji: string; color: string; description: string }> = {
  easy: {
    label: "Easy",
    emoji: "🌟",
    color: "from-green-400 to-emerald-500",
    description: "Perfect for beginners!",
  },
  medium: {
    label: "Medium",
    emoji: "⭐",
    color: "from-yellow-400 to-orange-500",
    description: "A fun challenge!",
  },
  hard: {
    label: "Hard",
    emoji: "🔥",
    color: "from-red-400 to-rose-500",
    description: "For champions!",
  },
};

// Export for backwards compatibility
export const DIFFICULTY_SETTINGS = DIFFICULTY_CONFIGS;

const DifficultySelector = forwardRef<HTMLDivElement, DifficultySelectorProps>(
  ({ game, onSelectDifficulty }, ref) => {
    return (
      <div ref={ref} className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <p className="text-center font-display font-bold text-foreground mb-2">
            Choose Your Level
          </p>
          {(Object.entries(DIFFICULTY_CONFIGS) as [Difficulty, typeof DIFFICULTY_CONFIGS.easy][]).map(
            ([key, config], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectDifficulty(key)}
                className={`w-full px-6 py-4 bg-gradient-to-r ${config.color} text-white font-bold rounded-2xl text-lg shadow-lg flex items-center gap-3`}
              >
                <span className="text-2xl">{config.emoji}</span>
                <div className="text-left">
                  <div className="font-display">{config.label}</div>
                  <div className="text-xs text-white/80">{config.description}</div>
                </div>
              </motion.button>
            )
          )}
        </div>
      </div>
    );
  }
);

DifficultySelector.displayName = "DifficultySelector";

export default DifficultySelector;
