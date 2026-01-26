import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';
import { useGameSounds } from '@/hooks/useGameSounds';

interface EnamelMatchGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  pattern: string;
  label: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Clear, distinct items that kids can easily identify
const MATCH_ITEMS = [
  { emoji: '🦷', label: 'Tooth', color: 'bg-white' },
  { emoji: '🪥', label: 'Brush', color: 'bg-blue-200' },
  { emoji: '✨', label: 'Sparkle', color: 'bg-yellow-200' },
  { emoji: '💧', label: 'Water', color: 'bg-cyan-200' },
  { emoji: '😁', label: 'Smile', color: 'bg-pink-200' },
  { emoji: '🍎', label: 'Apple', color: 'bg-red-200' },
  { emoji: '🧵', label: 'Floss', color: 'bg-purple-200' },
  { emoji: '❤️', label: 'Heart', color: 'bg-rose-200' },
];

export const EnamelMatchGame: React.FC<EnamelMatchGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const { playSound, playWinFanfare, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const shuffleCards = (pairCount: number): Card[] => {
    const items = MATCH_ITEMS.slice(0, pairCount);
    const cardPairs = [...items, ...items];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    return shuffled.map((item, index) => ({
      id: index,
      pattern: item.emoji,
      label: item.label,
      color: item.color,
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
    setTimeLeft(diff === 'easy' ? 90 : diff === 'medium' ? 75 : 60);
    setGameOver(false);
    setIsChecking(false);
    setDifficulty(diff);
    startBackgroundMusic("calm");
  }, [startBackgroundMusic]);

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

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
    if (gameOver || isChecking) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

    playSound("tap");
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      const card1 = cards.find(c => c.id === first)!;
      const card2 = cards.find(c => c.id === second)!;

      if (card1.pattern === card2.pattern) {
        playSound("success");
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isMatched: true } 
              : c
          ));
          setScore(s => s + 25);
          setFlippedCards([]);
          setIsChecking(false);

          const allMatched = cards.filter(c => !c.isMatched).length === 2;
          if (allMatched) {
            const timeBonus = timeLeft * 2;
            const moveBonus = Math.max(0, 30 - moves) * 2;
            setScore(s => s + timeBonus + moveBonus);
            setGameOver(true);
            stopBackgroundMusic();
            playWinFanfare();
          }
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, gameOver, moves, timeLeft, isChecking, playSound, playWinFanfare, stopBackgroundMusic]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'enamel_match', 
          name: t('games.enamelMatch', 'Memory Match'), 
          shortDescription: '', 
          instructionsKids: t('games.enamelMatchInstructions', 'Find the matching pairs! Tap 2 cards to flip them. Match the same pictures!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🎴', 
          color: '' 
        }}
        onSelectDifficulty={startGame}
      />
    );
  }

  const allMatched = cards.every(c => c.isMatched);
  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">{allMatched ? '🎉' : '⏰'}</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {allMatched ? t('games.perfectMatches', 'All Matched!') : t('games.timeUp', 'Time\'s Up!')}
        </h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Matched {matchedPairs}/{totalPairs} pairs in {moves} moves
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  const gridCols = difficulty === 'easy' ? 4 : 4;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Stats */}
      <div className="flex justify-between w-full max-w-xs bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">⏱️ {timeLeft}s</div>
        <div className="text-lg font-bold">👆 {moves}</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 rounded-xl p-3 max-w-xs">
        <p className="font-bold text-primary mb-1">🎴 Memory Match!</p>
        <p className="text-sm">Tap 2 cards to find matching pairs!</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2">
        <span className="text-sm font-medium">Matched:</span>
        <span className="font-bold text-green-600">{matchedPairs}</span>
        <span>/</span>
        <span>{totalPairs}</span>
        <span className="text-lg">pairs</span>
      </div>

      {/* Card Grid */}
      <div 
        className="grid gap-3 p-4 bg-gradient-to-br from-cyan-100 to-teal-200 dark:from-cyan-900/50 dark:to-teal-900/50 rounded-2xl shadow-lg"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        <AnimatePresence>
          {cards.map(card => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || isChecking}
              className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-md border-2 ${
                card.isMatched 
                  ? `${card.color} border-green-400` 
                  : card.isFlipped 
                    ? `${card.color} border-blue-400`
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500 border-indigo-300'
              }`}
              whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {(card.isFlipped || card.isMatched) ? (
                <motion.div
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-3xl">{card.pattern}</span>
                  <span className="text-[10px] font-bold">{card.label}</span>
                </motion.div>
              ) : (
                <motion.div className="flex flex-col items-center">
                  <span className="text-2xl">❓</span>
                  <span className="text-[10px] font-bold text-white">Tap!</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {isChecking ? '🤔 Checking...' : 'Tap cards to find matches!'}
      </p>
    </div>
  );
};

export default EnamelMatchGame;
