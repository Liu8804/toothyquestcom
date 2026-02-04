import { cn } from '@/lib/utils';
import { BoardSpace } from './types';

interface BoardSpaceProps {
  space: BoardSpace;
  isPlayerHere: boolean;
  isPassed: boolean;
}

const spaceColors: Record<BoardSpace['type'], string> = {
  start: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-400',
  quiz: 'bg-blue-100 dark:bg-blue-900 border-blue-400',
  bonus: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400',
  penalty: 'bg-red-100 dark:bg-red-900 border-red-400',
  finish: 'bg-purple-100 dark:bg-purple-900 border-purple-400',
};

export function BoardSpaceComponent({ space, isPlayerHere, isPassed }: BoardSpaceProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl border-3 transition-all',
        spaceColors[space.type],
        isPassed && 'opacity-50',
        isPlayerHere && 'ring-4 ring-primary ring-offset-2 scale-110'
      )}
    >
      {/* Space emoji */}
      <span className="text-2xl md:text-3xl">{space.emoji}</span>
      
      {/* Space label */}
      <span className="text-[10px] md:text-xs font-medium text-center leading-tight mt-0.5">
        {space.label}
      </span>
      
      {/* Player token */}
      {isPlayerHere && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-lg">🦷</span>
        </div>
      )}
      
      {/* Space number */}
      <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold">
        {space.id}
      </span>
    </div>
  );
}
