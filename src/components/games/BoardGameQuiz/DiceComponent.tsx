import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DiceRoll } from './types';

interface DiceComponentProps {
  dice: DiceRoll;
  onRoll: () => void;
  disabled: boolean;
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function DiceComponent({ dice, onRoll, disabled }: DiceComponentProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice display */}
      <div
        className={cn(
          'w-20 h-20 bg-card border-4 border-border rounded-2xl flex items-center justify-center shadow-lg transition-transform',
          dice.isRolling && 'animate-spin'
        )}
      >
        <span className="text-5xl">{diceFaces[dice.value - 1]}</span>
      </div>
      
      {/* Roll button */}
      <Button
        onClick={onRoll}
        disabled={disabled || dice.isRolling}
        size="lg"
        className="rounded-full px-8 font-bold"
      >
        {dice.isRolling ? 'Rolling...' : '🎲 Roll Dice'}
      </Button>
    </div>
  );
}
