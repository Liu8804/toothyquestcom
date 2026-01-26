import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';
import { useGameSounds } from '@/hooks/useGameSounds';

interface BracesBuilderGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface BracesPart {
  id: string;
  name: string;
  icon: string;
  label: string;
  color: string;
  placed: boolean;
  targetSlot: number;
}

// Clear braces parts with descriptive labels
const BRACES_PARTS: BracesPart[] = [
  { id: 'bracket1', name: 'Bracket', icon: '[ ]', label: 'Bracket 1', color: 'bg-blue-400', placed: false, targetSlot: 0 },
  { id: 'bracket2', name: 'Bracket', icon: '[ ]', label: 'Bracket 2', color: 'bg-blue-500', placed: false, targetSlot: 1 },
  { id: 'bracket3', name: 'Bracket', icon: '[ ]', label: 'Bracket 3', color: 'bg-blue-600', placed: false, targetSlot: 2 },
  { id: 'wire', name: 'Wire', icon: '━━━', label: 'Metal Wire', color: 'bg-slate-400', placed: false, targetSlot: 3 },
  { id: 'band1', name: 'Band', icon: '◯', label: 'Pink Band', color: 'bg-pink-400', placed: false, targetSlot: 4 },
  { id: 'band2', name: 'Band', icon: '◯', label: 'Green Band', color: 'bg-green-400', placed: false, targetSlot: 5 },
  { id: 'band3', name: 'Band', icon: '◯', label: 'Blue Band', color: 'bg-cyan-400', placed: false, targetSlot: 6 },
  { id: 'band4', name: 'Band', icon: '◯', label: 'Purple Band', color: 'bg-purple-400', placed: false, targetSlot: 7 },
];

// Slot labels for guidance
const SLOT_LABELS = [
  "Put Bracket 1 here",
  "Put Bracket 2 here", 
  "Put Bracket 3 here",
  "Put Wire here",
  "Put Pink Band here",
  "Put Green Band here",
  "Put Blue Band here",
  "Put Purple Band here",
];

