import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Game } from "@/data/games";
import { useGameSounds } from "@/hooks/useGameSounds";
import DifficultySelector, { Difficulty } from "./DifficultySelector";

interface DentalMemoryMatchGameProps {
  game: Game;
  onComplete: (won: boolean, stars: number) => void;
}

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const dentalEmojis = ["🦷", "🪥", "🧵", "💧", "🧴", "😁", "🦠", "🧀", "🥕", "🍎", "🥛", "✨"];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 4, maxMoves: 20 },
  medium: { pairs: 6, maxMoves: 25 },
  hard: { pairs: 8, maxMoves: 30 },
};

const DentalMemoryMatchGame = ({ game, onComplete }: DentalMemoryMatchGameProps) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;

  const initializeCards = (pairCount: number) => {
    const selectedEmojis = dentalEmojis.slice(0, pairCount);
    const cardPairs: Card[] = [];
    
    selectedEmojis.forEach((emoji, index) => {
      cardPairs.push(
        { id: index * 2, emoji, pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, pairId: index, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    setCards(cardPairs);
  };

  useEffect(() => {
    if (matchedPairs === config.pairs && gameStarted) {
      const stars = moves <= config.pairs * 2 ? 3 : moves <= config.pairs * 3 ? 2 : 1;
      onComplete(true, stars);
    }
  }, [matchedPairs, config.pairs, moves, onComplete, gameStarted]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    playSound("tap");

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      
      if (first.pairId === second.pairId) {
        playSound("success");
        setMatchedPairs(prev => prev + 1);
        setCards(prev => prev.map(c => 
          c.pairId === first.pairId ? { ...c, isMatched: true } : c
        ));
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    initializeCards(DIFFICULTY_CONFIG[selectedDifficulty].pairs);
    setGameStarted(true);
    startBackgroundMusic("calm"); // Start calm memory game music
  };

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  if (!difficulty) {
    return <DifficultySelector game={game} onSelectDifficulty={startGame} />;
  }

  const gridCols = config.pairs <= 4 ? 4 : config.pairs <= 6 ? 4 : 4;

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-purple-100 to-indigo-200 dark:from-purple-900 dark:to-indigo-950 p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">🃏 {matchedPairs}/{config.pairs}</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="font-bold text-foreground">👆 {moves} moves</span>
        </div>
      </div>

      <div className="flex items-center justify-center h-full pt-12">
        <div 
          className={`grid gap-2 md:gap-3`}
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            maxWidth: '400px'
          }}
        >
          {cards.map(card => (
            <motion.button
              key={card.id}
              whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl text-3xl md:text-4xl flex items-center justify-center transition-all ${
                card.isFlipped || card.isMatched
                  ? 'bg-white dark:bg-card shadow-lg'
                  : 'bg-primary hover:bg-primary/90'
              } ${card.isMatched ? 'opacity-70' : ''}`}
              style={{ minWidth: '60px', minHeight: '60px' }}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DentalMemoryMatchGame;
