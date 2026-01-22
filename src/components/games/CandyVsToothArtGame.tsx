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
}

interface PlacedElement {
  id: string;
  element: ArtElement;
  x: number;
  y: number;
  side: 'candy' | 'tooth';
}

const ART_ELEMENTS: ArtElement[] = [
  // Candy side
  { id: 'lollipop', emoji: '🍭', name: 'Lollipop', type: 'candy' },
  { id: 'chocolate', emoji: '🍫', name: 'Chocolate', type: 'candy' },
  { id: 'cookie', emoji: '🍪', name: 'Cookie', type: 'candy' },
  { id: 'cake', emoji: '🎂', name: 'Cake', type: 'candy' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream', type: 'candy' },
  // Negative effects
  { id: 'bug', emoji: '🦠', name: 'Sugar Bug', type: 'effect' },
  { id: 'sad', emoji: '😢', name: 'Sad', type: 'effect' },
  { id: 'cavity', emoji: '🕳️', name: 'Cavity', type: 'effect' },
  // Tooth side  
  { id: 'tooth', emoji: '🦷', name: 'Tooth', type: 'tooth' },
  { id: 'brush', emoji: '🪥', name: 'Brush', type: 'protection' },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle', type: 'protection' },
  { id: 'shield', emoji: '🛡️', name: 'Shield', type: 'protection' },
  { id: 'water', emoji: '💧', name: 'Water', type: 'protection' },
  { id: 'happy', emoji: '😊', name: 'Happy', type: 'protection' },
  { id: 'star', emoji: '⭐', name: 'Star', type: 'protection' },
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

    // Check if element matches the side
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
    setScore(s => s + (isCorrectSide ? 10 : 2));
    setSelectedElement(null);
  };

  const handleRemoveElement = (id: string) => {
    setPlacedElements(prev => prev.filter(e => e.id !== id));
  };

  const handleComplete = () => {
    // Calculate bonus
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
        game={{ id: 'candy_vs_tooth_art', name: t('games.candyVsTooth', 'Candy vs Tooth Art'), shortDescription: '', instructionsKids: t('games.candyVsToothInstructions', 'Draw what happens when candy meets teeth!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '🖼️', color: '' }}
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
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.amazingArt', 'Amazing Art!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">{t('games.youUnderstandSugarAndTeeth', 'You understand sugar and teeth!')}</p>
        
        {/* Show the final art */}
        <div className="flex gap-2 justify-center mb-4">
          <div className="relative w-24 h-24 bg-red-100 rounded-xl overflow-hidden">
            {placedElements.filter(e => e.side === 'candy').slice(0, 4).map(placed => (
              <div
                key={placed.id}
                className="absolute text-lg"
                style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {placed.element.emoji}
              </div>
            ))}
          </div>
          <div className="flex items-center text-2xl">⚔️</div>
          <div className="relative w-24 h-24 bg-blue-100 rounded-xl overflow-hidden">
            {placedElements.filter(e => e.side === 'tooth').slice(0, 4).map(placed => (
              <div
                key={placed.id}
                className="absolute text-lg"
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

  const candyElements = ART_ELEMENTS.filter(e => e.type === 'candy' || e.type === 'effect');
  const toothElements = ART_ELEMENTS.filter(e => e.type === 'tooth' || e.type === 'protection');

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-md">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">🎨 {placedElements.length} items</div>
      </div>

      {/* Art Canvas - Two Sides */}
      <div className="flex gap-4">
        {/* Candy Side */}
        <div className="text-center">
          <p className="text-sm font-bold mb-1">🍬 Candy Side</p>
          <div
            onClick={(e) => handleCanvasClick('candy', e)}
            className={`relative w-36 h-36 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl cursor-pointer overflow-hidden ${
              activeSide === 'candy' ? 'ring-2 ring-red-400' : ''
            }`}
          >
            <AnimatePresence>
              {placedElements.filter(e => e.side === 'candy').map(placed => (
                <motion.div
                  key={placed.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute text-2xl cursor-pointer"
                  style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => { e.stopPropagation(); handleRemoveElement(placed.id); }}
                  whileHover={{ scale: 1.2 }}
                >
                  {placed.element.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center text-3xl">⚔️</div>

        {/* Tooth Side */}
        <div className="text-center">
          <p className="text-sm font-bold mb-1">🦷 Tooth Side</p>
          <div
            onClick={(e) => handleCanvasClick('tooth', e)}
            className={`relative w-36 h-36 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl cursor-pointer overflow-hidden ${
              activeSide === 'tooth' ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <AnimatePresence>
              {placedElements.filter(e => e.side === 'tooth').map(placed => (
                <motion.div
                  key={placed.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute text-2xl cursor-pointer"
                  style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={(e) => { e.stopPropagation(); handleRemoveElement(placed.id); }}
                  whileHover={{ scale: 1.2 }}
                >
                  {placed.element.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Side Toggle */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={activeSide === 'candy' ? 'default' : 'outline'}
          onClick={() => setActiveSide('candy')}
        >
          🍬 Candy
        </Button>
        <Button 
          size="sm" 
          variant={activeSide === 'tooth' ? 'default' : 'outline'}
          onClick={() => setActiveSide('tooth')}
        >
          🦷 Tooth
        </Button>
      </div>

      {/* Element Picker */}
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {(activeSide === 'candy' ? candyElements : toothElements).map(element => (
          <motion.button
            key={element.id}
            onClick={() => setSelectedElement(element)}
            className={`w-10 h-10 rounded-lg text-xl ${
              selectedElement?.id === element.id 
                ? 'bg-blue-200 ring-2 ring-blue-400' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {element.emoji}
          </motion.button>
        ))}
      </div>

      {selectedElement && (
        <p className="text-sm text-muted-foreground">
          {t('games.tapCanvasToPlace', 'Tap the canvas to place')} {selectedElement.emoji}
        </p>
      )}

      <Button onClick={handleComplete} className="w-full max-w-xs" disabled={placedElements.length < 3}>
        🎨 {t('games.finishArt', 'Finish Art!')}
      </Button>
    </div>
  );
};

export default CandyVsToothArtGame;
