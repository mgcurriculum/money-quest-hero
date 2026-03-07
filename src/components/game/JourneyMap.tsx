import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import MuteButton from './MuteButton';
import { levels } from '@/data/questions';

const JourneyMap = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const hasNarrated = useRef(false);

  const allCompleted = state.completedLevels.length === 7;

  useEffect(() => {
    if (!state.isMuted && !hasNarrated.current) {
      hasNarrated.current = true;
      const text = allCompleted
        ? "Wow, you crushed it! All levels done. Let's see how you scored."
        : "Here's your quest board! Tap any unlocked level to begin!";
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, allCompleted]);

  const getStatus = (idx: number) => {
    if (state.completedLevels.includes(idx)) return 'completed';
    if (idx === 0 || state.completedLevels.includes(idx - 1)) return 'unlocked';
    return 'locked';
  };

  return (
    <div className="min-h-screen game-gradient px-6 py-8 relative">
      <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="absolute top-4 right-4 z-20" />
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="mb-1"><span className="gold-text font-display font-bold text-base">FQ Test</span>{' '}<span className="text-game-muted text-xs font-body">by FinQuo Versity</span></p>
          <h2 className="text-2xl font-display font-bold text-game-text">Journey Map</h2>
        </motion.div>

        <div className="space-y-3">
          {levels.map((level, idx) => {
            const status = getStatus(idx);
            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                disabled={status === 'locked'}
                onClick={() => { stop(); dispatch({ type: 'START_LEVEL', level: idx }); }}
                className={`w-full glass-card rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  status === 'completed' ? 'border-2 border-game-green/50' :
                  status === 'unlocked' ? 'border-2 border-game-gold/50 hover:scale-[1.02] active:scale-[0.98]' :
                  'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`text-3xl w-12 h-12 rounded-xl flex items-center justify-center ${status === 'completed' ? 'bg-game-green/20' : 'bg-game-card'}`}>
                  {status === 'completed' ? '✅' : level.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="text-game-muted text-xs font-body">Level {idx}</p>
                  <p className="text-game-text font-display font-semibold">{level.title}</p>
                  <p className="text-game-muted text-xs font-body">{level.theme}</p>
                </div>
                <div className="text-game-muted text-xl">
                  {status === 'locked' ? '🔒' : status === 'completed' ? '' : '→'}
                </div>
              </motion.button>
            );
          })}
        </div>

        {allCompleted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <button
              onClick={() => { stop(); dispatch({ type: 'SET_STEP', step: 'reflection' }); }}
              className="w-full py-4 rounded-2xl font-display font-semibold text-lg gold-gradient text-white game-shadow pulse-glow hover:scale-105 active:scale-95 transition-transform"
            >
              View Your Results 🏆
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JourneyMap;
