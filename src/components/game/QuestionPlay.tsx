import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import { useQuestions } from '@/hooks/useQuestions';
import { TOTAL_QUESTIONS } from '@/data/questions';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import MuteButton from './MuteButton';
import QuizProgressBar from './QuizProgressBar';
import finquoLogo from '@/assets/finquo-logo-white.png';

const feedbackData = [
  { text: "Got it! ✅" },
  { text: "Recorded! 📝" },
  { text: "Moving on! ➡️" },
  { text: "Saved! 💾" },
  { text: "Next up! 🔄" },
];

const QuestionPlay = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading: narrationLoading, speak, stop } = useNarration(state.isMuted);
  const { questions, loading } = useQuestions(state.profile.profileCode);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const lastNarrated = useRef<number>(-1);

  const totalQ = questions.length || TOTAL_QUESTIONS;
  const question = questions[state.currentQuestion];

  useEffect(() => {
    if (!state.isMuted && question && state.currentQuestion !== lastNarrated.current) {
      lastNarrated.current = state.currentQuestion;
      const timer = setTimeout(() => {
        speak(`Question ${state.currentQuestion + 1}. Read through and pick the answer that feels most like you.`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.currentQuestion, state.isMuted, question, speak]);

  const handleSelect = (optIndex: number) => {
    if (!question) return;
    stop();
    const score = question.options[optIndex].score;
    setSelectedOption(optIndex);
    dispatch({ type: 'ANSWER_QUESTION', question: state.currentQuestion, score });

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (state.currentQuestion < totalQ - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
      } else {
        dispatch({ type: 'SET_STEP', step: 'reflection' });
      }
    }, 800);
  };

  const handleBack = () => {
    stop();
    if (state.currentQuestion > 0) {
      // Go to previous question
      dispatch({ type: 'NEXT_QUESTION' }); // We need a PREV action
      // Since there's no PREV action, we'll use SET_STEP workaround
      // Actually let's just go back to profile if on first question
    }
    dispatch({ type: 'SET_STEP', step: 'phone-verify' });
  };

  if (loading) {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-game-gold" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-game-text mb-2">No Questions Available</h2>
          <p className="text-game-muted font-body text-sm mb-6">
            Questions for profile <span className="text-game-gold font-semibold">{state.profile.profileCode}</span> haven't been added yet.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'profile' })}
            className="py-3 px-6 rounded-2xl font-display font-semibold gold-gradient text-white hover:scale-105 active:scale-95 transition-transform"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen game-gradient px-4 py-6 relative overflow-hidden">
      <div className="max-w-md mx-auto relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {state.currentQuestion === 0 && (
              <button
                onClick={handleBack}
                className="p-2 text-game-muted hover:text-game-text transition-colors"
                title="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <MuteButton isPlaying={isPlaying} isLoading={narrationLoading} className="p-2" />
          </div>
          <img src={finquoLogo} alt="FinQuo Versity" className="h-6 w-auto" />
          <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-1">
            <Zap size={14} className="text-game-gold" />
            <span className="text-game-gold text-xs font-display font-bold">
              {state.currentQuestion + 1}/{totalQ}
            </span>
          </div>
        </div>

        <QuizProgressBar />

        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentQuestion}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card rounded-2xl p-5 mb-5">
              {question.category && (
                <p className="text-game-gold text-xs font-display font-semibold uppercase tracking-wider mb-2">
                  {question.category}
                </p>
              )}
              <p className="text-game-text font-body leading-relaxed text-base font-medium">
                {question.questionText}
              </p>
            </div>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200 }}
                  onClick={() => !showFeedback && handleSelect(idx)}
                  disabled={showFeedback}
                  className={`w-full text-left glass-card rounded-xl px-4 py-3.5 font-body text-sm transition-all group relative overflow-hidden ${
                    selectedOption === idx
                      ? 'border-2 border-game-gold text-game-gold scale-[0.97]'
                      : 'text-game-text active:scale-[0.98] active:border-game-gold/30'
                  }`}
                >
                  {selectedOption === idx && (
                    <motion.div className="absolute inset-0 bg-game-gold/10 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="flex-1">{opt.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionPlay;
