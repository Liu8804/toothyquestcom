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
  placed: boolean;
  targetSlot: number;
}

const BRACES_PARTS: BracesPart[] = [
  { id: 'bracket1', name: 'Left Bracket', emoji: '⬜', placed: false, targetSlot: 0 },
  { id: 'bracket2', name: 'Center Bracket', emoji: '⬜', placed: false, targetSlot: 1 },
  { id: 'bracket3', name: 'Right Bracket', emoji: '⬜', placed: false, targetSlot: 2 },
  { id: 'wire1', name: 'Top Wire', emoji: '➖', placed: false, targetSlot: 3 },
  { id: 'wire2', name: 'Bottom Wire', emoji: '➖', placed: false, targetSlot: 4 },
  { id: 'band1', name: 'Blue Band', emoji: '🔵', placed: false, targetSlot: 5 },
  { id: 'band2', name: 'Red Band', emoji: '🔴', placed: false, targetSlot: 6 },
  { id: 'band3', name: 'Green Band', emoji: '🟢', placed: false, targetSlot: 7 },
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
    setTimeLeft(diff === 'easy' ? 60 : diff === 'medium' ? 45 : 30);
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
      setScore(s => s + 10);

      // Check if all parts are placed
      const allPlaced = parts.filter(p => p.id !== selectedPart).every(p => p.placed);
      if (allPlaced) {
        const timeBonus = timeLeft * 2;
        const mistakePenalty = mistakes * 5;
        const finalScore = score + 10 + timeBonus - mistakePenalty;
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
        game={{ id: 'braces_builder', name: t('games.bracesBuilder', 'Braces Builder'), shortDescription: '', instructionsKids: t('games.bracesBuilderInstructions', 'Drag the braces parts to the right spots on the teeth!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '🦷', color: '' }}
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
        {allPlaced && <p className="text-sm text-muted-foreground mb-4">{t('games.thoseTeethWillBeStraight', 'Those teeth will be straight!')}</p>}
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-md">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">⏱️ {timeLeft}s</div>
        <div className="text-lg">❌ {mistakes}</div>
      </div>

      {/* Teeth with slots */}
      <div className="bg-pink-100 rounded-2xl p-6 mb-4">
        <div className="flex gap-2 justify-center mb-4">
          {['🦷', '🦷', '🦷', '🦷', '🦷'].map((tooth, i) => (
            <div key={i} className="text-4xl">{tooth}</div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {slots.map((slot, index) => (
            <motion.button
              key={index}
              onClick={() => handleSlotClick(index)}
              className={`w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl ${
                slot ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {slot ? parts.find(p => p.id === slot)?.emoji : '?'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Parts to place */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        <AnimatePresence>
          {parts.filter(p => !p.placed).map(part => (
            <motion.button
              key={part.id}
              onClick={() => setSelectedPart(part.id)}
              className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${
                selectedPart === part.id 
                  ? 'bg-blue-400 ring-2 ring-blue-600' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-200 hover:from-blue-200 hover:to-indigo-300'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {part.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {selectedPart ? t('games.tapSlotToPlace', 'Tap a slot to place the part!') : t('games.selectPartFirst', 'Select a braces part first!')}
      </p>
    </div>
  );
};

export default BracesBuilderGame;
