import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, RotateCcw } from 'lucide-react';
import { boardSpaces } from './boardConfig';
import { useBoardGameState } from './useBoardGameState';
import { BoardSpaceComponent } from './BoardSpaceComponent';
import { DiceComponent } from './DiceComponent';
import { QuizModal } from './QuizModal';
import { MessageModal } from './MessageModal';
import { GameStats } from './GameStats';

interface BoardGameQuizGameProps {
  onClose: () => void;
}

export function BoardGameQuizGame({ onClose }: BoardGameQuizGameProps) {
  const {
    session,
    dice,
    showQuiz,
    showMessage,
    currentQuiz,
    rollDice,
    handleQuizAnswer,
    dismissMessage,
    resetGame,
  } = useBoardGameState();

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="min-h-screen p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold font-display text-primary flex items-center gap-2">
            🦷 ToothyQuest Board Game
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={resetGame} className="rounded-full">
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="mb-6">
          <GameStats session={session} />
        </div>

        {/* Main Game Area */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              🗺️ Game Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Board Grid */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 p-4 bg-muted/30 rounded-2xl">
              {boardSpaces.map((space) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: space.id * 0.1 }}
                >
                  <BoardSpaceComponent
                    space={space}
                    isPlayerHere={session.playerPosition === space.id}
                    isPassed={space.id < session.playerPosition}
                  />
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded border border-blue-400" />
                Quiz
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded border border-yellow-400" />
                Bonus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded border border-red-400" />
                Penalty
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dice & Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {session.isGameOver ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    🏆
                  </motion.div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You finished the game with {session.totalStars} stars!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={resetGame} className="rounded-full">
                      🔄 Play Again
                    </Button>
                    <Button variant="outline" onClick={onClose} className="rounded-full">
                      Exit
                    </Button>
                  </div>
                </div>
              ) : (
                <DiceComponent
                  dice={dice}
                  onRoll={rollDice}
                  disabled={showQuiz || showMessage !== null}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-muted/50 rounded-xl text-center text-sm text-muted-foreground">
          <p>🎲 Roll the dice to move forward • ❓ Answer quizzes to earn stars • ⭐ Land on bonus for free stars!</p>
        </div>
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <QuizModal
          quiz={currentQuiz}
          isOpen={showQuiz}
          onAnswer={handleQuizAnswer}
        />
      )}

      {/* Message Modal */}
      <MessageModal message={showMessage} onDismiss={dismissMessage} />
    </div>
  );
}
