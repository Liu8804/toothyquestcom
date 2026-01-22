import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface CandyVsToothArtGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface ArtElement {
  id: string;
  emoji: string;
  name: string;
  type: 'candy' | 'tooth' | 'effect' | 'protection';
  description: string;
}

interface PlacedElement {
  id: string;
  element: ArtElement;
  x: number;
  y: number;
  side: 'candy' | 'tooth';
}

const CANDY_ELEMENTS: ArtElement[] = [
  { id: 'lollipop', emoji: '🍭', name: 'Lollipop', type: 'candy', description: 'Sugary!' },
  { id: 'chocolate', emoji: '🍫', name: 'Chocolate', type: 'candy', description: 'Sweet!' },
  { id: 'cookie', emoji: '🍪', name: 'Cookie', type: 'candy', description: 'Crunchy!' },
  { id: 'cake', emoji: '🎂', name: 'Cake', type: 'candy', description: 'Yummy!' },
  { id: 'bug', emoji: '🦠', name: 'Sugar Bug', type: 'effect', description: 'Bad germs!' },
  { id: 'sad', emoji: '😢', name: 'Sad Tooth', type: 'effect', description: 'Hurting!' },
];

const TOOTH_ELEMENTS: ArtElement[] = [
  { id: 'tooth', emoji: '🦷', name: 'Happy Tooth', type: 'tooth', description: 'Healthy!' },
  { id: 'brush', emoji: '🪥', name: 'Toothbrush', type: 'protection', description: 'Cleans!' },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle', type: 'protection', description: 'Shiny!' },
  { id: 'shield', emoji: '🛡️', name: 'Shield', type: 'protection', description: 'Protects!' },
  { id: 'water', emoji: '💧', name: 'Water', type: 'protection', description: 'Rinses!' },
  { id: 'happy', emoji: '😊', name: 'Happy Face', type: 'protection', description: 'Healthy!' },
];

