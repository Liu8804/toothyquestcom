import { motion } from "framer-motion";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
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

const DifficultySelector = ({ onSelect }: DifficultySelectorProps) => {
  return (
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
            onClick={() => onSelect(key)}
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
  );
};

export default DifficultySelector;
