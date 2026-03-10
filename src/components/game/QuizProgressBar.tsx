import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { TOTAL_QUESTIONS } from '@/data/questions';

const QuizProgressBar = () => {
  const { state } = useGame();
  const answered = Object.keys(state.answers).length;
  const percentage = Math.round((answered / TOTAL_QUESTIONS) * 100);

  return (
    <div className="glass-card rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-game-muted text-[10px] font-body uppercase tracking-wider">
          Overall Progress
        </span>
        <span className="text-game-gold font-display font-bold text-xs">
          {answered}/{TOTAL_QUESTIONS} Questions • {percentage}%
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
