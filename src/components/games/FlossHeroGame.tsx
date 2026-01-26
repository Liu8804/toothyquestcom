import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import mascotCelebrating from "@/assets/mascot-sticker-celebrating-v2.png";
import mascotMain from "@/assets/mascot-sticker-main-v2.png";

interface FlossHeroGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, { totalGaps: number; progressSpeed: number }> = {
  easy: { totalGaps: 3, progressSpeed: 8 },
  medium: { totalGaps: 5, progressSpeed: 5 },
  hard: { totalGaps: 7, progressSpeed: 3 },
};

const FlossHeroGame = ({ game, onComplete }: FlossHeroGameProps) => {
  const { t } = useTranslation();
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentGap, setCurrentGap] = useState(0);
  const [flossedGaps, setFlossedGaps] = useState<number[]>([]);
  const [isFlossing, setIsFlossing] = useState(false);
  const [flossProgress, setFlossProgress] = useState(0);
  const [showMascotReaction, setShowMascotReaction] = useState(false);
  const [sparklePositions, setSparklePositions] = useState<{ id: number; gapIndex: number }[]>([]);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const { playSparkle, playCheer, playCelebrate, playQuestComplete } = useMascotSounds();
  const { haptic, success } = useHapticFeedback();

  const settings = difficulty ? DIFFICULTY_SETTINGS[difficulty] : null;
  const totalGaps = settings?.totalGaps || 5;

  const startFlossing = (gapIndex: number) => {
    if (flossedGaps.includes(gapIndex) || !settings) return;
    
    setCurrentGap(gapIndex);
    setIsFlossing(true);
    setFlossProgress(0);
    haptic("light");

    progressRef.current = setInterval(() => {
      setFlossProgress(prev => {
        if (prev >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
          setFlossedGaps(g => [...g, gapIndex]);
          setIsFlossing(false);
          playSound("success");
          playSparkle();
          haptic("medium");
          
          // Add sparkle effect at this gap
          const sparkleId = Date.now();
          setSparklePositions(prev => [...prev, { id: sparkleId, gapIndex }]);
          setTimeout(() => {
            setSparklePositions(prev => prev.filter(s => s.id !== sparkleId));
          }, 1000);
          
          // Show mascot thumbs-up reaction
          setShowMascotReaction(true);
          playCheer();
          setTimeout(() => setShowMascotReaction(false), 1200);
          
          if (flossedGaps.length + 1 >= totalGaps) {
            success();
            playCelebrate();
            playQuestComplete();
            const stars = difficulty === "hard" ? 3 : difficulty === "medium" ? 3 : 2;
            setTimeout(() => onComplete(true, stars), 800);
          }
          return 0;
        }
        return prev + settings.progressSpeed;
      });
    }, 100);
  };

  const stopFlossing = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    setIsFlossing(false);
    setFlossProgress(0);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameStarted(true);
    startBackgroundMusic("calm"); // Start calm background music for flossing
  };

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  if (!difficulty) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-6xl mb-4">{game.emoji}</div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <DifficultySelector game={game} onSelectDifficulty={handleDifficultySelect} />
      </div>
    );
  }

  return (
    <div 
      className="relative h-full w-full flex flex-col items-center justify-center p-6 select-none"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Progress */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-center">
          <span className="font-bold text-foreground">
            {t("games.gapsFlossed")}: {flossedGaps.length}/{totalGaps}
          </span>
        </div>
      </div>

      {/* Teeth Row */}
      <div className="flex items-end justify-center gap-0 mt-16 select-none flex-wrap">
        {Array.from({ length: totalGaps + 1 }).map((_, i) => (
          <div key={i} className="flex items-end select-none">
            {/* Tooth */}
            <motion.div
              className="w-12 h-12 md:w-14 md:h-14 select-none"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            >
              <img src={mascotMain} alt="Tooth" className="w-full h-full object-contain" />
            </motion.div>
            
            {/* Gap between teeth */}
            {i < totalGaps && (
              <motion.button
                onMouseDown={(e) => { e.preventDefault(); startFlossing(i); }}
                onMouseUp={stopFlossing}
                onMouseLeave={stopFlossing}
                onTouchStart={(e) => { e.preventDefault(); startFlossing(i); }}
                onTouchEnd={stopFlossing}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative w-10 h-16 -mx-2 z-10 cursor-pointer flex items-center justify-center touch-manipulation select-none ${
                  flossedGaps.includes(i) ? 'opacity-50' : ''
                }`}
                style={{
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                whileHover={{ scale: 1.1 }}
              >
                {currentGap === i && isFlossing ? (
                  <motion.div
                    className="absolute w-2 bg-gradient-to-b from-pink-400 to-purple-500 rounded-full"
                    style={{ height: `${flossProgress}%` }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                  />
                ) : flossedGaps.includes(i) ? (
                  <span className="text-2xl select-none">✨</span>
                ) : (
                  <div className="w-2 h-10 bg-yellow-400/50 rounded-full" />
                )}
              </motion.button>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <p className="mt-8 text-center text-muted-foreground">
        {isFlossing 
          ? `${t("games.keepHolding")} ${Math.round(flossProgress)}%` 
          : t("games.holdToFloss")}
      </p>

      {/* Floss indicator */}
      {isFlossing && (
        <motion.div
          className="absolute bottom-20 text-4xl"
          animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        >
          🧵
        </motion.div>
      )}

      {/* Mascot thumbs-up reaction */}
      <AnimatePresence>
        {showMascotReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="absolute bottom-8 right-8 flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <img
                src={mascotCelebrating}
                alt="Great job!"
                className="w-16 h-16 object-contain"
              />
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl mt-1"
            >
              👍
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating sparkle effects */}
      <AnimatePresence>
        {sparklePositions.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute pointer-events-none text-3xl"
            style={{
              left: `${20 + sparkle.gapIndex * 10}%`,
              top: "40%",
            }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FlossHeroGame;
