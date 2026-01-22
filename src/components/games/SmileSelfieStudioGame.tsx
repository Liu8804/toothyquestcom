import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface SmileSelfieStudioGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Sticker {
  id: string;
  emoji: string;
  name: string;
  category: 'dental' | 'fun' | 'sparkle';
}

interface PlacedSticker {
  id: string;
  sticker: Sticker;
  x: number;
  y: number;
}

const STICKERS: Sticker[] = [
  { id: 'tooth', emoji: '🦷', name: 'Tooth', category: 'dental' },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle', category: 'sparkle' },
  { id: 'star', emoji: '⭐', name: 'Star', category: 'sparkle' },
  { id: 'brush', emoji: '🪥', name: 'Toothbrush', category: 'dental' },
  { id: 'floss', emoji: '🧵', name: 'Floss', category: 'dental' },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'fun' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'fun' },
  { id: 'heart', emoji: '❤️', name: 'Heart', category: 'fun' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', category: 'sparkle' },
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'fun' },
  { id: 'glasses', emoji: '🕶️', name: 'Glasses', category: 'fun' },
  { id: 'party', emoji: '🎉', name: 'Party', category: 'fun' },
];

const BACKGROUNDS = ['😊', '😁', '😄', '🙂', '😃'];
const FILTERS = [
  { id: 'none', name: 'None', className: '' },
  { id: 'bright', name: 'Bright', className: 'brightness-110 saturate-125' },
  { id: 'warm', name: 'Warm', className: 'sepia-[.25]' },
  { id: 'cool', name: 'Cool', className: 'hue-rotate-30' },
  { id: 'sparkle', name: 'Sparkle', className: 'contrast-110 saturate-150' },
];

export const SmileSelfieStudioGame: React.FC<SmileSelfieStudioGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startGame = useCallback((diff: Difficulty) => {
    setBackground(BACKGROUNDS[0]);
    setSelectedFilter(FILTERS[0]);
    setPlacedStickers([]);
    setSelectedSticker(null);
    setScore(0);
    setIsComplete(false);
    setDifficulty(diff);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlaced: PlacedSticker = {
      id: `${selectedSticker.id}-${Date.now()}`,
      sticker: selectedSticker,
      x,
      y,
    };

    setPlacedStickers(prev => [...prev, newPlaced]);
    setScore(s => s + 5);
    setSelectedSticker(null);
  };

  const handleRemoveSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleComplete = () => {
    // Calculate bonus based on variety
    const dentalCount = placedStickers.filter(s => s.sticker.category === 'dental').length;
    const funCount = placedStickers.filter(s => s.sticker.category === 'fun').length;
    const sparkleCount = placedStickers.filter(s => s.sticker.category === 'sparkle').length;
    
    const varietyBonus = Math.min(dentalCount, 2) * 10 + Math.min(funCount, 2) * 10 + Math.min(sparkleCount, 2) * 10;
    const filterBonus = selectedFilter.id !== 'none' ? 15 : 0;
    const totalBonus = varietyBonus + filterBonus + (placedStickers.length >= 5 ? 20 : 0);
    
    setScore(s => s + totalBonus);
    setIsComplete(true);
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ id: 'smile_selfie_studio', name: t('games.smileSelfie', 'Smile Selfie Studio'), shortDescription: '', instructionsKids: t('games.smileSelfieInstructions', 'Add fun stickers and filters to your smile selfie!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '📸', color: '' }}
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
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.greatSmileSelfie', 'Great Smile Selfie!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        
        {/* Show the final selfie */}
        <div className={`relative w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl overflow-hidden ${selectedFilter.className}`}>
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {background}
          </div>
          {placedStickers.map(placed => (
            <div
              key={placed.id}
              className="absolute text-2xl"
              style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {placed.sticker.emoji}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <div className="flex justify-between w-full">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">🖼️ {placedStickers.length} stickers</div>
      </div>

      {/* Selfie Canvas */}
      <div
        onClick={handleCanvasClick}
        className={`relative w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl cursor-pointer overflow-hidden ${selectedFilter.className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-8xl">
          {background}
        </div>
        <AnimatePresence>
          {placedStickers.map(placed => (
            <motion.div
              key={placed.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute text-3xl cursor-pointer"
              style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={(e) => { e.stopPropagation(); handleRemoveSticker(placed.id); }}
              whileHover={{ scale: 1.2 }}
            >
              {placed.sticker.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
        {selectedSticker && (
          <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-2xl flex items-center justify-center">
            <span className="text-sm bg-white/80 px-2 py-1 rounded">{t('games.tapToPlace', 'Tap to place!')}</span>
          </div>
        )}
      </div>

      {/* Background Picker */}
      <div className="flex gap-2">
        {BACKGROUNDS.map(bg => (
          <motion.button
            key={bg}
            onClick={() => setBackground(bg)}
            className={`w-10 h-10 rounded-lg text-2xl ${background === bg ? 'ring-2 ring-primary' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {bg}
          </motion.button>
        ))}
      </div>

      {/* Filter Picker */}
      <div className="flex gap-2 flex-wrap justify-center">
        {FILTERS.map(filter => (
          <Button
            key={filter.id}
            size="sm"
            variant={selectedFilter.id === filter.id ? 'default' : 'outline'}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      {/* Sticker Picker */}
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {STICKERS.map(sticker => (
          <motion.button
            key={sticker.id}
            onClick={() => setSelectedSticker(sticker)}
            className={`w-10 h-10 rounded-lg text-xl ${
              selectedSticker?.id === sticker.id ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sticker.emoji}
          </motion.button>
        ))}
      </div>

      <Button onClick={handleComplete} className="w-full" disabled={placedStickers.length === 0}>
        📸 {t('games.takePhoto', 'Take Photo!')}
      </Button>
    </div>
  );
};

export default SmileSelfieStudioGame;
