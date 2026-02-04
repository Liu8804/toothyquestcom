import { BoardSpace } from './types';

// 8-space board configuration
export const boardSpaces: BoardSpace[] = [
  { id: 0, type: 'start', label: 'Start', emoji: '🏁' },
  { id: 1, type: 'quiz', label: 'Quiz', emoji: '❓' },
  { id: 2, type: 'bonus', label: 'Bonus Star', emoji: '⭐' },
  { id: 3, type: 'quiz', label: 'Quiz', emoji: '❓' },
  { id: 4, type: 'penalty', label: 'Oops!', emoji: '😅' },
  { id: 5, type: 'quiz', label: 'Quiz', emoji: '❓' },
  { id: 6, type: 'bonus', label: 'Bonus Star', emoji: '⭐' },
  { id: 7, type: 'quiz', label: 'Quiz', emoji: '❓' },
  { id: 8, type: 'finish', label: 'Finish!', emoji: '🏆' },
];

export const BOARD_SIZE = boardSpaces.length;
