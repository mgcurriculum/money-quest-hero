import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import MuteButton from './MuteButton';
import finquoLogo from '@/assets/finquo-logo-white.png';

const WELCOME_TEXT = "Hey there! I'm your financial guide. This is a quick quiz that'll help you understand how smart you really are with money. It only takes about 3 minutes. Ready? Just tap Start!";

const WelcomeScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const hasNarrated = useRef(false);

  useEffect(() => {
    if (!state.isMuted && !hasNarrated.current) {
      hasNarrated.current = true;
      const timer = setTimeout(() => speak(WELCOME_TEXT), 600);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak]);

  const handleStart = () => {
    stop();
    dispatch({ type: 'SET_STEP', step: 'consent' });
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="absolute top-4 right-4 z-20" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-5xl float-animation opacity-30">💰</div>
        <div className="absolute top-40 right-8 text-4xl float-animation opacity-20" style={{ animationDelay: '1s' }}>📈</div>
        <div className="absolute bottom-32 left-16 text-4xl float-animation opacity-25" style={{ animationDelay: '0.5s' }}>🛡️</div>
        <div className="absolute bottom-20 right-14 text-5xl float-animation opacity-20" style={{ animationDelay: '1.5s' }}>💼</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="mb-6">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-32 h-auto mx-auto" />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-game-muted text-sm font-body tracking-widest uppercase mb-2">
          <span className="gold-text font-display font-bold text-base">FQ Test</span>{' '}
          <span className="text-game-muted text-xs">by FinQuo Versity</span>
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-4xl md:text-5xl font-display font-bold text-game-text mb-4 leading-tight">
          Your Financial Journey{' '}<span className="gold-text">Starts Here</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-game-muted text-lg font-body mb-8 leading-relaxed">
          Discover how smart you are with money through real-life scenarios. Discover how smart you are with money through real-life scenarios. Takes only 3 minutes!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-3">
          <button onClick={handleStart} className="w-full py-4 px-8 rounded-2xl font-display font-semibold text-lg gold-gradient text-game-bg game-shadow pulse-glow transition-transform hover:scale-105 active:scale-95">
            Start My FQ Test 🚀
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex items-center justify-center gap-6 text-game-muted text-sm">
          <span className="flex items-center gap-1"><span className="flex items-center gap-1">⏱️ 3 min</span></span>
          <span className="flex items-center gap-1">🎮 18 questions</span>
          <span className="flex items-center gap-1">🏅 Free report</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
