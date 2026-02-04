import { Button } from '@/components/ui/button';

interface GameOverPanelProps {
  totalStars: number;
  quizzesCorrect: number;
  quizzesAnswered: number;
  turnsPlayed: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function GameOverPanel({
  totalStars,
  quizzesCorrect,
  quizzesAnswered,
  turnsPlayed,
  onPlayAgain,
  onExit,
}: GameOverPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400 text-center animate-in zoom-in-95 duration-300">
        {/* Trophy */}
        <div className="text-7xl mb-4 animate-bounce">🏆</div>
        
        <h2 className="text-3xl font-bold text-primary mb-2">
          Congratulations!
        </h2>
        
        <p className="text-muted-foreground mb-6">
          You completed the ToothyQuest Board Game!
        </p>

        {/* Final stats */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-xs text-muted-foreground">Total Stars</div>
                <div className="font-bold text-xl text-yellow-600">{totalStars}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-xs text-muted-foreground">Quizzes</div>
                <div className="font-bold text-xl text-green-600">{quizzesCorrect}/{quizzesAnswered}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎲</span>
              <div>
                <div className="text-xs text-muted-foreground">Turns Taken</div>
                <div className="font-bold text-xl">{turnsPlayed}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
                <div className="font-bold text-xl">
                  {quizzesAnswered > 0 
                    ? Math.round((quizzesCorrect / quizzesAnswered) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onPlayAgain}
            className="flex-1 rounded-full py-6 text-lg font-bold"
          >
            🔄 Play Again
          </Button>
          
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 rounded-full py-6 text-lg font-bold"
          >
            🏠 Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
