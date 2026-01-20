import { useState } from "react";
import { motion } from "framer-motion";
import { Game } from "@/data/games";
import { Button } from "@/components/ui/button";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface BuildASmileGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const teethOptions = [
  { id: "sparkly", emoji: "✨🦷✨", label: "Sparkly Clean", isHealthy: true },
  { id: "yellow", emoji: "😬", label: "Yellow Teeth", isHealthy: false },
  { id: "happy", emoji: "😁", label: "Happy Smile", isHealthy: true },
];

const gumsOptions = [
  { id: "pink", emoji: "💗", label: "Pink & Healthy", isHealthy: true },
  { id: "red", emoji: "🔴", label: "Red & Sore", isHealthy: false },
  { id: "strong", emoji: "💪", label: "Strong Gums", isHealthy: true },
];

const habitsOptions = [
  { id: "brush", emoji: "🪥", label: "Brush Daily", isHealthy: true },
  { id: "candy", emoji: "🍭", label: "Lots of Candy", isHealthy: false },
  { id: "water", emoji: "💧", label: "Drink Water", isHealthy: true },
  { id: "floss", emoji: "🧵", label: "Floss Daily", isHealthy: true },
  { id: "soda", emoji: "🥤", label: "Sugary Drinks", isHealthy: false },
  { id: "dentist", emoji: "🩺", label: "Visit Dentist", isHealthy: true },
];

const DIFFICULTY_CONFIG = {
  easy: { steps: 2, requiredHabits: 1 },
  medium: { steps: 3, requiredHabits: 2 },
  hard: { steps: 3, requiredHabits: 3 },
};

const BuildASmileGame = ({ game, onComplete }: BuildASmileGameProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTeeth, setSelectedTeeth] = useState<string | null>(null);
  const [selectedGums, setSelectedGums] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const maxSteps = config.steps;

  const handleTeethSelect = (id: string) => {
    setSelectedTeeth(id);
  };

  const handleGumsSelect = (id: string) => {
    setSelectedGums(id);
  };

  const handleHabitToggle = (id: string) => {
    setSelectedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const nextStep = () => {
    if (step < maxSteps - 1) {
      setStep(step + 1);
    } else {
      // Calculate score
      const teethChoice = teethOptions.find(t => t.id === selectedTeeth);
      const gumsChoice = gumsOptions.find(g => g.id === selectedGums);
      const healthyHabits = selectedHabits.filter(h => 
        habitsOptions.find(opt => opt.id === h)?.isHealthy
      );
      
      let correctChoices = 0;
      if (teethChoice?.isHealthy) correctChoices++;
      if (maxSteps >= 3 && gumsChoice?.isHealthy) correctChoices++;
      if (healthyHabits.length >= config.requiredHabits) correctChoices++;
      
      const isWin = correctChoices >= maxSteps;
      const stars = correctChoices >= maxSteps ? 3 : correctChoices >= maxSteps - 1 ? 2 : 1;
      
      onComplete(isWin, stars);
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={game}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-full text-xl"
        >
          Build a Smile!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-6">
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-4">
        {[...Array(maxSteps)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <div className="text-center mb-2">
        <span className="text-xs font-medium text-muted-foreground capitalize px-2 py-1 bg-muted rounded-full">{difficulty}</span>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="font-display text-xl font-bold mb-4">Choose Your Teeth!</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {teethOptions.map(option => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeethSelect(option.id)}
                  className={`p-4 rounded-2xl border-2 ${
                    selectedTeeth === option.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <p className="text-sm">{option.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && maxSteps >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="font-display text-xl font-bold mb-4">Choose Your Gums!</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {gumsOptions.map(option => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGumsSelect(option.id)}
                  className={`p-4 rounded-2xl border-2 ${
                    selectedGums === option.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <p className="text-sm">{option.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {((step === 1 && maxSteps === 2) || (step === 2 && maxSteps === 3)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h3 className="font-display text-xl font-bold mb-4">Pick Healthy Habits!</h3>
            <p className="text-sm text-muted-foreground mb-4">Select at least {config.requiredHabits}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {habitsOptions.map(option => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleHabitToggle(option.id)}
                  className={`p-4 rounded-2xl border-2 ${
                    selectedHabits.includes(option.id) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <p className="text-sm">{option.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={nextStep}
        disabled={
          (step === 0 && !selectedTeeth) ||
          (step === 1 && maxSteps >= 3 && !selectedGums) ||
          ((step === 1 && maxSteps === 2) || (step === 2 && maxSteps === 3)) && selectedHabits.length < config.requiredHabits
        }
        className="w-full mt-4"
      >
        {step === maxSteps - 1 ? "Build My Smile!" : "Next"}
      </Button>
    </div>
  );
};

export default BuildASmileGame;
