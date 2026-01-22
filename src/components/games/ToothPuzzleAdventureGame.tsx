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
}

const PUZZLE_IMAGES = [
  { emojis: ['🦷', '✨', '🪥', '💎'], fact: 'Teeth are the hardest part of your body!' },
  { emojis: ['😁', '🌟', '💪', '❤️'], fact: 'Smiling makes you feel happier!' },
  { emojis: ['🧵', '🦷', '💫', '👑'], fact: 'Flossing reaches places brushes can\'t!' },
  { emojis: ['💧', '🦷', '🌊', '🎉'], fact: 'Water helps wash away food and germs!' },
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
    const puzzle = PUZZLE_IMAGES[index];
    const positions = shuffleArray([0, 1, 2, 3]);
    const newPieces: PuzzlePiece[] = puzzle.emojis.map((emoji, i) => ({
      id: i,
      currentPos: positions[i],
      correctPos: i,
      emoji,
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
      // Swap pieces
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
        game={{ id: 'tooth_puzzle_adventure', name: t('games.toothPuzzle', 'Tooth Puzzle Adventure'), shortDescription: '', instructionsKids: t('games.toothPuzzleInstructions', 'Put the puzzle pieces together to see the picture!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '🧩', color: '' }}
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

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">🧩 {puzzleIndex + 1}/{difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4}</div>
        <div className="text-lg">{t('games.moves', 'Moves')}: {moves}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl">
        {sortedPieces.map((piece) => (
          <motion.button
            key={piece.id}
            onClick={() => handlePieceClick(piece.id)}
            className={`w-20 h-20 rounded-lg flex items-center justify-center text-4xl ${
              selectedPiece === piece.id
                ? 'bg-purple-400 ring-2 ring-purple-600'
                : solved && piece.currentPos === piece.correctPos
                ? 'bg-green-200'
                : 'bg-white hover:bg-purple-50'
            }`}
            whileHover={{ scale: solved ? 1 : 1.05 }}
            whileTap={{ scale: solved ? 1 : 0.95 }}
            animate={solved ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {piece.emoji}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showFact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl text-center max-w-xs"
          >
            <p className="text-lg font-bold mb-2">🎉 {t('games.puzzleComplete', 'Puzzle Complete!')}</p>
            <p className="text-sm text-muted-foreground mb-4">{PUZZLE_IMAGES[puzzleIndex].fact}</p>
            <Button onClick={handleNextPuzzle}>
              {puzzleIndex + 1 >= (difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4)
                ? t('games.seeResults', 'See Results')
                : t('games.nextPuzzle', 'Next Puzzle')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!solved && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedPiece !== null ? t('games.tapAnotherToSwap', 'Tap another piece to swap!') : t('games.tapPieceToSelect', 'Tap a piece to select it!')}
        </p>
      )}
    </div>
  );
};

export default ToothPuzzleAdventureGame;
