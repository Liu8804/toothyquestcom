import { GameSession } from './types';
import { Star, HelpCircle, Trophy, RotateCcw } from 'lucide-react';

interface GameStatsProps {
  session: GameSession;
}

export function GameStats({ session }: GameStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Stars */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <div>
          <div className="text-xs text-muted-foreground">Stars</div>
          <div className="font-bold text-lg">{session.totalStars}</div>
        </div>
      </div>

      {/* Position */}
      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-blue-500" />
        <div>
          <div className="text-xs text-muted-foreground">Position</div>
          <div className="font-bold text-lg">{session.playerPosition}/8</div>
        </div>
      </div>

      {/* Quizzes */}
      <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-purple-500" />
        <div>
          <div className="text-xs text-muted-foreground">Quizzes</div>
          <div className="font-bold text-lg">{session.quizzesCorrect}/{session.quizzesAnswered}</div>
        </div>
      </div>

      {/* Turns */}
      <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3 flex items-center gap-2">
        <RotateCcw className="w-6 h-6 text-green-500" />
        <div>
          <div className="text-xs text-muted-foreground">Turns</div>
          <div className="font-bold text-lg">{session.turnsPlayed}</div>
        </div>
      </div>
    </div>
  );
}
