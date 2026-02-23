import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import { Button } from "@/components/ui/button";

interface DesignASmileGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const teethStyles = ['🦷', '😁', '💎', '⭐'];
const lipColors = ['👄', '💋', '🫦', '❤️'];
const accessories = ['✨', '🌟', '💫', '🎀', '👑', '🌈'];
const backgrounds = ['🌸', '🌊', '🌅', '🌈', '⭐', '💜'];

const DesignASmileGame = ({ game, onComplete }: DesignASmileGameProps) => {
  const { t } = useTranslation();
  const [selectedTeeth, setSelectedTeeth] = useState(0);
  const [selectedLips, setSelectedLips] = useState(0);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useGameSounds();

  const toggleAccessory = (index: number) => {
    playSound("tap");
    setSelectedAccessories(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index].slice(-3)
    );
  };

  const handleComplete = () => {
    setIsComplete(true);
    playSound("success");
    // Award stars based on creativity (number of choices made)
    const creativityScore = selectedAccessories.length;
    const stars = creativityScore >= 2 ? 3 : creativityScore >= 1 ? 2 : 1;
    setTimeout(() => onComplete(true, stars), 1500);
  };

  return (
    <div className="relative h-full w-full overflow-auto bg-gradient-to-b from-pink-100 to-purple-200 dark:from-pink-900 dark:to-purple-950 p-4">
      <div className="flex flex-col items-center justify-start pt-2">
        <h3 className="text-xl font-bold text-foreground mb-4">🎨 Design Your Perfect Smile!</h3>

        {/* Preview */}
        <motion.div 
          className="relative w-36 h-36 rounded-full flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
          }}
          animate={isComplete ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ repeat: isComplete ? Infinity : 0, duration: 1 }}
        >
          <div className="text-6xl">{backgrounds[selectedBackground]}</div>
          <div className="absolute text-5xl">{teethStyles[selectedTeeth]}</div>
          <div className="absolute bottom-12 text-3xl">{lipColors[selectedLips]}</div>
          {selectedAccessories.map((accIndex, i) => (
            <motion.div
              key={accIndex}
              className="absolute text-2xl"
              style={{
                top: `${20 + i * 15}%`,
                left: `${70 + (i % 2) * 15}%`,
              }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            >
              {accessories[accIndex]}
            </motion.div>
          ))}
        </motion.div>

        {/* Customization options */}
        <div className="w-full max-w-md space-y-4">
          {/* Teeth Style */}
          <div>
            <p className="text-sm font-medium mb-2">Teeth Style</p>
            <div className="flex gap-2 justify-center">
              {teethStyles.map((style, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedTeeth(index); playSound("tap"); }}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center ${
                    selectedTeeth === index ? 'bg-primary ring-2 ring-primary-foreground' : 'bg-card'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Lip Color */}
          <div>
            <p className="text-sm font-medium mb-2">Lip Style</p>
            <div className="flex gap-2 justify-center">
              {lipColors.map((color, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedLips(index); playSound("tap"); }}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center ${
                    selectedLips === index ? 'bg-primary ring-2 ring-primary-foreground' : 'bg-card'
                  }`}
                >
                  {color}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <p className="text-sm font-medium mb-2">Accessories (pick up to 3)</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {accessories.map((acc, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleAccessory(index)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    selectedAccessories.includes(index) ? 'bg-primary ring-2 ring-primary-foreground' : 'bg-card'
                  }`}
                >
                  {acc}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <p className="text-sm font-medium mb-2">Background</p>
            <div className="flex gap-2 justify-center">
              {backgrounds.map((bg, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedBackground(index); playSound("tap"); }}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    selectedBackground === index ? 'bg-primary ring-2 ring-primary-foreground' : 'bg-card'
                  }`}
                >
                  {bg}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          disabled={isComplete}
          className="mt-6"
          size="lg"
        >
          {isComplete ? '✨ Beautiful!' : '✅ Complete My Smile!'}
        </Button>
      </div>
    </div>
  );
};

export default DesignASmileGame;
