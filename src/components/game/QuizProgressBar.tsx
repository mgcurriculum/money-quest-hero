import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { realityQuestions, levels } from '@/data/questions';

const QuizProgressBar = () => {
  const { state } = useGame();

  // Calculate total questions across all levels
  const realityCount = realityQuestions.length;
  const scenarioCount = levels.slice(1).reduce((sum, l) => sum + l.scenarios.length, 0);
  const totalQuestions = realityCount + scenarioCount;

  // Calculate answered questions
  let answered = 0;
  // Level 0 (reality check) answers
  if (state.answers[0]) {
    answered += Object.keys(state.answers[0]).length;
  }
  // Levels 1-6 answers
  for (let lvl = 1; lvl <= 6; lvl++) {
    if (state.answers[lvl]) {
      answered += Object.keys(state.answers[lvl]).length;
    }
  }

  const percentage = Math.round((answered / totalQuestions) * 100);

  return (
    <div className="glass-card rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-game-muted text-[10px] font-body uppercase tracking-wider">
          Overall Progress
        </span>
        <span className="text-game-gold font-display font-bold text-xs">
          {answered}/{totalQuestions} Questions • {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-game-bg/50">
        <motion.div
          className="h-full rounded-full gold-gradient"
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default QuizProgressBar;
