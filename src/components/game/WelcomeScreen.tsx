import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import finquoLogo from '@/assets/finquo-logo-white.png';

const WelcomeScreen = () => {
  const { dispatch } = useGame();

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decorations */}
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
        {/* Brand */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <img src={finquoLogo} alt="FinQuo Versity" className="w-32 h-auto mx-auto" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-game-muted text-sm font-body tracking-widest uppercase mb-2"
        >
          FQ Test by FinQuo Versity
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-display font-bold text-game-text mb-4 leading-tight"
        >
          Your Money Journey{' '}
          <span className="gold-text">Starts Here</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-game-muted text-lg font-body mb-8 leading-relaxed"
        >
          Discover how smart you are with money through real-life scenarios. Takes only 5 minutes!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'consent' })}
            className="w-full py-4 px-8 rounded-2xl font-display font-semibold text-lg gold-gradient text-game-bg game-shadow pulse-glow transition-transform hover:scale-105 active:scale-95"
          >
            Start My Money Quest 🚀
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex items-center justify-center gap-6 text-game-muted text-sm"
        >
          <span className="flex items-center gap-1">⏱️ 5 min</span>
          <span className="flex items-center gap-1">🎮 18 scenarios</span>
          <span className="flex items-center gap-1">🏅 Free report</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