export const CandyVsToothArtGame: React.FC<CandyVsToothArtGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<ArtElement | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeSide, setActiveSide] = useState<'candy' | 'tooth'>('candy');

  const startGame = useCallback((diff: Difficulty) => {
    setPlacedElements([]);
    setSelectedElement(null);
    setScore(0);
    setIsComplete(false);
    setActiveSide('candy');
    setDifficulty(diff);
  }, []);

  const handleCanvasClick = (side: 'candy' | 'tooth', e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const isCorrectSide = 
      (side === 'candy' && (selectedElement.type === 'candy' || selectedElement.type === 'effect')) ||
      (side === 'tooth' && (selectedElement.type === 'tooth' || selectedElement.type === 'protection'));

    const newPlaced: PlacedElement = {
      id: `${selectedElement.id}-${Date.now()}`,
      element: selectedElement,
      x,
      y,
      side,
    };

    setPlacedElements(prev => [...prev, newPlaced]);
    setScore(s => s + (isCorrectSide ? 15 : 5));
    setSelectedElement(null);
  };

  const handleRemoveElement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedElements(prev => prev.filter(el => el.id !== id));
  };

  const handleComplete = () => {
    const candySide = placedElements.filter(e => e.side === 'candy');
    const toothSide = placedElements.filter(e => e.side === 'tooth');
    
    const hasBalance = candySide.length >= 2 && toothSide.length >= 2;
    const hasCandyItems = candySide.some(e => e.element.type === 'candy');
    const hasProtection = toothSide.some(e => e.element.type === 'protection');
    
    const balanceBonus = hasBalance ? 30 : 0;
    const storyBonus = (hasCandyItems && hasProtection) ? 25 : 0;
    const sizeBonus = placedElements.length >= 8 ? 20 : placedElements.length >= 5 ? 10 : 0;
    
    setScore(s => s + balanceBonus + storyBonus + sizeBonus);
    setIsComplete(true);
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'candy_vs_tooth_art', 
          name: t('games.candyVsTooth', 'Candy vs Tooth Art'), 
          shortDescription: '', 
          instructionsKids: t('games.candyVsToothInstructions', 'Create art showing candy vs healthy teeth! Put candy items on the red side and tooth-healthy items on the blue side!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🎨', 
          color: '' 
        }}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.amazingArt', 'Amazing Artwork!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">{t('games.youUnderstandSugarAndTeeth', 'You showed how to protect teeth from candy!')}</p>
        
        {/* Show the final art */}
        <div className="flex gap-3 justify-center mb-4 items-center">
          <div className="relative w-28 h-28 bg-gradient-to-br from-red-200 to-orange-200 rounded-xl overflow-hidden shadow-md">
            <p className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold bg-red-400 text-white px-2 rounded">Candy</p>
            {placedElements.filter(e => e.side === 'candy').slice(0, 6).map(placed => (
              <div
                key={placed.id}
                className="absolute text-xl"
                style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {placed.element.emoji}
              </div>
            ))}
          </div>
          <div className="text-3xl">⚔️</div>
          <div className="relative w-28 h-28 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-xl overflow-hidden shadow-md">
            <p className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold bg-blue-400 text-white px-2 rounded">Teeth</p>
            {placedElements.filter(e => e.side === 'tooth').slice(0, 6).map(placed => (
              <div
                key={placed.id}
                className="absolute text-xl"
                style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {placed.element.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  const currentElements = activeSide === 'candy' ? CANDY_ELEMENTS : TOOTH_ELEMENTS;
  const candyCount = placedElements.filter(e => e.side === 'candy').length;
  const toothCount = placedElements.filter(e => e.side === 'tooth').length;

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* Stats */}
      <div className="flex justify-between w-full max-w-md bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">🎨 {placedElements.length} items</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 rounded-xl p-3 max-w-md">
        <p className="font-bold text-primary mb-1">🎨 Candy vs Teeth Battle!</p>
        <p className="text-sm">
          {selectedElement 
            ? `👆 Tap a canvas to place your ${selectedElement.name}!`
            : `👇 Pick an item from the ${activeSide === 'candy' ? '🍬 candy' : '🦷 teeth'} section!`}
        </p>
      </div>

      {/* Art Canvases - Two Sides */}
      <div className="flex gap-4 items-center">
        {/* Candy Side */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-xl">🍬</span>
            <span className="text-sm font-bold text-red-600">Candy Side</span>
            <span className="bg-red-100 text-red-600 text-xs px-2 rounded-full">{candyCount}</span>
          </div>
          <div
            onClick={(e) => handleCanvasClick('candy', e)}
            className={`relative w-36 h-40 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900/50 dark:to-orange-900/50 rounded-xl cursor-pointer overflow-hidden shadow-lg border-3 ${
              activeSide === 'candy' ? 'border-red-400 ring-2 ring-red-300' : 'border-red-200'
            }`}
          >
            <AnimatePresence>
              {placedElements.filter(e => e.side === 'candy').map(placed => (
                <motion.div
                  key={placed.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute text-2xl cursor-pointer hover:scale-125 transition-transform"
                  style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => handleRemoveElement(placed.id, e)}
                >
                  {placed.element.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedElement && activeSide === 'candy' && (
              <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-xl bg-red-500/10 flex items-center justify-center">
                <span className="text-xs bg-white px-2 py-1 rounded font-bold">Tap here!</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-4xl">⚔️</div>

        {/* Tooth Side */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-xl">🦷</span>
            <span className="text-sm font-bold text-blue-600">Teeth Side</span>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 rounded-full">{toothCount}</span>
          </div>
          <div
            onClick={(e) => handleCanvasClick('tooth', e)}
            className={`relative w-36 h-40 bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-xl cursor-pointer overflow-hidden shadow-lg border-3 ${
              activeSide === 'tooth' ? 'border-blue-400 ring-2 ring-blue-300' : 'border-blue-200'
            }`}
          >
            <AnimatePresence>
              {placedElements.filter(e => e.side === 'tooth').map(placed => (
                <motion.div
                  key={placed.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute text-2xl cursor-pointer hover:scale-125 transition-transform"
                  style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => handleRemoveElement(placed.id, e)}
                >
                  {placed.element.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedElement && activeSide === 'tooth' && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <span className="text-xs bg-white px-2 py-1 rounded font-bold">Tap here!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Toggle */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={activeSide === 'candy' ? 'default' : 'outline'}
          onClick={() => setActiveSide('candy')}
          className={activeSide === 'candy' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          🍬 Candy Items
        </Button>
        <Button 
          size="sm" 
          variant={activeSide === 'tooth' ? 'default' : 'outline'}
          onClick={() => setActiveSide('tooth')}
          className={activeSide === 'tooth' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          🦷 Teeth Items
        </Button>
      </div>

      {/* Element Picker */}
      <div className={`grid grid-cols-3 gap-2 p-3 rounded-xl ${
        activeSide === 'candy' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
      }`}>
        {currentElements.map(element => (
          <motion.button
            key={element.id}
            onClick={() => setSelectedElement(element)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              selectedElement?.id === element.id 
                ? 'bg-primary ring-2 ring-primary-foreground scale-105' 
                : 'bg-white dark:bg-gray-700 hover:scale-105'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">{element.emoji}</span>
            <span className="text-[10px] font-bold">{element.name}</span>
          </motion.button>
        ))}
      </div>

      <Button 
        onClick={handleComplete} 
        className="w-full max-w-xs" 
        size="lg"
        disabled={placedElements.length < 3}
      >
        🎨 Finish My Art! ({placedElements.length} items)
      </Button>
    </div>
  );
};

export default CandyVsToothArtGame;