export const BracesBuilderGame: React.FC<BracesBuilderGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const { playSound, playWinFanfare, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [parts, setParts] = useState<BracesPart[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ type: 'correct' | 'wrong'; message: string } | null>(null);

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
    setTimeLeft(diff === 'easy' ? 120 : diff === 'medium' ? 90 : 60);
    setDifficulty(diff);
    startBackgroundMusic("happy");
  }, [startBackgroundMusic]);

  // Stop music on unmount
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  useEffect(() => {
    if (!difficulty || completed || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setCompleted(true);
          stopBackgroundMusic();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, completed, timeLeft, stopBackgroundMusic]);

  const handlePartSelect = useCallback((partId: string) => {
    setSelectedPart(partId);
    playSound("tap");
    setShowFeedback(null);
  }, [playSound]);

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (!selectedPart || slots[slotIndex] !== null) return;

    const part = parts.find(p => p.id === selectedPart);
    if (!part) return;

    const isCorrect = part.targetSlot === slotIndex;
    
    if (isCorrect) {
      playSound("success");
      setSlots(prev => {
        const newSlots = [...prev];
        newSlots[slotIndex] = selectedPart;
        return newSlots;
      });
      setParts(prev => prev.map(p => p.id === selectedPart ? { ...p, placed: true } : p));
      setScore(s => s + 15);
      setShowFeedback({ type: 'correct', message: '✅ Perfect! Great job!' });

      // Check if all parts are placed
      const remainingParts = parts.filter(p => p.id !== selectedPart && !p.placed);
      if (remainingParts.length === 0) {
        const timeBonus = timeLeft * 2;
        const mistakePenalty = mistakes * 5;
        const finalScore = score + 15 + timeBonus - mistakePenalty;
        setScore(finalScore);
        setCompleted(true);
        stopBackgroundMusic();
        playWinFanfare();
      }
    } else {
      playSound("lose");
      setMistakes(m => m + 1);
      const correctSlot = SLOT_LABELS[slotIndex];
      setShowFeedback({ type: 'wrong', message: `❌ Try again! This spot needs: ${correctSlot.replace('Put ', '').replace(' here', '')}` });
    }
    
    setSelectedPart(null);
  }, [selectedPart, slots, parts, score, mistakes, timeLeft, playSound, playWinFanfare, stopBackgroundMusic]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'braces_builder', 
          name: t('games.bracesBuilder', 'Braces Builder'), 
          shortDescription: t('games.bracesBuilderShort', 'Learn how braces are built!'), 
          instructionsKids: t('games.bracesBuilderInstructions', 'Build braces step by step! First tap a part below, then tap the matching spot on the teeth to place it.'), 
          instructionsParents: 'Educational game teaching children about orthodontic braces components.', 
          winMessage: t('games.perfectBraces', 'Perfect Braces!'), 
          loseMessage: t('games.timeUp', "Time's Up!"), 
          reward: '50 XP', 
          badgeName: 'Braces Builder', 
          emoji: '🦷', 
          color: 'blue' 
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
          <div className="text-sm text-muted-foreground mb-4 space-y-1">
            <p>🦷 {t('games.thoseTeethWillBeStraight', 'Those teeth will be straight and beautiful!')}</p>
            <p>You learned: Brackets hold the wire, bands add color!</p>
          </div>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-h-[80vh] overflow-y-auto">
      {/* Header Stats */}
      <div className="flex justify-between w-full max-w-md bg-card rounded-lg p-3 shadow-md">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className={`text-lg font-bold ${timeLeft <= 15 ? 'text-destructive animate-pulse' : ''}`}>⏱️ {timeLeft}s</div>
        <div className="text-lg font-bold text-destructive">❌ {mistakes}</div>
      </div>

      {/* Step-by-step Instructions */}
      <div className="w-full max-w-md bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border-2 border-blue-300 dark:border-blue-700">
        <h3 className="font-bold text-center mb-2 text-lg">🦷 How to Build Braces:</h3>
        <div className="text-sm space-y-1">
          <p className={`flex items-center gap-2 ${selectedPart ? 'opacity-50' : 'font-bold text-primary'}`}>
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">1</span>
            👇 Tap a braces part below to pick it up
          </p>
          <p className={`flex items-center gap-2 ${!selectedPart ? 'opacity-50' : 'font-bold text-primary'}`}>
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">2</span>
            👆 Tap a matching slot on the teeth to place it
          </p>
        </div>
        {selectedPart && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center"
          >
            <span className="font-bold">✋ Holding: {parts.find(p => p.id === selectedPart)?.label}</span>
          </motion.div>
        )}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full max-w-md p-3 rounded-xl text-center font-bold ${
              showFeedback.type === 'correct' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
          >
            {showFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teeth Display with Braces Slots */}
      <div className="bg-gradient-to-b from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40 rounded-3xl p-6 shadow-lg w-full max-w-md">
        <h4 className="text-center font-bold mb-3 text-lg">🦷 Teeth - Tap slots to place parts!</h4>
        
        {/* Teeth Row with realistic teeth */}
        <div className="flex gap-1 justify-center mb-4">
          {['🦷', '🦷', '🦷', '🦷', '🦷', '🦷'].map((tooth, i) => (
            <motion.div 
              key={i} 
              className="text-3xl drop-shadow-md"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
            >
              {tooth}
            </motion.div>
          ))}
        </div>
        
        {/* Braces Slots Grid */}
        <div className="grid grid-cols-4 gap-3 bg-white/60 dark:bg-white/10 rounded-xl p-4">
          {slots.map((slot, index) => {
            const placedPart = slot ? parts.find(p => p.id === slot) : null;
            const expectedPart = parts.find(p => p.targetSlot === index);
            
            return (
              <motion.button
                key={index}
                onClick={() => handleSlotClick(index)}
                disabled={slot !== null}
                className={`w-full aspect-square rounded-xl border-3 flex flex-col items-center justify-center text-xs font-bold shadow-md transition-all ${
                  slot 
                    ? `${placedPart?.color} border-green-400 text-white` 
                    : selectedPart 
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 border-dashed animate-pulse cursor-pointer hover:bg-yellow-200' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 border-dashed'
                }`}
                whileHover={!slot ? { scale: 1.05 } : {}}
                whileTap={!slot ? { scale: 0.95 } : {}}
              >
                {slot ? (
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{placedPart?.icon}</span>
                    <span className="text-[10px]">{placedPart?.name}</span>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <span className="text-lg opacity-40">{expectedPart?.icon}</span>
                    <span className="block text-[9px] mt-1">Slot {index + 1}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Braces Parts to Pick */}
      <div className="w-full max-w-md">
        <h4 className="text-center font-bold mb-3 text-lg">🎨 Braces Parts - Tap to pick up!</h4>
        <div className="grid grid-cols-4 gap-3 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl p-4">
          <AnimatePresence>
            {parts.filter(p => !p.placed).map(part => (
              <motion.button
                key={part.id}
                onClick={() => handlePartSelect(part.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl shadow-lg ${part.color} ${
                  selectedPart === part.id 
                    ? 'ring-4 ring-primary ring-offset-2 scale-110' 
                    : 'hover:scale-105'
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: selectedPart === part.id ? 1.1 : 1 }}
                exit={{ opacity: 0, scale: 0, y: -20 }}
              >
                <span className="text-2xl text-white drop-shadow-md">{part.icon}</span>
                <span className="text-[10px] font-bold text-white drop-shadow-md">{part.label}</span>
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
            className={`w-4 h-4 rounded-full border-2 ${
              part.placed 
                ? 'bg-green-400 border-green-500' 
                : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            }`}
            animate={part.placed ? { scale: [1, 1.3, 1] } : {}}
          />
        ))}
        <span className="text-sm text-muted-foreground">
          {parts.filter(p => p.placed).length}/{parts.length}
        </span>
      </div>
    </div>
  );
};

export default BracesBuilderGame;
