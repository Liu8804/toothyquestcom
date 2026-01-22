import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface SugarRushMazeGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

const MAZE_SIZE = 7;

const generateMaze = (difficulty: Difficulty): number[][] => {
  const maze: number[][] = [];
  const wallDensity = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.25 : 0.3;
  
  for (let y = 0; y < MAZE_SIZE; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      if ((y === 0 && x === 0) || (y === MAZE_SIZE - 1 && x === MAZE_SIZE - 1)) {
        maze[y][x] = 0; // Start and end are always clear
      } else {
        maze[y][x] = Math.random() < wallDensity ? 1 : 0;
      }
    }
  }
  return maze;
};

const generateSugarMonsters = (maze: number[][], count: number): Position[] => {
  const monsters: Position[] = [];
  while (monsters.length < count) {
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
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [monsters, setMonsters] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);

  const startGame = useCallback((diff: Difficulty) => {
    const newMaze = generateMaze(diff);
    const monsterCount = diff === 'easy' ? 3 : diff === 'medium' ? 5 : 7;
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
    if (maze[newY][newX] === 1) return; // Wall

    setPlayerPos({ x: newX, y: newY });
    setMoves(m => m + 1);

    // Check for monster collision
    if (monsters.some(m => m.x === newX && m.y === newY)) {
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
      // Remove the monster
      setMonsters(prev => prev.filter(m => !(m.x === newX && m.y === newY)));
    }

    // Check for win
    if (newX === MAZE_SIZE - 1 && newY === MAZE_SIZE - 1) {
      const baseScore = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
      const moveBonus = Math.max(0, 50 - moves);
      const lifeBonus = lives * 10;
      const finalScore = baseScore + moveBonus + lifeBonus;
      setScore(finalScore);
      setWon(true);
    }
  }, [playerPos, maze, monsters, gameOver, won, lives, moves, difficulty]);

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

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ id: 'sugar_rush_maze', name: t('games.sugarRushMaze', 'Sugar Rush Maze'), shortDescription: '', instructionsKids: t('games.sugarRushMazeInstructions', 'Guide your tooth through the maze and dodge the sugar!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '🍬', color: '' }}
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
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.youEscaped', 'You Escaped!')}</h2>
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
        <h2 className="text-2xl font-bold text-destructive mb-2">{t('games.sugarCaught', 'Sugar Caught You!')}</h2>
        <p className="text-muted-foreground mb-4">{t('games.tryDifferentPath', 'Try a different path!')}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => startGame(difficulty)}>{t('common.tryAgain', 'Try Again')}</Button>
          <Button variant="outline" onClick={onClose}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-xs">
        <div className="text-lg">❤️ {lives}</div>
        <div className="text-lg">{t('games.moves', 'Moves')}: {moves}</div>
      </div>

      <div className="grid gap-1 p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
        {maze.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}`}
                className={`w-10 h-10 rounded flex items-center justify-center text-xl ${
                  cell === 1 ? 'bg-amber-800' : 'bg-white'
                } ${x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1 ? 'bg-green-200' : ''}`}
                whileHover={{ scale: cell === 0 ? 1.05 : 1 }}
              >
                {playerPos.x === x && playerPos.y === y && '🦷'}
                {monsters.some(m => m.x === x && m.y === y) && '🍬'}
                {x === MAZE_SIZE - 1 && y === MAZE_SIZE - 1 && playerPos.x !== x && '🏁'}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Touch controls for mobile */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div />
        <Button size="sm" onClick={() => movePlayer(0, -1)}>⬆️</Button>
        <div />
        <Button size="sm" onClick={() => movePlayer(-1, 0)}>⬅️</Button>
        <div className="w-10 h-10" />
        <Button size="sm" onClick={() => movePlayer(1, 0)}>➡️</Button>
        <div />
        <Button size="sm" onClick={() => movePlayer(0, 1)}>⬇️</Button>
        <div />
      </div>
    </div>
  );
};

export default SugarRushMazeGame;
