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
  description: string;
  solution: string;
  color: string;
}

interface Tool {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fixes: string[];
  color: string;
}

const TOOTH_PROBLEMS: ToothProblem[] = [
  { id: 'cavity', name: 'Cavity', emoji: '🦷🕳️', description: 'A hole in the tooth!', solution: 'filling', color: 'bg-amber-100 border-amber-400' },
  { id: 'yellow', name: 'Yellow Teeth', emoji: '😬', description: 'Teeth need cleaning!', solution: 'whitening', color: 'bg-yellow-100 border-yellow-400' },
  { id: 'crooked', name: 'Crooked', emoji: '↪️🦷', description: 'Teeth not straight!', solution: 'braces', color: 'bg-purple-100 border-purple-400' },
  { id: 'plaque', name: 'Plaque', emoji: '🦠', description: 'Germs on teeth!', solution: 'cleaning', color: 'bg-green-100 border-green-400' },
  { id: 'chip', name: 'Chipped', emoji: '💔', description: 'Tooth is broken!', solution: 'crown', color: 'bg-red-100 border-red-400' },
  { id: 'gap', name: 'Gap', emoji: '🦷 🦷', description: 'Space between teeth!', solution: 'bonding', color: 'bg-blue-100 border-blue-400' },
];

const TOOLS: Tool[] = [
  { id: 'filling', name: 'Filling', emoji: '✨', description: 'Fills holes!', fixes: ['cavity'], color: 'bg-amber-200' },
  { id: 'whitening', name: 'Whitening', emoji: '⚪', description: 'Makes teeth white!', fixes: ['yellow'], color: 'bg-white' },
  { id: 'braces', name: 'Braces', emoji: '🔷', description: 'Straightens teeth!', fixes: ['crooked'], color: 'bg-purple-200' },
  { id: 'cleaning', name: 'Cleaning', emoji: '🪥', description: 'Removes germs!', fixes: ['plaque'], color: 'bg-green-200' },
  { id: 'crown', name: 'Crown', emoji: '👑', description: 'Covers chips!', fixes: ['chip'], color: 'bg-red-200' },
  { id: 'bonding', name: 'Bonding', emoji: '🔗', description: 'Closes gaps!', fixes: ['gap'], color: 'bg-blue-200' },
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
      setScore(s => s + 25);
      setShowResult({ correct: true, message: `✅ ${tool.name} fixed the ${problem.name}!` });

      if (fixedProblems.size + 1 === problems.length) {
        const mistakePenalty = mistakes * 5;
        const finalScore = score + 25 - mistakePenalty + (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 10);
        setTimeout(() => {
          setScore(finalScore);
          setCompleted(true);
        }, 1200);
      }
    } else {
      setMistakes(m => m + 1);
      setShowResult({ correct: false, message: `❌ ${tool.name} can't fix ${problem.name}!` });
    }

    setSelectedTool(null);
    setTimeout(() => setShowResult(null), 1500);
  }, [selectedTool, fixedProblems, problems, score, mistakes, difficulty]);

  if (!difficulty) {
    return (
      <DifficultySelector
        game={{ 
          id: 'build_your_smile_pro', 
          name: t('games.buildSmilePro', 'Build Your Smile Pro'), 
          shortDescription: '', 
          instructionsKids: t('games.buildSmileProInstructions', 'Be a dentist! Pick the right tool, then tap the tooth problem to fix it!'), 
          instructionsParents: '', 
          winMessage: '', 
          loseMessage: '', 
          reward: '', 
          badgeName: '', 
          emoji: '🦷✨', 
          color: '' 
        }}
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
        <h2 className="text-2xl font-bold text-primary mb-2">{t('games.gorgeousSmile', 'Perfect Smile!')}</h2>
        <p className="text-lg mb-2">{t('games.score', 'Score')}: {score}</p>
        <p className="text-sm text-muted-foreground mb-4">{t('games.youFixedAllProblems', 'You fixed all the dental problems like a real dentist!')}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { onComplete(score); startGame(difficulty); }}>{t('common.playAgain', 'Play Again')}</Button>
          <Button variant="outline" onClick={() => { onComplete(score); onClose(); }}>{t('common.close', 'Close')}</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Stats */}
      <div className="flex justify-between w-full max-w-md bg-card rounded-lg p-3">
        <div className="text-lg font-bold">⭐ {score}</div>
        <div className="text-lg font-bold">✅ {fixedProblems.size}/{problems.length}</div>
        <div className="text-lg font-bold">❌ {mistakes}</div>
      </div>

      {/* Instructions */}
      <div className="text-center bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-3 max-w-md">
        <p className="font-bold text-primary mb-1">🩺 You're the Dentist!</p>
        <p className="text-sm">
          {selectedTool 
            ? `👆 Now tap a tooth problem to fix it with your ${TOOLS.find(t => t.id === selectedTool)?.name}!`
            : '👇 First, pick a tool from below!'}
        </p>
      </div>

      {/* Mouth with Teeth Problems */}
      <div className="bg-gradient-to-b from-pink-200 to-pink-300 dark:from-pink-900/50 dark:to-pink-800/50 rounded-3xl p-6 relative shadow-lg">
        <div className="text-center mb-4">
          <span className="text-4xl">👄</span>
          <p className="text-xs font-medium mt-1">Tap a problem to fix it!</p>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center max-w-sm">
          {problems.map(problem => {
            const isFixed = fixedProblems.has(problem.id);
            return (
              <motion.button
                key={problem.id}
                onClick={() => handleProblemClick(problem.id)}
                disabled={isFixed}
                className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-3 shadow-md ${
                  isFixed
                    ? 'bg-green-200 border-green-400'
                    : `${problem.color} ${selectedTool ? 'animate-pulse cursor-pointer' : 'cursor-default'}`
                }`}
                whileHover={{ scale: isFixed ? 1 : 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">{isFixed ? '🦷✨' : problem.emoji}</span>
                <span className="text-xs font-bold">{isFixed ? 'Fixed!' : problem.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                showResult.correct ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
              }`}
            >
              {showResult.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tools */}
      <div className="w-full max-w-md mt-4">
        <p className="text-center text-sm font-bold mb-3 text-primary">
          🧰 Pick Your Tool:
        </p>
        <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-4">
          {TOOLS.filter(tool => problems.some(p => p.solution === tool.id)).map(tool => (
            <motion.button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl shadow-md ${tool.color} ${
                selectedTool === tool.id
                  ? 'ring-4 ring-primary ring-offset-2 scale-105'
                  : 'hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{tool.emoji}</span>
              <span className="text-xs font-bold">{tool.name}</span>
              <span className="text-[10px] text-muted-foreground">{tool.description}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Fixed:</span>
        {problems.map((problem, i) => (
          <motion.div
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              fixedProblems.has(problem.id) ? 'bg-green-400 text-white' : 'bg-gray-300'
            }`}
            animate={fixedProblems.has(problem.id) ? { scale: [1, 1.3, 1] } : {}}
          >
            {fixedProblems.has(problem.id) ? '✓' : i + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BuildYourSmileProGame;
