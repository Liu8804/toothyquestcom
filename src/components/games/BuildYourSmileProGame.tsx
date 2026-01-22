import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DifficultySelector, { Difficulty } from './DifficultySelector';
import { useTranslation } from 'react-i18next';

interface BuildYourSmileProGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

interface ToothProblem {
  id: string;
  name: string;
  emoji: string;
  solution: string;
  solutionEmoji: string;
}

interface Tool {
  id: string;
  name: string;
  emoji: string;
  fixes: string[];
}

const TOOTH_PROBLEMS: ToothProblem[] = [
  { id: 'cavity', name: 'Cavity', emoji: '🦷🕳️', solution: 'filling', solutionEmoji: '✨' },
  { id: 'yellow', name: 'Yellow Teeth', emoji: '🟡🦷', solution: 'whitening', solutionEmoji: '⚪' },
  { id: 'crooked', name: 'Crooked Teeth', emoji: '↩️🦷', solution: 'braces', solutionEmoji: '🔲' },
  { id: 'plaque', name: 'Plaque', emoji: '🦠🦷', solution: 'cleaning', solutionEmoji: '🧹' },
  { id: 'chip', name: 'Chipped Tooth', emoji: '💔🦷', solution: 'crown', solutionEmoji: '👑' },
  { id: 'gap', name: 'Gap', emoji: '🦷  🦷', solution: 'bonding', solutionEmoji: '🔗' },
];

const TOOLS: Tool[] = [
  { id: 'filling', name: 'Filling', emoji: '✨', fixes: ['cavity'] },
  { id: 'whitening', name: 'Whitening', emoji: '⚪', fixes: ['yellow'] },
  { id: 'braces', name: 'Braces', emoji: '🔲', fixes: ['crooked'] },
  { id: 'cleaning', name: 'Cleaning', emoji: '🧹', fixes: ['plaque'] },
  { id: 'crown', name: 'Crown', emoji: '👑', fixes: ['chip'] },
  { id: 'bonding', name: 'Bonding', emoji: '🔗', fixes: ['gap'] },
];

export const BuildYourSmileProGame: React.FC<BuildYourSmileProGameProps> = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [problems, setProblems] = useState<ToothProblem[]>([]);
  const [fixedProblems, setFixedProblems] = useState<Set<string>>(new Set());
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showResult, setShowResult] = useState<{ correct: boolean; message: string } | null>(null);

  const startGame = useCallback((diff: Difficulty) => {
    const problemCount = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 6;
    const shuffled = [...TOOTH_PROBLEMS].sort(() => Math.random() - 0.5).slice(0, problemCount);
    setProblems(shuffled);
    setFixedProblems(new Set());
    setSelectedTool(null);
    setScore(0);
    setMistakes(0);
    setCompleted(false);
    setShowResult(null);
    setDifficulty(diff);
  }, []);

  const handleProblemClick = useCallback((problemId: string) => {
    if (!selectedTool || fixedProblems.has(problemId)) return;

    const tool = TOOLS.find(t => t.id === selectedTool);
    const problem = problems.find(p => p.id === problemId);
    
    if (!tool || !problem) return;

    if (tool.fixes.includes(problemId)) {
      setFixedProblems(prev => new Set([...prev, problemId]));
      setScore(s => s + 20);
      setShowResult({ correct: true, message: `${problem.name} fixed with ${tool.name}!` });

      // Check if all problems are fixed
      if (fixedProblems.size + 1 === problems.length) {
        const mistakePenalty = mistakes * 5;
        const finalScore = score + 20 - mistakePenalty + (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10);
        setTimeout(() => {
          setScore(finalScore);
          setCompleted(true);
        }, 1000);
      }
    } else {
      setMistakes(m => m + 1);
      setShowResult({ correct: false, message: `${tool.name} doesn't fix ${problem.name}!` });
    }

    setSelectedTool(null);
    setTimeout(() => setShowResult(null), 1500);
  }, [selectedTool, fixedProblems, problems, score, mistakes, difficulty]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ id: 'build_your_smile_pro', name: t('games.buildSmilePro', 'Build Your Smile Pro'), shortDescription: '', instructionsKids: t('games.buildSmileProInstructions', 'Choose the right tools to make teeth healthy and shiny!'), instructionsParents: '', winMessage: '', loseMessage: '', reward: '', badgeName: '', emoji: '✨', color: '' }}
        onSelectDifficulty={startGame}
      />
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-6"
      >
        <div className="text-6xl mb-4">😁</div>
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.gorgeousSmile', 'Gorgeous Smile!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">{t('games.youFixedAllProblems', 'You fixed all the dental problems!')}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-md">
        <div className="text-lg">⭐ {score}</div>
        <div className="text-lg">✅ {fixedProblems.size}/{problems.length}</div>
        <div className="text-lg">❌ {mistakes}</div>
      </div>

      {/* Smile with problems */}
      <div className="bg-pink-100 rounded-2xl p-6 relative">
        <div className="flex flex-wrap gap-3 justify-center max-w-sm">
          {problems.map(problem => (
            <motion.button
              key={problem.id}
              onClick={() => handleProblemClick(problem.id)}
              disabled={fixedProblems.has(problem.id)}
              className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl ${
                fixedProblems.has(problem.id)
                  ? 'bg-green-200'
                  : 'bg-white hover:bg-yellow-50 cursor-pointer'
              }`}
              whileHover={{ scale: fixedProblems.has(problem.id) ? 1 : 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {fixedProblems.has(problem.id) ? '🦷✨' : problem.emoji}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold ${
                showResult.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}
            >
              {showResult.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tools */}
      <div className="mt-8">
        <p className="text-center text-sm text-muted-foreground mb-2">{t('games.selectToolFirst', 'Select a tool, then tap the problem to fix:')}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {TOOLS.map(tool => (
            <motion.button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                selectedTool === tool.id
                  ? 'bg-blue-400 text-white ring-2 ring-blue-600'
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100 hover:from-blue-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">{tool.emoji}</span>
              <span className="text-sm">{tool.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuildYourSmileProGame;
