import { useState, useCallback, useRef } from 'react';
import { GameState, QuizQuestion } from './types';
import { boardSpaces, FINISH_SPACE } from './boardConfig';
import { getRandomQuiz } from './quizData';

const initialState: GameState = {
  playerPosition: 0,
  totalStars: 0,
  quizzesAnswered: 0,
  quizzesCorrect: 0,
  turnsPlayed: 0,
  isGameOver: false,
  isRolling: false,
  diceValue: 1,
  showQuiz: false,
  currentQuizIndex: null,
  message: null,
};

export function useBoardGameLogic() {
  const [state, setState] = useState<GameState>(initialState);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const usedQuizIndices = useRef<number[]>([]);

  const rollDice = useCallback(() => {
    if (state.isRolling || state.showQuiz || state.isGameOver || state.message) return;

    setState(prev => ({ ...prev, isRolling: true }));

    // Animate dice roll
    const rollDuration = 1000;
    const intervalId = setInterval(() => {
      setState(prev => ({
        ...prev,
        diceValue: Math.floor(Math.random() * 6) + 1,
      }));
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      
      setState(prev => {
        // Calculate new position (cap at finish)
        let newPosition = prev.playerPosition + finalValue;
        if (newPosition >= FINISH_SPACE) {
          newPosition = FINISH_SPACE;
        }

        return {
          ...prev,
          isRolling: false,
          diceValue: finalValue,
          playerPosition: newPosition,
          turnsPlayed: prev.turnsPlayed + 1,
        };
      });

      // Process space after dice animation
      setTimeout(() => {
        processSpace();
      }, 500);
    }, rollDuration);
  }, [state.isRolling, state.showQuiz, state.isGameOver, state.message]);

  const processSpace = useCallback(() => {
    setState(prev => {
      const currentSpace = boardSpaces.find(s => s.id === prev.playerPosition);
      if (!currentSpace) return prev;

      switch (currentSpace.type) {
        case 'quiz':
          // Get a random quiz
          const { quiz, index } = getRandomQuiz(usedQuizIndices.current);
          usedQuizIndices.current.push(index);
          setCurrentQuiz(quiz);
          return { ...prev, showQuiz: true, currentQuizIndex: index };

        case 'bonus':
          return {
            ...prev,
            totalStars: prev.totalStars + 1,
            message: '⭐ Bonus Star! You earned a free star!',
          };

        case 'penalty':
          const newPos = Math.max(0, prev.playerPosition - 1);
          return {
            ...prev,
            playerPosition: newPos,
            message: '😅 Oops! Move back one space!',
          };

        case 'finish':
          return {
            ...prev,
            isGameOver: true,
            totalStars: prev.totalStars + 3, // Bonus for finishing
            message: '🏆 You finished the game! +3 bonus stars!',
          };

        default:
          return prev;
      }
    });
  }, []);

  const handleQuizAnswer = useCallback((selectedIndex: number) => {
    if (!currentQuiz) return;

    const isCorrect = selectedIndex === currentQuiz.correctAnswer;

    setState(prev => ({
      ...prev,
      showQuiz: false,
      quizzesAnswered: prev.quizzesAnswered + 1,
      quizzesCorrect: isCorrect ? prev.quizzesCorrect + 1 : prev.quizzesCorrect,
      totalStars: isCorrect ? prev.totalStars + 2 : prev.totalStars,
      message: isCorrect 
        ? '🎉 Correct! +2 Stars!' 
        : `😊 Nice try! The answer was: ${currentQuiz.options[currentQuiz.correctAnswer]}`,
    }));

    setCurrentQuiz(null);
  }, [currentQuiz]);

  const dismissMessage = useCallback(() => {
    setState(prev => ({ ...prev, message: null }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
    setCurrentQuiz(null);
    usedQuizIndices.current = [];
  }, []);

  return {
    state,
    currentQuiz,
    rollDice,
    handleQuizAnswer,
    dismissMessage,
    resetGame,
  };
}
