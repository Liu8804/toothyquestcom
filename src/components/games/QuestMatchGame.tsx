import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { gameImages } from "@/assets/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface QuestMatchGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const allCardPairs = [
  { id: "tooth", emoji: "🦷" },
  { id: "brush", emoji: "🪥" },
  { id: "floss", emoji: "🧵" },
  { id: "paste", emoji: "🧴" },
  { id: "water", emoji: "💧" },
  { id: "smile", emoji: "😁" },
  { id: "apple", emoji: "🍎" },
  { id: "dentist", emoji: "🩺" },
];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, starThresholds: [8, 12] },
  medium: { pairs: 6, starThresholds: [10, 15] },
  hard: { pairs: 8, starThresholds: [12, 18] },
};

interface Card {
  id: string;
  emoji: string;
  uniqueId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const QuestMatchGame = ({ game, onComplete }: QuestMatchGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(6);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const initializeGame = (pairCount: number) => {
    const selectedPairs = allCardPairs.slice(0, pairCount);
    const shuffledCards = [...selectedPairs, ...selectedPairs]
      .map((card, index) => ({
        ...card,
        uniqueId: index,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
  };

  useEffect(() => {
    if (gameStarted && difficulty) {
      initializeGame(config.pairs);
      setTotalPairs(config.pairs);
    }
  }, [gameStarted, difficulty]);

  useEffect(() => {
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      const [threshold3, threshold2] = config.starThresholds;
      const stars = moves <= threshold3 ? 3 : moves <= threshold2 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 500);
    }
  }, [matchedPairs, moves, onComplete, totalPairs, config.starThresholds]);

  const handleCardClick = (uniqueId: number) => {
    if (flippedCards.length === 2) return;
    
    const card = cards.find(c => c.uniqueId === uniqueId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c =>
      c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, uniqueId]);
    playSound("tap");

    if (flippedCards.length === 1) {
      setMoves(m => m + 1);
      const firstCard = cards.find(c => c.uniqueId === flippedCards[0]);
      const secondCard = cards.find(c => c.uniqueId === uniqueId);

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        playSound("success");
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstCard.id ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs(m => m + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.uniqueId === flippedCards[0] || c.uniqueId === uniqueId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    startBackgroundMusic("puzzle");
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
    const gameImage = gameImages[game.id];
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        {gameImage ? (
          <div className="w-28 h-28 mb-4 rounded-2xl overflow-hidden shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.3)] image-3d-card">
            <img src={gameImage} alt={game.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="text-6xl mb-4">{game.emoji}</div>
        )}
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {game.name}
        </h3>
        <p className="text-muted-foreground mb-6">{game.instructionsKids}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-xl"
        >
          {t("games.startMatching")}
        </motion.button>
      </div>
    );
  }

  const gridCols = totalPairs <= 4 ? 4 : totalPairs <= 6 ? 4 : 4;

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* HUD */}
      <div className="flex justify-between mb-4">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">{t("games.moves")}: {moves}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
          <span className="text-xs font-medium text-muted-foreground capitalize">{difficulty}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">
            {t("games.matched")}: {matchedPairs}/{totalPairs}
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div className={`flex-1 grid grid-cols-${gridCols} gap-2 md:gap-3`} style={{ gridTemplateColumns: `repeat(4, 1fr)` }}>
        {cards.map(card => (
          <motion.button
            key={card.uniqueId}
            onClick={() => handleCardClick(card.uniqueId)}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl md:text-4xl transition-all duration-300 ${
              card.isFlipped || card.isMatched
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            } ${card.isMatched ? 'opacity-50' : ''}`}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotateY: card.isFlipped || card.isMatched ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {card.isFlipped || card.isMatched ? (
              <motion.span
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 180 }}
              >
                {card.emoji}
              </motion.span>
            ) : (
              <span>❓</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuestMatchGame;
