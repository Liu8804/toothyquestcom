// Monopoly-style Board Game Types

export type SpaceType = 'start' | 'quiz' | 'bonus' | 'penalty' | 'finish';

export interface BoardSpace {
  id: number;
  type: SpaceType;
  label: string;
  emoji: string;
  // Grid position for rectangular layout
  gridRow: number;
  gridCol: number;
}

export interface GameState {
  playerPosition: number;
  totalStars: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  turnsPlayed: number;
  isGameOver: boolean;
  isRolling: boolean;
  diceValue: number;
  showQuiz: boolean;
  currentQuizIndex: number | null;
  message: string | null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}
