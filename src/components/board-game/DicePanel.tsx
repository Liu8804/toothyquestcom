import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DicePanelProps {
  diceValue: number;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DicePanel({ diceValue, isRolling, disabled, onRoll }: DicePanelProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dice display */}
      <div
        className={cn(
          'w-24 h-24 sm:w-28 sm:h-28 bg-card border-4 border-primary/30 rounded-2xl',
          'flex items-center justify-center shadow-xl transition-transform',
          isRolling && 'animate-spin'
        )}
      >
        <span className="text-6xl sm:text-7xl">{diceFaces[diceValue - 1]}</span>
      </div>
      
      {/* Roll button */}
      <Button
        onClick={onRoll}
        disabled={disabled}
        size="lg"
        className="rounded-full px-8 py-6 text-lg font-bold shadow-lg"
      >
        {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice!'}
      </Button>
    </div>
  );
}
