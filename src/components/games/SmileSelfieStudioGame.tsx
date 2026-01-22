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
  { id: 'brush', emoji: '🪥', name: 'Brush', category: 'dental' },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'fun' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'fun' },
  { id: 'heart', emoji: '❤️', name: 'Heart', category: 'fun' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', category: 'sparkle' },
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'fun' },
  { id: 'party', emoji: '🎉', name: 'Party', category: 'fun' },
];

const FACE_BACKGROUNDS = [
  { emoji: '😊', name: 'Happy' },
  { emoji: '😁', name: 'Big Smile' },
  { emoji: '😄', name: 'Laughing' },
  { emoji: '🙂', name: 'Calm' },
  { emoji: '😃', name: 'Excited' },
];

const FRAME_COLORS = [
  { id: 'pink', name: 'Pink', class: 'from-pink-300 to-rose-300' },
  { id: 'blue', name: 'Blue', class: 'from-blue-300 to-cyan-300' },
  { id: 'purple', name: 'Purple', class: 'from-purple-300 to-violet-300' },
  { id: 'green', name: 'Green', class: 'from-green-300 to-emerald-300' },
  { id: 'rainbow', name: 'Rainbow', class: 'from-pink-300 via-yellow-300 to-cyan-300' },
];

export const SmileSelfieStudioGame: React.FC<SmileSelfieStudioGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [background, setBackground] = useState(FACE_BACKGROUNDS[0]);
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startGame = useCallback((diff: Difficulty) => {
    setBackground(FACE_BACKGROUNDS[0]);
    setFrameColor(FRAME_COLORS[0]);
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

  const handleRemoveSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleComplete = () => {
    const dentalCount = placedStickers.filter(s => s.sticker.category === 'dental').length;
    const funCount = placedStickers.filter(s => s.sticker.category === 'fun').length;
    const sparkleCount = placedStickers.filter(s => s.sticker.category === 'sparkle').length;
    
    const varietyBonus = Math.min(dentalCount, 2) * 10 + Math.min(funCount, 2) * 10 + Math.min(sparkleCount, 2) * 10;
    const stickerBonus = placedStickers.length >= 5 ? 20 : placedStickers.length >= 3 ? 10 : 0;
    const totalBonus = varietyBonus + stickerBonus;
    
    setScore(s => s + totalBonus);
    setIsComplete(true);
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'smile_selfie_studio', 
          name: t('games.smileSelfie', 'Smile Selfie Studio'), 
          shortDescription: '', 
          instructionsKids: t('games.smileSelfieInstructions', 'Decorate your smile selfie! Pick stickers and tap to place them on your picture!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '📸', 
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
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.greatSmileSelfie', 'Amazing Selfie!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        
        {/* Show the final selfie */}
        <div className={`relative w-36 h-36 mx-auto mb-4 bg-gradient-to-br ${frameColor.class} rounded-2xl overflow-hidden shadow-lg border-4 border-white`}>
          <div className="absolute inset-0 flex items-center justify-center text-7xl">
            {background.emoji}
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
    <div className="flex flex-col items-center gap-3 p-4 max-w-md mx-auto">
      {/* Stats */}
      <div className="flex justify-between w-full bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">🖼️ {placedStickers.length} stickers</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-xl p-3 w-full">
        <p className="font-bold text-primary mb-1">📸 Design Your Selfie!</p>
        <p className="text-sm">
          {selectedSticker 
            ? `👆 Tap the picture to place your ${selectedSticker.name}!`
            : '👇 Pick a sticker, then tap the picture to place it!'}
        </p>
      </div>

      {/* Selfie Canvas */}
      <div
        onClick={handleCanvasClick}
        className={`relative w-56 h-56 bg-gradient-to-br ${frameColor.class} rounded-2xl cursor-pointer overflow-hidden shadow-xl border-4 border-white`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-8xl">
          {background.emoji}
        </div>
        <AnimatePresence>
          {placedStickers.map(placed => (
            <motion.div
              key={placed.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute text-3xl cursor-pointer hover:scale-125 transition-transform"
              style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={(e) => handleRemoveSticker(placed.id, e)}
              title="Click to remove"
            >
              {placed.sticker.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
        {selectedSticker && (
          <div className="absolute inset-0 border-4 border-dashed border-primary rounded-2xl flex items-center justify-center bg-black/10">
            <span className="text-sm bg-white/90 px-3 py-2 rounded-lg font-bold shadow-md">
              👆 Tap here to place {selectedSticker.emoji}!
            </span>
          </div>
        )}
      </div>

      {/* Face Picker */}
      <div className="w-full">
        <p className="text-xs font-bold text-center mb-2">😊 Choose Face:</p>
        <div className="flex gap-2 justify-center">
          {FACE_BACKGROUNDS.map(face => (
            <motion.button
              key={face.emoji}
              onClick={() => setBackground(face)}
              className={`w-10 h-10 rounded-lg text-2xl bg-gray-100 flex items-center justify-center ${
                background.emoji === face.emoji ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {face.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Frame Color Picker */}
      <div className="w-full">
        <p className="text-xs font-bold text-center mb-2">🎨 Frame Color:</p>
        <div className="flex gap-2 justify-center">
          {FRAME_COLORS.map(color => (
            <motion.button
              key={color.id}
              onClick={() => setFrameColor(color)}
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.class} ${
                frameColor.id === color.id ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Sticker Picker */}
      <div className="w-full">
        <p className="text-xs font-bold text-center mb-2">✨ Pick Stickers:</p>
        <div className="flex flex-wrap gap-2 justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
          {STICKERS.map(sticker => (
            <motion.button
              key={sticker.id}
              onClick={() => setSelectedSticker(sticker)}
              className={`w-11 h-11 rounded-lg text-2xl flex items-center justify-center ${
                selectedSticker?.id === sticker.id 
                  ? 'bg-primary ring-2 ring-primary-foreground scale-110' 
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={sticker.name}
            >
              {sticker.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleComplete} 
        className="w-full mt-2" 
        size="lg"
        disabled={placedStickers.length === 0}
      >
        📸 Take My Selfie! ({placedStickers.length} stickers)
      </Button>
    </div>
  );
};

export default SmileSelfieStudioGame;
