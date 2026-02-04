// Board Game Quiz Types

export type SpaceType = 'quiz' | 'bonus' | 'penalty' | 'start' | 'finish';

export interface BoardSpace {
  id: number;
  type: SpaceType;
  label: string;
  emoji: string;
}

export interface GameSession {
  playerPosition: number;
  totalStars: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  turnsPlayed: number;
  isGameOver: boolean;
  currentQuizIndex: number | null;
}

export interface DiceRoll {
  value: number;
  isRolling: boolean;
}
