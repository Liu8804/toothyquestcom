import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface ToothPuzzleAdventureGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface PuzzlePiece {
  id: number;
  currentPos: number;
  correctPos: number;
  emoji: string;
  label: string;
  color: string;
}

const PUZZLE_SETS = [
  { 
    pieces: [
      { emoji: '🦷', label: 'Tooth', color: 'bg-white border-blue-300' },
      { emoji: '🪥', label: 'Brush', color: 'bg-blue-100 border-blue-400' },
      { emoji: '✨', label: 'Sparkle', color: 'bg-yellow-100 border-yellow-400' },
      { emoji: '😁', label: 'Smile', color: 'bg-pink-100 border-pink-400' },
    ],
    title: 'Brushing Makes Smiles!',
    fact: 'Brushing your teeth makes them sparkle!'
  },
  { 
    pieces: [
      { emoji: '💧', label: 'Water', color: 'bg-blue-100 border-blue-400' },
      { emoji: '🦷', label: 'Tooth', color: 'bg-white border-gray-300' },
      { emoji: '💪', label: 'Strong', color: 'bg-green-100 border-green-400' },
      { emoji: '❤️', label: 'Healthy', color: 'bg-red-100 border-red-400' },
    ],
    title: 'Water Keeps Teeth Strong!',
    fact: 'Water helps wash away food and keeps teeth healthy!'
  },
  { 
    pieces: [
      { emoji: '🧵', label: 'Floss', color: 'bg-purple-100 border-purple-400' },
      { emoji: '🦷', label: 'Teeth', color: 'bg-white border-gray-300' },
      { emoji: '🌟', label: 'Clean', color: 'bg-yellow-100 border-yellow-400' },
      { emoji: '👑', label: 'Perfect', color: 'bg-amber-100 border-amber-400' },
    ],
    title: 'Flossing is Super!',
    fact: 'Floss reaches spots your brush cannot!'
  },
  { 
    pieces: [
      { emoji: '🍎', label: 'Apple', color: 'bg-red-100 border-red-400' },
      { emoji: '🥕', label: 'Carrot', color: 'bg-orange-100 border-orange-400' },
      { emoji: '🦷', label: 'Happy', color: 'bg-white border-green-300' },
      { emoji: '🎉', label: 'Yay!', color: 'bg-pink-100 border-pink-400' },
    ],
    title: 'Healthy Snacks!',
    fact: 'Fruits and veggies are great for teeth!'
  },
];

