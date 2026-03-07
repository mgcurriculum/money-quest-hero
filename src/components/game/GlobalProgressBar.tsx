import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { realityQuestions } from '@/data/questions';

const GlobalProgressBar = () => {
  const { state } = useGame();

  const getProgress = (): number => {
    switch (state.step) {
      case 'welcome': return 0;
      case 'consent': return 3;
      case 'profile': return 7;
      case 'level': {
        // Level 0: questions 0-6 → progress 12-25%
        // Levels 1-6: 3 questions each → progress 25-88%
        if (state.currentLevel === 0) {
          const totalQ = realityQuestions.length;
          const qProgress = state.currentQuestion / totalQ;
          return 12 + qProgress * 13;
        }
        // Levels 1-6: each level is ~10.5% of total
        const levelBase = 25 + (state.currentLevel - 1) * 10.5;
        const qProgress = state.currentQuestion / 3;
        return levelBase + qProgress * 10.5;
      }
      case 'reflection': return 90;
      case 'report': return 100;
      default: return 0;
    }
  };

  const progress = getProgress();

  if (state.step === 'report') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-game-card/50">
      <motion.div
        className="h-full gold-gradient"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

export default GlobalProgressBar;
