import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";

interface FlossHeroGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const FlossHeroGame = ({ game, onComplete }: FlossHeroGameProps) => {
  const { t } = useTranslation();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentGap, setCurrentGap] = useState(0);
  const [flossedGaps, setFlossedGaps] = useState<number[]>([]);
  const [isFlossing, setIsFlossing] = useState(false);
  const [flossProgress, setFlossProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const totalGaps = 5;

  const startFlossing = (gapIndex: number) => {
    if (flossedGaps.includes(gapIndex)) return;
    
    setCurrentGap(gapIndex);
    setIsFlossing(true);
    setFlossProgress(0);

    progressRef.current = setInterval(() => {
      setFlossProgress(prev => {
        if (prev >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
          setFlossedGaps(g => [...g, gapIndex]);
          setIsFlossing(false);
          
          if (flossedGaps.length + 1 >= totalGaps) {
            setTimeout(() => onComplete(true, 3), 500);
          }
          return 0;
        }
        return prev + 5;
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
          className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-full text-xl"
        >
          {t("games.startFlossing")}
        </motion.button>
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
      <div className="flex items-end justify-center gap-0 mt-16 select-none">
        {Array.from({ length: totalGaps + 1 }).map((_, i) => (
          <div key={i} className="flex items-end select-none">
            {/* Tooth */}
            <motion.div
              className="text-6xl md:text-7xl select-none"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            >
              🦷
            </motion.div>
            
            {/* Gap between teeth - Larger touch target, no selection */}
            {i < totalGaps && (
              <motion.button
                onMouseDown={(e) => { e.preventDefault(); startFlossing(i); }}
                onMouseUp={stopFlossing}
                onMouseLeave={stopFlossing}
                onTouchStart={(e) => { e.preventDefault(); startFlossing(i); }}
                onTouchEnd={stopFlossing}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative w-12 h-20 -mx-3 z-10 cursor-pointer flex items-center justify-center touch-manipulation select-none ${
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
    </div>
  );
};

export default FlossHeroGame;
