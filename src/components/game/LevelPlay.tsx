import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { levels } from '@/data/questions';

const LevelPlay = () => {
  const { state, dispatch } = useGame();
  const level = levels[state.currentLevel];
  const scenario = level.scenarios[state.currentQuestion];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (optIndex: number) => {
    const score = optIndex + 1; // 1-5
    setSelectedOption(optIndex);
    dispatch({ type: 'ANSWER_QUESTION', level: state.currentLevel, question: state.currentQuestion, score });

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (state.currentQuestion < 2) {
        dispatch({ type: 'NEXT_QUESTION' });
      } else {
        dispatch({ type: 'COMPLETE_LEVEL', level: state.currentLevel });
      }
    }, 800);
  };

  const feedbackMessages = ["Noted!", "Interesting!", "Good thinking!", "Great choice!", "Amazing mindset! 🌟"];

  return (
    <div className="min-h-screen game-gradient px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'journey' })}
            className="text-game-muted text-sm font-body hover:text-game-text transition-colors"
          >
            ✕ Exit
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.icon}</span>
            <span className="text-game-text font-display font-semibold text-sm">{level.title}</span>
          </div>
          <span className="text-game-muted text-sm font-body">{state.currentQuestion + 1}/3</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-game-card">
              <motion.div
                className="h-full gold-gradient"
                initial={{ width: 0 }}
                animate={{ width: i <= state.currentQuestion ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.currentLevel}-${state.currentQuestion}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Scenario */}
            <div className="glass-card rounded-2xl p-5 mb-6">
              <p className="text-game-text font-body leading-relaxed">{scenario.situation}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {scenario.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => !showFeedback && handleSelect(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left glass-card rounded-xl px-4 py-3 font-body text-sm transition-all ${
                    selectedOption === idx
                      ? 'border-2 border-game-gold text-game-gold scale-[0.98]'
                      : 'text-game-text hover:border-game-muted/50 hover:scale-[1.01]'
                  }`}
                >
                  <span className="text-game-muted mr-2 text-xs">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-6"
                >
                  <span className="text-game-gold font-display font-semibold text-lg">
                    {feedbackMessages[selectedOption]}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LevelPlay;
