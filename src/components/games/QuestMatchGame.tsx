import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Game } from "@/data/games";

interface QuestMatchGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

const cardPairs = [
  { id: "tooth", emoji: "🦷" },
  { id: "brush", emoji: "🪥" },
  { id: "floss", emoji: "🧵" },
  { id: "paste", emoji: "🧴" },
  { id: "water", emoji: "💧" },
  { id: "smile", emoji: "😁" },
];

interface Card {
  id: string;
  emoji: string;
  uniqueId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const QuestMatchGame = ({ game, onComplete }: QuestMatchGameProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);

  const initializeGame = () => {
    const shuffledCards = [...cardPairs, ...cardPairs]
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
    if (gameStarted) {
      initializeGame();
    }
  }, [gameStarted]);

  useEffect(() => {
    if (matchedPairs === cardPairs.length && matchedPairs > 0) {
      const stars = moves <= 10 ? 3 : moves <= 15 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 500);
    }
  }, [matchedPairs, moves, onComplete]);

  const handleCardClick = (uniqueId: number) => {
    if (flippedCards.length === 2) return;
    
    const card = cards.find(c => c.uniqueId === uniqueId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c =>
      c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, uniqueId]);

    if (flippedCards.length === 1) {
      setMoves(m => m + 1);
      const firstCard = cards.find(c => c.uniqueId === flippedCards[0]);
      const secondCard = cards.find(c => c.uniqueId === uniqueId);

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        // Match found
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
        // No match
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
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full text-xl"
        >
          Start Matching!
        </motion.button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* HUD */}
      <div className="flex justify-between mb-4">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">Moves: {moves}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">
            Matched: {matchedPairs}/{cardPairs.length}
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 grid grid-cols-4 gap-2 md:gap-3">
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
