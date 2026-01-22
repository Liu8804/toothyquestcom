import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface EnamelMatchGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  pattern: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ENAMEL_PATTERNS = ['💎', '🔷', '⬜', '🔶', '💠', '🔹', '⚪', '🔸'];

export const EnamelMatchGame: React.FC<EnamelMatchGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const shuffleCards = (pairCount: number): Card[] => {
    const patterns = ENAMEL_PATTERNS.slice(0, pairCount);
    const cardPairs = [...patterns, ...patterns];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    return shuffled.map((pattern, index) => ({
      id: index,
      pattern,
      isFlipped: false,
      isMatched: false,
    }));
  };

  const startGame = useCallback((diff: Difficulty) => {
    const pairCount = diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8;
    setCards(shuffleCards(pairCount));
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(diff === 'easy' ? 60 : diff === 'medium' ? 50 : 40);
    setGameOver(false);
    setDifficulty(diff);
  }, []);

  useEffect(() => {
    if (!difficulty || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, gameOver]);

  const handleCardClick = useCallback((cardId: number) => {
    if (gameOver) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      const card1 = cards.find(c => c.id === first)!;
      const card2 = cards.find(c => c.id === second)!;

      if (card1.pattern === card2.pattern) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isMatched: true } 
              : c
          ));
          setScore(s => s + 20);
          setFlippedCards([]);

          // Check if all matched
          const allMatched = cards.filter(c => !c.isMatched).length === 2;
          if (allMatched) {
            const timeBonus = timeLeft * 2;
            const moveBonus = Math.max(0, 30 - moves) * 2;
            setScore(s => s + timeBonus + moveBonus);
            setGameOver(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [cards, flippedCards, gameOver, moves, timeLeft]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ id: 'enamel_match', name: t('games.enamelMatch', 'Enamel Match'), shortDescription: '', instructionsKids: t('games.enamelMatchInstructions', 'Find the matching enamel shields and tap them!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '💎', color: '' }}
        onSelectDifficulty={startGame}
      />
    );
  }

  const allMatched = cards.every(c => c.isMatched);

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">{allMatched ? '💎' : '⏰'}</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {allMatched ? t('games.perfectMatches', 'Perfect Matches!') : t('games.timeUp', 'Time\'s Up!')}
        </h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {t('games.moves', 'Moves')}: {moves}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  const gridCols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 4;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">⏱️ {timeLeft}s</div>
        <div className="text-lg">{t('games.moves', 'Moves')}: {moves}</div>
      </div>

      <div 
        className="grid gap-2 p-4 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        <AnimatePresence>
          {cards.map(card => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${
                card.isMatched 
                  ? 'bg-green-200' 
                  : card.isFlipped 
                  ? 'bg-white' 
                  : 'bg-gradient-to-br from-cyan-400 to-teal-500'
              }`}
              whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={card.isFlipped || card.isMatched ? { rotateY: 180 } : { rotateY: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(card.isFlipped || card.isMatched) ? (
                <motion.span
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                >
                  {card.pattern}
                </motion.span>
              ) : (
                '🦷'
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {t('games.findMatchingPairs', 'Find the matching enamel patterns!')}
      </p>
    </div>
  );
};

export default EnamelMatchGame;
