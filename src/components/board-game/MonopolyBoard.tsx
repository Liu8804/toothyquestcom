import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import { boardSpaces } from './boardConfig';
import { useBoardGameLogic } from './useBoardGameLogic';
import { BoardSpaceComponent } from './BoardSpaceComponent';
import { DicePanel } from './DicePanel';
import { StatsPanel } from './StatsPanel';
import { QuizOverlay } from './QuizOverlay';
import { MessageOverlay } from './MessageOverlay';
import { GameOverPanel } from './GameOverPanel';

export function MonopolyBoard() {
  const navigate = useNavigate();
  const {
    state,
    currentQuiz,
    rollDice,
    handleQuizAnswer,
    dismissMessage,
    resetGame,
  } = useBoardGameLogic();

  const handleExit = () => {
    navigate('/');
  };

  // Check if dice should be disabled
  const isDiceDisabled = state.isRolling || state.showQuiz || state.isGameOver || state.message !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-primary flex items-center gap-2">
          🦷 ToothyQuest Board
        </h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetGame}
            className="rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleExit}
            className="rounded-full"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main board layout - 3x3 grid with center controls */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Row 1: Spaces 0, 1, 2 */}
          {boardSpaces.filter(s => s.gridRow === 1).sort((a, b) => a.gridCol - b.gridCol).map(space => (
            <div key={space.id} className="flex justify-center">
              <BoardSpaceComponent
                space={space}
                isPlayerHere={state.playerPosition === space.id}
                isPassed={space.id < state.playerPosition && space.id !== 8}
              />
            </div>
          ))}

          {/* Row 2: Space 7, Center (Dice/Stats), Space 3 */}
          <div className="flex justify-center">
            <BoardSpaceComponent
              space={boardSpaces.find(s => s.id === 7)!}
              isPlayerHere={state.playerPosition === 7}
              isPassed={7 < state.playerPosition}
            />
          </div>
          
          {/* Center area - Dice and Stats */}
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Finish space is in center */}
            <BoardSpaceComponent
              space={boardSpaces.find(s => s.id === 8)!}
              isPlayerHere={state.playerPosition === 8}
              isPassed={false}
            />
          </div>
          
          <div className="flex justify-center">
            <BoardSpaceComponent
              space={boardSpaces.find(s => s.id === 3)!}
              isPlayerHere={state.playerPosition === 3}
              isPassed={3 < state.playerPosition}
            />
          </div>

          {/* Row 3: Spaces 6, 5, 4 */}
          {boardSpaces.filter(s => s.gridRow === 3).sort((a, b) => a.gridCol - b.gridCol).map(space => (
            <div key={space.id} className="flex justify-center">
              <BoardSpaceComponent
                space={space}
                isPlayerHere={state.playerPosition === space.id}
                isPassed={space.id < state.playerPosition}
              />
            </div>
          ))}
        </div>

        {/* Controls below board */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dice Panel */}
          <div className="flex justify-center">
            <DicePanel
              diceValue={state.diceValue}
              isRolling={state.isRolling}
              disabled={isDiceDisabled}
              onRoll={rollDice}
            />
          </div>

          {/* Stats Panel */}
          <div className="flex justify-center">
            <StatsPanel
              totalStars={state.totalStars}
              playerPosition={state.playerPosition}
              quizzesCorrect={state.quizzesCorrect}
              quizzesAnswered={state.quizzesAnswered}
              turnsPlayed={state.turnsPlayed}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded border-2 border-emerald-500" />
              Start
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900/50 rounded border-2 border-blue-500" />
              Quiz (+2⭐)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/50 rounded border-2 border-yellow-500" />
              Bonus (+1⭐)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-100 dark:bg-red-900/50 rounded border-2 border-red-500" />
              Penalty (-1 space)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-purple-100 dark:bg-purple-900/50 rounded border-2 border-purple-500" />
              Finish (+3⭐)
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>🎲 Roll the dice to move around the board • ❓ Answer quizzes to earn stars • 🏆 Reach the finish!</p>
        </div>
      </div>

      {/* Overlays */}
      {state.showQuiz && currentQuiz && (
        <QuizOverlay
          quiz={currentQuiz}
          onAnswer={handleQuizAnswer}
        />
      )}

      {state.message && !state.isGameOver && (
        <MessageOverlay
          message={state.message}
          onDismiss={dismissMessage}
        />
      )}

      {state.isGameOver && (
        <GameOverPanel
          totalStars={state.totalStars}
          quizzesCorrect={state.quizzesCorrect}
          quizzesAnswered={state.quizzesAnswered}
          turnsPlayed={state.turnsPlayed}
          onPlayAgain={resetGame}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
