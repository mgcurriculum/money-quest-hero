import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { User, RefreshCw } from 'lucide-react';
import finquoLogo from '@/assets/finquo-logo-white.png';

const ExistingUserScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleRetakeTest = () => {
    dispatch({ type: 'START_QUIZ' });
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">
            Welcome Back, <span className="gold-text">{state.profile.name || 'User'}!</span>
          </h2>
          <p className="text-game-muted text-sm font-body">
            We found your previous evaluation. What would you like to do?
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleViewProfile}
            className="w-full glass-card rounded-2xl p-5 flex items-center gap-4 border border-game-gold/20 hover:border-game-gold/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-game-gold/20 flex items-center justify-center shrink-0 group-hover:bg-game-gold/30 transition-colors">
              <User size={24} className="text-game-gold" />
            </div>
            <div>
              <p className="text-game-text font-display font-semibold text-lg">View Profile</p>
              <p className="text-game-muted text-xs font-body">See your scores, history & detailed report</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            onClick={handleRetakeTest}
            className="w-full glass-card rounded-2xl p-5 flex items-center gap-4 border border-game-card hover:border-game-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-game-surface flex items-center justify-center shrink-0 group-hover:bg-game-gold/10 transition-colors">
              <RefreshCw size={24} className="text-game-muted group-hover:text-game-gold transition-colors" />
            </div>
            <div>
              <p className="text-game-text font-display font-semibold text-lg">Retake Test</p>
              <p className="text-game-muted text-xs font-body">Start a fresh evaluation from scratch</p>
            </div>
          </motion.button>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full mt-6 py-3 text-game-muted font-body text-sm hover:text-game-text transition-colors"
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ExistingUserScreen;
