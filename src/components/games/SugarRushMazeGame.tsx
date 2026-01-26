import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';
import { useGameSounds } from '@/hooks/useGameSounds';

interface SugarRushMazeGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

const MAZE_SIZE = 6;

const generateMaze = (difficulty: Difficulty): number[][] => {
  const maze: number[][] = [];
  const wallDensity = difficulty === 'easy' ? 0.15 : difficulty === 'medium' ? 0.2 : 0.25;
  
  for (let y = 0; y < MAZE_SIZE; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      if ((y === 0 && x === 0) || (y === MAZE_SIZE - 1 && x === MAZE_SIZE - 1)) {
        maze[y][x] = 0;
      } else {
        maze[y][x] = Math.random() < wallDensity ? 1 : 0;
      }
    }
  }
  return maze;
};

const generateSugarMonsters = (maze: number[][], count: number): Position[] => {
  const monsters: Position[] = [];
  let attempts = 0;
  while (monsters.length < count && attempts < 100) {
    attempts++;
    const x = Math.floor(Math.random() * MAZE_SIZE);
    const y = Math.floor(Math.random() * MAZE_SIZE);
    if (maze[y][x] === 0 && !(x === 0 && y === 0) && !(x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1)) {
      if (!monsters.some(m => m.x === x && m.y === y)) {
        monsters.push({ x, y });
      }
    }
  }
  return monsters;
};

export const SugarRushMazeGame: React.FC<SugarRushMazeGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const { playSound, playWinFanfare } = useGameSounds();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [monsters, setMonsters] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const startGame = useCallback((diff: Difficulty) => {
    const newMaze = generateMaze(diff);
    const monsterCount = diff === 'easy' ? 2 : diff === 'medium' ? 3 : 4;
    setMaze(newMaze);
    setMonsters(generateSugarMonsters(newMaze, monsterCount));
    setPlayerPos({ x: 0, y: 0 });
    setLives(diff === 'easy' ? 4 : diff === 'medium' ? 3 : 2);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setDifficulty(diff);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameOver || won) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= MAZE_SIZE || newY < 0 || newY >= MAZE_SIZE) return;
    if (maze[newY][newX] === 1) return;

    setPlayerPos({ x: newX, y: newY });
    setMoves(m => m + 1);
    playSound("tap");

    if (monsters.some(m => m.x === newX && m.y === newY)) {
      playSound("lose");
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
      setMonsters(prev => prev.filter(m => !(m.x === newX && m.y === newY)));
    }

    if (newX === MAZE_SIZE - 1 && newY === MAZE_SIZE - 1) {
      const baseScore = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
      const moveBonus = Math.max(0, 50 - moves);
      const lifeBonus = lives * 10;
      const finalScore = baseScore + moveBonus + lifeBonus;
      setScore(finalScore);
      setWon(true);
      playWinFanfare();
    }
  }, [playerPos, maze, monsters, gameOver, won, lives, moves, difficulty, playSound, playWinFanfare]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minSwipe) movePlayer(1, 0);
      else if (dx < -minSwipe) movePlayer(-1, 0);
    } else {
      if (dy > minSwipe) movePlayer(0, 1);
      else if (dy < -minSwipe) movePlayer(0, -1);
    }
    touchStartRef.current = null;
  };

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'sugar_rush_maze', 
          name: t('games.sugarRushMaze', 'Sugar Rush Maze'), 
          shortDescription: '', 
          instructionsKids: t('games.sugarRushMazeInstructions', 'Move the tooth 🦷 to the green goal 🏁! Avoid the sugar candies 🍬!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🍬', 
          color: '' 
        }}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (won) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.youEscaped', 'You Escaped the Sugar!')}</h2>
        <p className="text-lg mb-4">{t('games.score', 'Score')}: {score}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => startGame(difficulty)}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">🍬</div>
        <h2 className="text-2xl font-bold text-destructive mb-2">{t('games.sugarCaught', 'Sugar Got You!')}</h2>
        <p className="text-muted-foreground mb-4">{t('games.tryDifferentPath', 'Try a different path!')}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => startGame(difficulty)}>{t('common.tryAgain', 'Try Again')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center gap-4 p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stats */}
      <div className="flex justify-between w-full max-w-xs bg-card rounded-lg p-3">
        <div className="text-lg font-bold">❤️ {lives}</div>
        <div className="text-lg font-bold">👣 {moves}</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-3 max-w-xs">
        <p className="text-sm font-medium">
          🦷 Move tooth to 🏁 goal! Avoid 🍬 sugar!
        </p>
        <p className="text-xs text-muted-foreground mt-1">Use arrows or swipe!</p>
      </div>

      {/* Maze Grid */}
      <div className="grid gap-1 p-4 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 rounded-2xl shadow-lg">
        {maze.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((cell, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isMonster = monsters.some(m => m.x === x && m.y === y);
              const isGoal = x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1;
              const isStart = x === 0 && y === 0;
              const isWall = cell === 1;
              
              return (
                <motion.div
                  key={`${x}-${y}`}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm ${
                    isWall 
                      ? 'bg-amber-800 dark:bg-amber-900' 
                      : isGoal 
                        ? 'bg-green-300 dark:bg-green-700 ring-2 ring-green-500' 
                        : isStart
                          ? 'bg-blue-200 dark:bg-blue-800'
                          : 'bg-white dark:bg-gray-700'
                  }`}
                  whileHover={{ scale: cell === 0 ? 1.05 : 1 }}
                >
                  {isPlayer && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-3xl"
                    >
                      🦷
                    </motion.span>
                  )}
                  {isMonster && !isPlayer && (
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      🍬
                    </motion.span>
                  )}
                  {isGoal && !isPlayer && '🏁'}
                  {isStart && !isPlayer && !isMonster && (
                    <span className="text-xs text-blue-600">START</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Touch/Click Controls */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div />
        <Button 
          size="lg" 
          onClick={() => movePlayer(0, -1)}
          className="w-14 h-14 text-2xl"
        >
          ⬆️
        </Button>
        <div />
        <Button 
          size="lg" 
          onClick={() => movePlayer(-1, 0)}
          className="w-14 h-14 text-2xl"
        >
          ⬅️
        </Button>
        <div className="w-14 h-14 flex items-center justify-center text-3xl">🦷</div>
        <Button 
          size="lg" 
          onClick={() => movePlayer(1, 0)}
          className="w-14 h-14 text-2xl"
        >
          ➡️
        </Button>
        <div />
        <Button 
          size="lg" 
          onClick={() => movePlayer(0, 1)}
          className="w-14 h-14 text-2xl"
        >
          ⬇️
        </Button>
        <div />
      </div>
    </div>
  );
};

export default SugarRushMazeGame;
