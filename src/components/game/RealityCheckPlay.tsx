import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { realityQuestions } from '@/data/questions';
import { Zap, Star, ChevronRight } from 'lucide-react';
import { useNarration } from '@/hooks/useNarration';
import MuteButton from './MuteButton';
import QuizProgressBar from './QuizProgressBar';

const feedbackData = [
  { text: "Noted! 📝" },
  { text: "Interesting! 🧐" },
  { text: "Got it! 👍" },
  { text: "Great choice! 💪" },
  { text: "Awesome! 🌟" },
];

const RealityCheckPlay = () => {
  const { state, dispatch } = useGame();
  const question = realityQuestions[state.currentQuestion];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const lastNarratedQuestion = useRef<number>(-1);

  const totalQuestions = realityQuestions.length;

  useEffect(() => {
    if (!state.isMuted && question && state.currentQuestion !== lastNarratedQuestion.current) {
      lastNarratedQuestion.current = state.currentQuestion;
      const timer = setTimeout(() => {
        speak(`Here's a question about ${question.category}. Take a moment to read it and pick the answer that feels most like you.`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.currentQuestion, state.isMuted, question, speak]);

  const handleSelect = (optIndex: number) => {
    stop();
    const score = optIndex + 1;
    setSelectedOption(optIndex);
    dispatch({ type: 'ANSWER_QUESTION', level: 0, question: state.currentQuestion, score });

    const feedbackText = feedbackData[optIndex % feedbackData.length].text.replace(/[^\w\s!?]/g, '');
    if (!state.isMuted) {
      speak(feedbackText);
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (state.currentQuestion < totalQuestions - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
      } else {
        dispatch({ type: 'COMPLETE_LEVEL', level: 0 });
      }
    }, 1200);
  };

  if (!question) return null;

  return (
    <div className="min-h-screen game-gradient px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-10 select-none"
            style={{ top: `${20 + i * 20}%`, left: `${10 + (i % 3) * 30}%` }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            🔍
          </motion.span>
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="gold-text font-display font-bold text-xs">FQ Test</span>
            <span className="text-game-muted text-[10px] font-body">Reality Check</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="p-1.5" />
            <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-1">
              <Zap size={14} className="text-game-gold" />
              <span className="text-game-gold text-xs font-display font-bold">
                {state.currentQuestion + 1}/{totalQuestions}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-game-gold" />
              <span className="text-game-muted text-xs font-body">Progress</span>
            </div>
            <span className="text-game-muted text-xs font-body">{Math.round(((state.currentQuestion) / totalQuestions) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-game-bg/50">
            <motion.div
              className="h-full rounded-full gold-gradient"
              animate={{ width: `${((state.currentQuestion) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentQuestion}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card rounded-2xl p-5 mb-5">
              <p className="text-game-gold text-xs font-display font-semibold uppercase tracking-wider mb-2">
                {question.category}
              </p>
              <p className="text-game-text font-body leading-relaxed text-base font-medium">
                {question.question}
              </p>
            </div>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 200 }}
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
                    <motion.span className="text-xl flex-shrink-0" whileHover={{ scale: 1.3, rotate: 15 }} transition={{ type: "spring" }}>
                      {opt.emoji}
                    </motion.span>
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
                    <p className="text-game-gold font-display font-bold text-xl">
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

export default RealityCheckPlay;
