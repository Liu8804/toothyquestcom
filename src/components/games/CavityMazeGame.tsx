import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';
import { useGameSounds } from '@/hooks/useGameSounds';

interface CavityMazeGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 6;

const generateCavities = (count: number): Position[] => {
  const cavities: Position[] = [];
  while (cavities.length < count) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (!(x === 0 && y === 0) && !cavities.some(c => c.x === x && c.y === y)) {
      cavities.push({ x, y });
    }
  }
  return cavities;
};

export const CavityMazeGame: React.FC<CavityMazeGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const { playSound, playWinFanfare, startBackgroundMusic, stopBackgroundMusic } = useGameSounds();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [brushPos, setBrushPos] = useState<Position>({ x: 0, y: 0 });
  const [cavities, setCavities] = useState<Position[]>([]);
  const [cleanedCavities, setCleanedCavities] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const posKey = (pos: Position) => `${pos.x}-${pos.y}`;

  const startGame = useCallback((diff: Difficulty) => {
    const cavityCount = diff === 'easy' ? 5 : diff === 'medium' ? 7 : 10;
    setCavities(generateCavities(cavityCount));
    setCleanedCavities(new Set());
    setBrushPos({ x: 0, y: 0 });
    setTimeLeft(diff === 'easy' ? 45 : diff === 'medium' ? 35 : 25);
    setScore(0);
    setGameOver(false);
    setDifficulty(diff);
    startBackgroundMusic("happy");
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

  const moveBrush = useCallback((dx: number, dy: number) => {
    if (gameOver) return;

    const newX = Math.max(0, Math.min(GRID_SIZE - 1, brushPos.x + dx));
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, brushPos.y + dy));

    setBrushPos({ x: newX, y: newY });
    playSound("tap");

    // Check if we're on a cavity
    const key = posKey({ x: newX, y: newY });
    if (cavities.some(c => c.x === newX && c.y === newY) && !cleanedCavities.has(key)) {
      setCleanedCavities(prev => new Set([...prev, key]));
      setScore(s => s + 15);
      playSound("success");

      // Check if all cavities are cleaned
      if (cleanedCavities.size + 1 === cavities.length) {
        const timeBonus = timeLeft * 3;
        setScore(s => s + timeBonus);
        setGameOver(true);
        stopBackgroundMusic();
        playWinFanfare();
      }
    }
  }, [brushPos, cavities, cleanedCavities, gameOver, timeLeft, playSound, playWinFanfare, stopBackgroundMusic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': moveBrush(0, -1); break;
        case 'ArrowDown': moveBrush(0, 1); break;
        case 'ArrowLeft': moveBrush(-1, 0); break;
        case 'ArrowRight': moveBrush(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveBrush]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ id: 'cavity_maze', name: t('games.cavityMaze', 'Cavity Maze'), shortDescription: '', instructionsKids: t('games.cavityMazeInstructions', 'Guide the brush to clean all the cavities in the maze!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '🔍', color: '' }}
        onSelectDifficulty={startGame}
      />
    );
  }

  const allCleaned = cleanedCavities.size === cavities.length;

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">{allCleaned ? '🏆' : '⏰'}</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {allCleaned ? t('games.allCavitiesCleaned', 'All Cavities Cleaned!') : t('games.timeUp', 'Time\'s Up!')}
        </h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {t('games.cleaned', 'Cleaned')}: {cleanedCavities.size}/{cavities.length}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">⏱️ {timeLeft}s</div>
        <div className="text-lg">✅ {cleanedCavities.size}/{cavities.length}</div>
      </div>

      <div className="grid gap-1 p-4 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl">
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <div key={y} className="flex gap-1">
            {Array.from({ length: GRID_SIZE }).map((_, x) => {
              const isBrush = brushPos.x === x && brushPos.y === y;
              const isCavity = cavities.some(c => c.x === x && c.y === y);
              const isCleaned = cleanedCavities.has(posKey({ x, y }));

              return (
                <motion.div
                  key={`${x}-${y}`}
                  className={`w-10 h-10 rounded flex items-center justify-center text-xl ${
                    isCleaned ? 'bg-green-200' : isCavity ? 'bg-amber-200' : 'bg-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {isBrush && '🪥'}
                  {!isBrush && isCavity && !isCleaned && '🕳️'}
                  {!isBrush && isCleaned && '✨'}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Touch controls */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div />
        <Button size="sm" onClick={() => moveBrush(0, -1)}>⬆️</Button>
        <div />
        <Button size="sm" onClick={() => moveBrush(-1, 0)}>⬅️</Button>
        <div className="w-10 h-10" />
        <Button size="sm" onClick={() => moveBrush(1, 0)}>➡️</Button>
        <div />
        <Button size="sm" onClick={() => moveBrush(0, 1)}>⬇️</Button>
        <div />
      </div>
    </div>
  );
};

export default CavityMazeGame;