export const ToothPuzzleAdventureGame: React.FC<ToothPuzzleAdventureGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [showFact, setShowFact] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initPuzzle = useCallback((index: number) => {
    const puzzle = PUZZLE_SETS[index];
    const positions = shuffleArray([0, 1, 2, 3]);
    const newPieces: PuzzlePiece[] = puzzle.pieces.map((piece, i) => ({
      id: i,
      currentPos: positions[i],
      correctPos: i,
      emoji: piece.emoji,
      label: piece.label,
      color: piece.color,
    }));
    setPieces(newPieces);
    setSelectedPiece(null);
    setMoves(0);
    setSolved(false);
    setShowFact(false);
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    setPuzzleIndex(0);
    setScore(0);
    setAllDone(false);
    setDifficulty(diff);
    initPuzzle(0);
  }, [initPuzzle]);

  const handlePieceClick = useCallback((pieceId: number) => {
    if (solved) return;

    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    } else if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      setPieces(prev => {
        const newPieces = [...prev];
        const piece1 = newPieces.find(p => p.id === selectedPiece)!;
        const piece2 = newPieces.find(p => p.id === pieceId)!;
        const tempPos = piece1.currentPos;
        piece1.currentPos = piece2.currentPos;
        piece2.currentPos = tempPos;
        return newPieces;
      });
      setMoves(m => m + 1);
      setSelectedPiece(null);
    }
  }, [selectedPiece, solved]);

  useEffect(() => {
    if (pieces.length === 0) return;
    
    const isSolved = pieces.every(p => p.currentPos === p.correctPos);
    if (isSolved && !solved) {
      setSolved(true);
      setShowFact(true);
      const moveBonus = Math.max(0, 20 - moves) * 2;
      const baseScore = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 35 : 50;
      setScore(s => s + baseScore + moveBonus);
    }
  }, [pieces, solved, moves, difficulty]);

  const handleNextPuzzle = () => {
    const puzzleCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    if (puzzleIndex + 1 >= puzzleCount) {
      setAllDone(true);
    } else {
      setPuzzleIndex(i => i + 1);
      initPuzzle(puzzleIndex + 1);
    }
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'tooth_puzzle_adventure', 
          name: t('games.toothPuzzle', 'Tooth Puzzle Adventure'), 
          shortDescription: '', 
          instructionsKids: t('games.toothPuzzleInstructions', 'Put the pictures in the right order! Tap 2 pictures to swap them!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🧩', 
          color: '' 
        }}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (allDone) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">🧩</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.allPuzzlesSolved', 'All Puzzles Solved!')}</h2>
        <p className="text-lg mb-4">{t('games.score', 'Score')}: {score}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  const sortedPieces = [...pieces].sort((a, b) => a.currentPos - b.currentPos);
  const currentPuzzle = PUZZLE_SETS[puzzleIndex];

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Stats */}
      <div className="flex justify-between w-full max-w-xs bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">🧩 {puzzleIndex + 1}/{difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4}</div>
        <div className="text-lg font-bold">👆 {moves}</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 max-w-xs">
        <p className="font-bold text-primary mb-1">🧩 {currentPuzzle.title}</p>
        <p className="text-sm">
          {selectedPiece !== null 
            ? '👆 Now tap another piece to SWAP!' 
            : '👇 Tap a piece to select it!'}
        </p>
      </div>

      {/* Goal Preview */}
      <div className="flex gap-1 items-center bg-green-100 dark:bg-green-900/30 rounded-xl px-4 py-2">
        <span className="text-sm font-medium mr-2">Goal:</span>
        {PUZZLE_SETS[puzzleIndex].pieces.map((piece, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xl">{piece.emoji}</span>
            <span className="text-[10px]">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/50 dark:to-pink-900/50 p-6 rounded-2xl shadow-lg">
        {sortedPieces.map((piece) => {
          const isCorrect = piece.currentPos === piece.correctPos;
          const isSelected = selectedPiece === piece.id;
          
          return (
            <motion.button
              key={piece.id}
              onClick={() => handlePieceClick(piece.id)}
              className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1 border-4 shadow-md ${piece.color} ${
                isSelected
                  ? 'ring-4 ring-primary ring-offset-2 scale-105'
                  : solved && isCorrect
                    ? 'ring-4 ring-green-400'
                    : ''
              }`}
              whileHover={{ scale: solved ? 1 : 1.05 }}
              whileTap={{ scale: solved ? 1 : 0.95 }}
              animate={solved ? { scale: [1, 1.1, 1] } : isSelected ? { rotate: [-2, 2, -2, 0] } : {}}
              transition={{ duration: 0.3, repeat: isSelected ? Infinity : 0 }}
            >
              <span className="text-4xl">{piece.emoji}</span>
              <span className="text-sm font-bold">{piece.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isCorrect ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                Slot {piece.currentPos + 1}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Fun Fact */}
      <AnimatePresence>
        {showFact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 p-4 rounded-xl text-center max-w-xs shadow-lg"
          >
            <p className="text-2xl mb-2">🎉 Great Job!</p>
            <p className="text-sm font-medium mb-3">{currentPuzzle.fact}</p>
            <Button onClick={handleNextPuzzle} className="w-full">
              {puzzleIndex + 1 >= (difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4)
                ? '🏆 See Results'
                : '➡️ Next Puzzle'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToothPuzzleAdventureGame;
