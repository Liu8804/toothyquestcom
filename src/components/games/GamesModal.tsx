import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star, Trophy } from "lucide-react";
import { games, Game, globalGameText } from "@/data/games";
import GameCard from "./GameCard";
import PlaquePatrolGame from "./PlaquePatrolGame";
import ToothDefenderGame from "./ToothDefenderGame";
import FlossHeroGame from "./FlossHeroGame";
import SugarBugChaseGame from "./SugarBugChaseGame";
import BuildASmileGame from "./BuildASmileGame";
import QuestMatchGame from "./QuestMatchGame";
import { Button } from "@/components/ui/button";

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GamesModal = ({ isOpen, onClose }: GamesModalProps) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; stars: number } | null>(null);

  const handleGameComplete = (won: boolean, stars: number) => {
    setGameResult({ won, stars });
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  const handlePlayAgain = () => {
    setGameResult(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    const gameProps = {
      game: selectedGame,
      onComplete: handleGameComplete,
    };

    switch (selectedGame.id) {
      case "plaque_patrol":
        return <PlaquePatrolGame {...gameProps} />;
      case "tooth_defender":
        return <ToothDefenderGame {...gameProps} />;
      case "floss_hero":
        return <FlossHeroGame {...gameProps} />;
      case "sugar_bug_chase":
        return <SugarBugChaseGame {...gameProps} />;
      case "build_a_smile":
        return <BuildASmileGame {...gameProps} />;
      case "quest_match":
        return <QuestMatchGame {...gameProps} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              {selectedGame ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGames}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Games
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Fun Games
                  </h2>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Game Result Screen */}
              {gameResult && selectedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    animate={{ 
                      rotate: gameResult.won ? [0, -10, 10, -10, 0] : 0,
                      scale: gameResult.won ? [1, 1.2, 1] : 1 
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-8xl mb-6"
                  >
                    {gameResult.won ? "🎉" : "😅"}
                  </motion.div>
                  
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {gameResult.won ? selectedGame.winMessage : selectedGame.loseMessage}
                  </h3>
                  
                  {gameResult.won && (
                    <>
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                i < gameResult.stars
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {globalGameText.starsEarned}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Trophy className="w-5 h-5" />
                        {selectedGame.badgeName}
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" onClick={handleBackToGames}>
                      Back to Games
                    </Button>
                    <Button onClick={handlePlayAgain}>
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Active Game */}
              {selectedGame && !gameResult && (
                <div className="h-[60vh]">
                  {renderGame()}
                </div>
              )}

              {/* Game Selection Grid */}
              {!selectedGame && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {games.map((game, index) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={() => setSelectedGame(game)}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GamesModal;
