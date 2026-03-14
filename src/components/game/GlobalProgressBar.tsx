import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { TOTAL_QUESTIONS } from '@/data/questions';

const GlobalProgressBar = () => {
  const { state } = useGame();

  const getProgress = (): number => {
    switch (state.step) {
      case 'welcome': return 0;
      case 'consent': return 3;
      case 'profile': return 7;
      case 'phone-verify': return 9;
      case 'quiz': {
        const qProgress = state.currentQuestion / TOTAL_QUESTIONS;
        return 10 + qProgress * 78;
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
