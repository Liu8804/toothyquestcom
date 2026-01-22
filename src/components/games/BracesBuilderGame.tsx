import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface BracesBuilderGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface BracesPart {
  id: string;
  name: string;
  emoji: string;
  color: string;
  placed: boolean;
  targetSlot: number;
}

const BRACES_PARTS: BracesPart[] = [
  { id: 'bracket1', name: 'Blue Bracket', emoji: '🔷', color: 'bg-blue-400', placed: false, targetSlot: 0 },
  { id: 'bracket2', name: 'Silver Bracket', emoji: '⬜', color: 'bg-gray-300', placed: false, targetSlot: 1 },
  { id: 'bracket3', name: 'Purple Bracket', emoji: '🟣', color: 'bg-purple-400', placed: false, targetSlot: 2 },
  { id: 'wire1', name: 'Top Wire', emoji: '〰️', color: 'bg-slate-400', placed: false, targetSlot: 3 },
  { id: 'wire2', name: 'Bottom Wire', emoji: '➰', color: 'bg-slate-500', placed: false, targetSlot: 4 },
  { id: 'band1', name: 'Pink Band', emoji: '💗', color: 'bg-pink-400', placed: false, targetSlot: 5 },
  { id: 'band2', name: 'Green Band', emoji: '💚', color: 'bg-green-400', placed: false, targetSlot: 6 },
  { id: 'band3', name: 'Orange Band', emoji: '🧡', color: 'bg-orange-400', placed: false, targetSlot: 7 },
];

export const BracesBuilderGame: React.FC<BracesBuilderGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [parts, setParts] = useState<BracesPart[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const startGame = useCallback((diff: Difficulty) => {
    const partCount = diff === 'easy' ? 4 : diff === 'medium' ? 6 : 8;
    const shuffledParts = [...BRACES_PARTS]
      .slice(0, partCount)
      .map((p, i) => ({ ...p, targetSlot: i, placed: false }))
      .sort(() => Math.random() - 0.5);
    
    setParts(shuffledParts);
    setSlots(new Array(partCount).fill(null));
    setSelectedPart(null);
    setScore(0);
    setMistakes(0);
    setCompleted(false);
    setTimeLeft(diff === 'easy' ? 90 : diff === 'medium' ? 60 : 45);
    setDifficulty(diff);
  }, []);

  React.useEffect(() => {
    if (!difficulty || completed || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setCompleted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, completed, timeLeft]);

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (!selectedPart || slots[slotIndex] !== null) return;

    const part = parts.find(p => p.id === selectedPart);
    if (!part) return;

    const isCorrect = part.targetSlot === slotIndex;
    
    if (isCorrect) {
      setSlots(prev => {
        const newSlots = [...prev];
        newSlots[slotIndex] = selectedPart;
        return newSlots;
      });
      setParts(prev => prev.map(p => p.id === selectedPart ? { ...p, placed: true } : p));
      setScore(s => s + 15);

      // Check if all parts are placed
      const allPlaced = parts.filter(p => p.id !== selectedPart).every(p => p.placed);
      if (allPlaced) {
        const timeBonus = timeLeft * 2;
        const mistakePenalty = mistakes * 5;
        const finalScore = score + 15 + timeBonus - mistakePenalty;
        setScore(finalScore);
        setCompleted(true);
      }
    } else {
      setMistakes(m => m + 1);
    }
    
    setSelectedPart(null);
  }, [selectedPart, slots, parts, score, mistakes, timeLeft]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'braces_builder', 
          name: t('games.bracesBuilder', 'Braces Builder'), 
          shortDescription: '', 
          instructionsKids: t('games.bracesBuilderInstructions', 'Build braces on the teeth! Pick a part, then tap a tooth spot to place it!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🦷', 
          color: '' 
        }}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (completed) {
    const allPlaced = parts.every(p => p.placed);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">{allPlaced ? '🎉' : '⏰'}</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {allPlaced ? t('games.perfectBraces', 'Perfect Braces!') : t('games.timeUp', 'Time\'s Up!')}
        </h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        {allPlaced && (
          <p className="text-sm text-muted-foreground mb-4">
            {t('games.thoseTeethWillBeStraight', 'Those teeth will be straight and beautiful!')}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Header Stats */}
      <div className="flex justify-between w-full max-w-md bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">⏱️ {timeLeft}s</div>
        <div className="text-lg font-bold">❌ {mistakes}</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-3 max-w-md">
        <p className="text-sm font-medium">
          {selectedPart 
            ? '👆 Now tap a tooth spot below to place it!' 
            : '👇 Pick a braces part from below first!'}
        </p>
      </div>

      {/* Teeth Display with Braces */}
      <div className="bg-gradient-to-b from-pink-200 to-pink-300 dark:from-pink-900/50 dark:to-pink-800/50 rounded-3xl p-6 shadow-lg">
        {/* Mouth shape */}
        <div className="relative">
          {/* Lips */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-4xl">👄</div>
          
          {/* Teeth Row */}
          <div className="flex gap-1 justify-center mt-8 mb-4">
            {['🦷', '🦷', '🦷', '🦷', '🦷', '🦷'].map((tooth, i) => (
              <motion.div 
                key={i} 
                className="text-3xl drop-shadow-md"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
              >
                {tooth}
              </motion.div>
            ))}
          </div>
          
          {/* Braces Slots - where parts go */}
          <div className="flex flex-wrap gap-3 justify-center bg-white/50 dark:bg-white/10 rounded-xl p-4">
            <p className="w-full text-center text-xs font-medium text-muted-foreground mb-2">
              🔧 Braces Slots - Tap to place parts here!
            </p>
            {slots.map((slot, index) => {
              const placedPart = slot ? parts.find(p => p.id === slot) : null;
              return (
                <motion.button
                  key={index}
                  onClick={() => handleSlotClick(index)}
                  className={`w-14 h-14 rounded-xl border-3 flex flex-col items-center justify-center text-2xl font-bold shadow-md ${
                    slot 
                      ? `${placedPart?.color} border-green-400` 
                      : selectedPart 
                        ? 'bg-yellow-100 border-yellow-400 border-dashed animate-pulse' 
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 border-dashed'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {slot ? (
                    <span>{placedPart?.emoji}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">{index + 1}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Braces Parts to Pick */}
      <div className="w-full max-w-md">
        <p className="text-center text-sm font-bold mb-3 text-primary">
          🎨 Pick a Braces Part:
        </p>
        <div className="flex flex-wrap gap-3 justify-center bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl p-4">
          <AnimatePresence>
            {parts.filter(p => !p.placed).map(part => (
              <motion.button
                key={part.id}
                onClick={() => setSelectedPart(part.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl shadow-lg ${part.color} ${
                  selectedPart === part.id 
                    ? 'ring-4 ring-primary ring-offset-2 scale-110' 
                    : 'hover:scale-105'
                }`}
                whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, y: -20 }}
              >
                <span className="text-3xl">{part.emoji}</span>
                <span className="text-xs font-bold text-white drop-shadow-md">{part.name.split(' ')[0]}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Progress:</span>
        {parts.map((part, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${part.placed ? 'bg-green-400' : 'bg-gray-300'}`}
            animate={part.placed ? { scale: [1, 1.3, 1] } : {}}
          />
        ))}
      </div>
    </div>
  );
};

export default BracesBuilderGame;
