import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import MuteButton from './MuteButton';
import { reflectionOptions } from '@/data/questions';

const interestOptions = [
  { text: "Not interested", emoji: "❌" },
  { text: "Slightly curious", emoji: "🤷" },
  { text: "Somewhat interested", emoji: "🤔" },
  { text: "Interested in learning more", emoji: "📚" },
  { text: "Actively learning about money", emoji: "🚀" },
];

const REFLECTION_TEXT_0 = "We're almost done! I'm curious — how interested are you in actually getting better with finances? Be honest!";
const REFLECTION_TEXT_1 = "Last question! If you could level up just one financial skill this year, which would it be? Pick the one that matters most to you.";

const ReflectionScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const hasNarrated = useRef<number>(-1);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!state.isMuted && hasNarrated.current !== step) {
      hasNarrated.current = step;
      const text = step === 0 ? REFLECTION_TEXT_0 : REFLECTION_TEXT_1;
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, step]);

  const handleInterestSelect = (_option: string) => {
    stop();
    setStep(1);
  };

  const handleReflectionSelect = (option: string) => {
    stop();
    dispatch({ type: 'SET_REFLECTION', answer: option });
    dispatch({ type: 'SET_STEP', step: 'report' });
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12 relative">
      <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="absolute top-4 right-4 z-20" />
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
        <p className="gold-text font-display font-bold text-lg mb-2">FQ Test</p>

        {step === 0 && (
          <>
            <span className="text-5xl mb-4 block">📚</span>
            <h2 className="text-3xl font-display font-bold text-game-text mb-2">Financial Mindset</h2>
            <p className="text-game-muted font-body mb-8">How interested are you in improving your financial knowledge?</p>
            <div className="space-y-2">
              {interestOptions.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => handleInterestSelect(opt.text)}
                  className="w-full glass-card rounded-xl px-5 py-4 text-game-text font-body text-left hover:border-game-gold/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span className="mr-2">{opt.emoji}</span> {opt.text}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <span className="text-5xl mb-4 block">🪞</span>
            <h2 className="text-3xl font-display font-bold text-game-text mb-2">Final Reflection</h2>
            <p className="text-game-muted font-body mb-8">If you could improve one financial skill this year, what would it be?</p>
            <div className="space-y-2">
              {reflectionOptions.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => handleReflectionSelect(opt)}
                  className="w-full glass-card rounded-xl px-5 py-4 text-game-text font-body text-left hover:border-game-gold/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ReflectionScreen;
