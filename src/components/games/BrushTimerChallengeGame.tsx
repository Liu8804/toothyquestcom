import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";

interface BrushTimerChallengeGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

type BrushZone = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'front' | 'back';

const zones: { id: BrushZone; label: string; emoji: string }[] = [
  { id: 'top-left', label: 'Top Left', emoji: '↖️' },
  { id: 'top-right', label: 'Top Right', emoji: '↗️' },
  { id: 'bottom-left', label: 'Bottom Left', emoji: '↙️' },
  { id: 'bottom-right', label: 'Bottom Right', emoji: '↘️' },
  { id: 'front', label: 'Front Teeth', emoji: '⬆️' },
  { id: 'back', label: 'Back Teeth', emoji: '⬇️' },
];

const DIFFICULTY_CONFIG = {
  easy: { totalTime: 60, zonesRequired: 4, timePerZone: 10 },
  medium: { totalTime: 90, zonesRequired: 5, timePerZone: 15 },
  hard: { totalTime: 120, zonesRequired: 6, timePerZone: 20 },
};

const BrushTimerChallengeGame = ({ game, onComplete }: BrushTimerChallengeGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentZone, setCurrentZone] = useState<BrushZone | null>(null);
  const [zoneProgress, setZoneProgress] = useState<Record<BrushZone, number>>({
    'top-left': 0, 'top-right': 0, 'bottom-left': 0, 
    'bottom-right': 0, 'front': 0, 'back': 0
  });
  const [isBrushing, setIsBrushing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showMascotCheer, setShowMascotCheer] = useState(false);
  const [sparkleZone, setSparkleZone] = useState<BrushZone | null>(null);
  const { playSound } = useGameSounds();
  const { playToothClean, playCheer, playCelebrate, playQuestComplete } = useMascotSounds();
  const { haptic, success } = useHapticFeedback();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
  const completedZones = Object.values(zoneProgress).filter(p => p >= 100).length;

  useEffect(() => {
    if (!gameStarted || !difficulty) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const won = completedZones >= config.zonesRequired;
          onComplete(won, won ? 3 : 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, completedZones, config.zonesRequired, onComplete, difficulty]);

  useEffect(() => {
    if (!gameStarted || !isBrushing || !currentZone) return;

    const brushInterval = setInterval(() => {
      setZoneProgress(prev => {
        const newProgress = Math.min(prev[currentZone] + 5, 100);
        if (newProgress === 100 && prev[currentZone] < 100) {
          playSound("success");
          playToothClean();
          haptic("medium");
          
          // Show mascot cheer and sparkle
          setShowMascotCheer(true);
          setSparkleZone(currentZone);
          playCheer();
          setTimeout(() => {
            setShowMascotCheer(false);
            setSparkleZone(null);
          }, 1000);
        }
        return { ...prev, [currentZone]: newProgress };
      });
    }, 100);

    return () => clearInterval(brushInterval);
  }, [gameStarted, isBrushing, currentZone, playSound]);

  useEffect(() => {
    if (completedZones >= config.zonesRequired && gameStarted) {
      success();
      playCelebrate();
      playQuestComplete();
      const stars = timeLeft > config.totalTime * 0.5 ? 3 : timeLeft > config.totalTime * 0.25 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [completedZones, config.zonesRequired, config.totalTime, timeLeft, onComplete, gameStarted, success, playCelebrate, playQuestComplete]);

  const handleZonePress = (zone: BrushZone) => {
    if (zoneProgress[zone] >= 100) return;
    setCurrentZone(zone);
    setIsBrushing(true);
    playSound("tap");
    haptic("light");
  };

  const handleZoneRelease = () => {
    setIsBrushing(false);
    setCurrentZone(null);
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeLeft(DIFFICULTY_CONFIG[selectedDifficulty].totalTime);
    setGameStarted(true);
  };

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-950 p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">✅ {completedZones}/{config.zonesRequired}</span>
        </div>
        <div className={`bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg ${timeLeft <= 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <span className="font-bold">⏱️ {formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full pt-12">
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-foreground">
            {isBrushing ? '🪥 Brushing...' : 'Hold a zone to brush!'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md">
          {zones.slice(0, config.zonesRequired).map(zone => (
            <motion.button
              key={zone.id}
              whileHover={{ scale: zoneProgress[zone.id] < 100 ? 1.05 : 1 }}
              onMouseDown={() => handleZonePress(zone.id)}
              onMouseUp={handleZoneRelease}
              onMouseLeave={handleZoneRelease}
              onTouchStart={() => handleZonePress(zone.id)}
              onTouchEnd={handleZoneRelease}
              className={`relative p-6 rounded-2xl text-center transition-all ${
                zoneProgress[zone.id] >= 100
                  ? 'bg-green-500 text-white'
                  : currentZone === zone.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground'
              }`}
            >
              <motion.span 
                className="text-3xl"
                animate={currentZone === zone.id && isBrushing ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {zone.emoji}
              </motion.span>
              <p className="text-sm font-medium mt-2">{zone.label}</p>
              
              {/* Sparkle effect when zone completed */}
              <AnimatePresence>
                {sparkleZone === zone.id && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                          y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
                      >
                        ✨
                      </motion.span>
                    ))}
                  </>
                )}
              </AnimatePresence>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted rounded-b-2xl overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${zoneProgress[zone.id]}%` }}
                />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 text-center relative">
          <motion.div 
            className="w-20 h-20 mx-auto mb-2"
            animate={isBrushing ? { rotate: [-5, 5, -5] } : { y: [0, -5, 0] }}
            transition={{ duration: isBrushing ? 0.2 : 2, repeat: Infinity }}
          >
            <img src={mascotMain} alt="Toothy" className="w-full h-full object-contain" />
          </motion.div>
          <p className="text-sm text-muted-foreground">Keep brushing to clean all zones!</p>
          
          {/* Mascot cheer reaction */}
          <AnimatePresence>
            {showMascotCheer && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -right-4 top-0"
              >
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src={mascotCelebrating}
                    alt="Great job!"
                    className="w-14 h-14 object-contain"
                  />
                </motion.div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  className="absolute -top-2 -right-2 text-lg"
                >
                  🎉
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BrushTimerChallengeGame;
