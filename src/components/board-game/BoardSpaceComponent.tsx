import { cn } from '@/lib/utils';
import { BoardSpace } from './types';

interface BoardSpaceComponentProps {
  space: BoardSpace;
  isPlayerHere: boolean;
  isPassed: boolean;
}

const spaceColors: Record<BoardSpace['type'], string> = {
  start: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500',
  quiz: 'bg-blue-100 dark:bg-blue-900/50 border-blue-500',
  bonus: 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-500',
  penalty: 'bg-red-100 dark:bg-red-900/50 border-red-500',
  finish: 'bg-purple-100 dark:bg-purple-900/50 border-purple-500',
};

export function BoardSpaceComponent({ space, isPlayerHere, isPassed }: BoardSpaceComponentProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
        'rounded-xl border-4 transition-all duration-300',
        'shadow-md hover:shadow-lg',
        spaceColors[space.type],
        isPassed && 'opacity-60',
        isPlayerHere && 'ring-4 ring-primary ring-offset-2 scale-110 z-10'
      )}
    >
      {/* Space emoji */}
      <span className="text-3xl sm:text-4xl md:text-5xl">{space.emoji}</span>
      
      {/* Space label */}
      <span className="text-xs sm:text-sm font-bold text-center leading-tight mt-1">
        {space.label}
      </span>
      
      {/* Player token */}
      {isPlayerHere && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white">
          <span className="text-xl">🦷</span>
        </div>
      )}
      
      {/* Space number badge */}
      <span className="absolute -bottom-2 -left-2 w-6 h-6 bg-card border-2 border-border rounded-full flex items-center justify-center text-xs font-bold shadow">
        {space.id}
      </span>
    </div>
  );
}
