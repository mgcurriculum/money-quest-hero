import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { reflectionOptions } from '@/data/questions';

const ReflectionScreen = () => {
  const { state, dispatch } = useGame();

  const handleSelect = (option: string) => {
    dispatch({ type: 'SET_REFLECTION', answer: option });
    dispatch({ type: 'SET_STEP', step: 'report' });
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
        <span className="text-5xl mb-4 block">🪞</span>
        <h2 className="text-3xl font-display font-bold text-game-text mb-2">Final Reflection</h2>
        <p className="text-game-muted font-body mb-8">If you could improve one money skill this year, what would it be?</p>

        <div className="space-y-2">
          {reflectionOptions.map((opt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => handleSelect(opt)}
              className="w-full glass-card rounded-xl px-5 py-4 text-game-text font-body text-left hover:border-game-gold/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReflectionScreen;
