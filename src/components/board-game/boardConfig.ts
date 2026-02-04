import { BoardSpace } from './types';

// 9-space rectangular board layout
// Layout visualization:
//   [0:START] [1:Quiz] [2:Bonus]
//   [7:Quiz ]          [3:Quiz ]
//   [6:Bonus] [5:Quiz] [4:Penalty]
//                      [8:FINISH] (corner)

export const boardSpaces: BoardSpace[] = [
  // Top row (left to right)
  { id: 0, type: 'start', label: 'START', emoji: '🏁', gridRow: 1, gridCol: 1 },
  { id: 1, type: 'quiz', label: 'Quiz', emoji: '❓', gridRow: 1, gridCol: 2 },
  { id: 2, type: 'bonus', label: 'Bonus!', emoji: '⭐', gridRow: 1, gridCol: 3 },
  
  // Right column (top to bottom)
  { id: 3, type: 'quiz', label: 'Quiz', emoji: '❓', gridRow: 2, gridCol: 3 },
  { id: 4, type: 'penalty', label: 'Oops!', emoji: '😅', gridRow: 3, gridCol: 3 },
  
  // Bottom row (right to left)
  { id: 5, type: 'quiz', label: 'Quiz', emoji: '❓', gridRow: 3, gridCol: 2 },
  { id: 6, type: 'bonus', label: 'Bonus!', emoji: '⭐', gridRow: 3, gridCol: 1 },
  
  // Left column (bottom to top)
  { id: 7, type: 'quiz', label: 'Quiz', emoji: '❓', gridRow: 2, gridCol: 1 },
  
  // Finish (back near start area)
  { id: 8, type: 'finish', label: 'FINISH!', emoji: '🏆', gridRow: 2, gridCol: 2 },
];

export const BOARD_SIZE = boardSpaces.length;
export const FINISH_SPACE = 8;
