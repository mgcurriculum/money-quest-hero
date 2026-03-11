import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import { useQuestions } from '@/hooks/useQuestions';
import { TOTAL_QUESTIONS } from '@/data/questions';
import { Zap, Star, Trophy, Sparkles, Shield, ChevronRight, Loader2 } from 'lucide-react';
import MuteButton from './MuteButton';
import QuizProgressBar from './QuizProgressBar';

const feedbackData = [
  { text: "Noted! 📝", icon: <Zap className="text-game-gold" size={28} /> },
  { text: "Interesting! 🧐", icon: <Star className="text-game-gold" size={28} /> },
  { text: "Bold move! 💪", icon: <Sparkles className="text-game-gold" size={28} /> },
  { text: "Smart thinking! 🧠", icon: <Trophy className="text-game-gold" size={28} /> },
  { text: "Power play! 🌟", icon: <Shield className="text-game-gold" size={28} /> },
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
        speak(`Question ${state.currentQuestion + 1}. ${question.category ? `This is about ${question.category}.` : ''} Read through and pick the answer that feels most like you.`);
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

    const feedbackText = feedbackData[optIndex % feedbackData.length].text.replace(/[^\w\s!?]/g, '');
    if (!state.isMuted) speak(feedbackText);

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (state.currentQuestion < totalQ - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
      } else {
        dispatch({ type: 'SET_STEP', step: 'reflection' });
      }
    }, 1200);
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
          <span className="text-5xl block mb-4">📝</span>
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
          <MuteButton isPlaying={isPlaying} isLoading={narrationLoading} className="p-2" />
          <motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center">
            <span className="gold-text font-display font-bold text-xs">FQ Test</span>
          </motion.div>
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
                      : 'text-game-text hover:border-game-gold/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {selectedOption === idx && (
                    <motion.div className="absolute inset-0 bg-game-gold/10 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="flex-1">{opt.text}</span>
                    <ChevronRight size={16} className="text-game-muted/40 group-hover:text-game-gold transition-colors flex-shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showFeedback && selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className="glass-card rounded-2xl px-8 py-6 text-center game-shadow">
                    <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                      {feedbackData[selectedOption % feedbackData.length].icon}
                    </motion.div>
                    <p className="text-game-gold font-display font-bold text-xl mt-2">
                      {feedbackData[selectedOption % feedbackData.length].text}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionPlay;
