import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import finquoLogo from '@/assets/finquo-logo.png';

const ConsentScreen = () => {
  const { dispatch } = useGame();
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  const canProceed = consent1 && consent2;

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-28 h-auto mx-auto mb-4" />
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">Before We Begin</h2>
          <p className="text-game-muted font-body">We respect your privacy. Your responses will only be used to generate your Financial Intelligence Report.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setConsent1(!consent1)}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${consent1 ? 'bg-game-gold border-game-gold' : 'border-game-muted'}`}>
              {consent1 && <span className="text-sm text-white">✓</span>}
            </div>
            <span className="text-game-text text-sm font-body leading-relaxed">I agree to participate in this financial awareness assessment</span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setConsent2(!consent2)}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${consent2 ? 'bg-game-gold border-game-gold' : 'border-game-muted'}`}>
              {consent2 && <span className="text-sm text-white">✓</span>}
            </div>
            <span className="text-game-text text-sm font-body leading-relaxed">I consent to secure storage of my anonymized data</span>
          </label>
        </div>

        <p className="text-game-muted text-xs text-center mb-6 font-body">
          Aligned with India's Digital Personal Data Protection Act, 2023
        </p>

        <button
          disabled={!canProceed}
          onClick={() => {
            dispatch({ type: 'SET_CONSENT', value: true });
            dispatch({ type: 'SET_STEP', step: 'profile' });
          }}
          className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${canProceed ? 'gold-gradient text-white game-shadow hover:scale-105 active:scale-95' : 'bg-game-card text-game-muted cursor-not-allowed'}`}
        >
          Continue →
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'welcome' })}
          className="w-full mt-3 py-3 text-game-muted font-body text-sm hover:text-game-text transition-colors"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
};

export default ConsentScreen;
