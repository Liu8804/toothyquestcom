interface StatsPanelProps {
  totalStars: number;
  playerPosition: number;
  quizzesCorrect: number;
  quizzesAnswered: number;
  turnsPlayed: number;
}

export function StatsPanel({
  totalStars,
  playerPosition,
  quizzesCorrect,
  quizzesAnswered,
  turnsPlayed,
}: StatsPanelProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
      <h3 className="text-lg font-bold text-center mb-3 text-primary">📊 Game Stats</h3>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
          <span className="text-xl">⭐</span>
          <div>
            <div className="text-xs text-muted-foreground">Stars</div>
            <div className="font-bold text-lg">{totalStars}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-xs text-muted-foreground">Position</div>
            <div className="font-bold text-lg">{playerPosition}/8</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
          <span className="text-xl">✅</span>
          <div>
            <div className="text-xs text-muted-foreground">Correct</div>
            <div className="font-bold text-lg">{quizzesCorrect}/{quizzesAnswered}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
          <span className="text-xl">🎲</span>
          <div>
            <div className="text-xs text-muted-foreground">Turns</div>
            <div className="font-bold text-lg">{turnsPlayed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
