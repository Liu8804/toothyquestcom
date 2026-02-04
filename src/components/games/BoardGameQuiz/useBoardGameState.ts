import { useState, useCallback } from 'react';
import { GameSession, DiceRoll } from './types';
import { boardSpaces, BOARD_SIZE } from './boardConfig';
import { stories } from '@/data/stories';

const INITIAL_SESSION: GameSession = {
  playerPosition: 0,
  totalStars: 0,
  quizzesAnswered: 0,
  quizzesCorrect: 0,
  turnsPlayed: 0,
  isGameOver: false,
  currentQuizIndex: null,
};

export function useBoardGameState() {
  const [session, setSession] = useState<GameSession>(INITIAL_SESSION);
  const [dice, setDice] = useState<DiceRoll>({ value: 1, isRolling: false });
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [usedQuizIndices, setUsedQuizIndices] = useState<Set<number>>(new Set());

  // Get a random quiz that hasn't been used yet
  const getNextQuiz = useCallback(() => {
    const availableIndices = stories
      .map((_, i) => i)
      .filter(i => !usedQuizIndices.has(i));
    
    if (availableIndices.length === 0) {
      // Reset if all quizzes used
      setUsedQuizIndices(new Set());
      return Math.floor(Math.random() * stories.length);
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedQuizIndices(prev => new Set([...prev, randomIndex]));
    return randomIndex;
  }, [usedQuizIndices]);

  const rollDice = useCallback(() => {
    if (dice.isRolling || session.isGameOver || showQuiz) return;

    setDice({ value: 1, isRolling: true });
    
    // Animate dice roll
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDice(d => ({ ...d, value: Math.floor(Math.random() * 6) + 1 }));
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDice({ value: finalValue, isRolling: false });
        
        // Move player
        movePlayer(finalValue);
      }
    }, 100);
  }, [dice.isRolling, session.isGameOver, showQuiz]);

  const movePlayer = useCallback((steps: number) => {
    setSession(prev => {
      let newPosition = Math.min(prev.playerPosition + steps, BOARD_SIZE - 1);
      const space = boardSpaces[newPosition];
      
      const newSession = {
        ...prev,
        playerPosition: newPosition,
        turnsPlayed: prev.turnsPlayed + 1,
      };

      // Handle space type
      if (space.type === 'finish') {
        newSession.isGameOver = true;
        newSession.totalStars += 3; // Bonus for finishing
        setTimeout(() => setShowMessage('🎉 You finished the game! +3 Stars!'), 500);
      } else if (space.type === 'quiz') {
        const quizIndex = getNextQuiz();
        newSession.currentQuizIndex = quizIndex;
        setTimeout(() => setShowQuiz(true), 500);
      } else if (space.type === 'bonus') {
        newSession.totalStars += 1;
        setTimeout(() => setShowMessage('⭐ Bonus Star! +1 Star!'), 500);
      } else if (space.type === 'penalty') {
        // Move back 1 space (but not below 0)
        newSession.playerPosition = Math.max(0, newPosition - 1);
        setTimeout(() => setShowMessage('😅 Oops! Move back 1 space!'), 500);
      }

      return newSession;
    });
  }, [getNextQuiz]);

  const handleQuizAnswer = useCallback((isCorrect: boolean) => {
    setSession(prev => ({
      ...prev,
      quizzesAnswered: prev.quizzesAnswered + 1,
      quizzesCorrect: prev.quizzesCorrect + (isCorrect ? 1 : 0),
      totalStars: prev.totalStars + (isCorrect ? 2 : 0),
      currentQuizIndex: null,
    }));
    
    setShowQuiz(false);
    
    if (isCorrect) {
      setShowMessage('🎉 Correct! +2 Stars!');
    } else {
      setShowMessage('Keep trying! No stars this time.');
    }
  }, []);

  const dismissMessage = useCallback(() => {
    setShowMessage(null);
  }, []);

  const resetGame = useCallback(() => {
    setSession(INITIAL_SESSION);
    setDice({ value: 1, isRolling: false });
    setShowQuiz(false);
    setShowMessage(null);
    setUsedQuizIndices(new Set());
  }, []);

  const currentQuiz = session.currentQuizIndex !== null 
    ? stories[session.currentQuizIndex]?.quiz 
    : null;

  return {
    session,
    dice,
    showQuiz,
    showMessage,
    currentQuiz,
    rollDice,
    handleQuizAnswer,
    dismissMessage,
    resetGame,
  };
}
