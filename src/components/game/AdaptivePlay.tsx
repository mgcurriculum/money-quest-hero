import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useAdaptiveEngine } from '@/hooks/useAdaptiveEngine';
import { useNarration } from '@/hooks/useNarration';
import { dimensionLabels, dimensionIcons } from '@/data/questions';
import { Zap, Star, Trophy, Sparkles, Shield, ChevronRight } from 'lucide-react';
import MuteButton from './MuteButton';
import { getQuestionNarration, getAnswerFeedback } from '@/utils/narrationPrompts';

const feedbackData = [
  { text: "Noted! 📝", icon: <Zap className="text-game-gold" size={28} /> },
  { text: "Interesting! 🧐", icon: <Star className="text-game-gold" size={28} /> },
  { text: "Bold move! 💪", icon: <Sparkles className="text-game-gold" size={28} /> },
  { text: "Smart thinking! 🧠", icon: <Trophy className="text-game-gold" size={28} /> },
  { text: "Power play! 🌟", icon: <Shield className="text-game-gold" size={28} /> },
];

const AdaptivePlay = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading: narrationLoading, speak, stop } = useNarration(state.isMuted);
  const {
    currentQuestion,
    questionsAnswered,
    dimensionsCovered,
    isComplete,
    loading,
    submitAnswer,
    currentLevel,
    hasQuestions,
  } = useAdaptiveEngine(state.profile.age);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Narrate on question change
  useEffect(() => {
    if (!state.isMuted && currentQuestion) {
      const narration = getQuestionNarration(currentQuestion.dimension, currentQuestion.category, questionsAnswered + 1, estimatedTotal);
      const timer = setTimeout(() => speak(narration), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, currentQuestion?.id]);

  // Handle completion
  useEffect(() => {
    if (isComplete) {
      stop();
      dispatch({ type: 'SET_ADAPTIVE_COMPLETE' });
    }
  }, [isComplete, dispatch, stop]);

  // Fallback to fixed mode if no DB questions
  useEffect(() => {
    if (!loading && !hasQuestions) {
      dispatch({ type: 'SET_ASSESSMENT_MODE', mode: 'fixed' });
      dispatch({ type: 'START_LEVEL', level: 0 });
    }
  }, [loading, hasQuestions, dispatch]);

  const handleSelect = (optIndex: number) => {
    if (!currentQuestion || showFeedback) return;
    stop();

    const score = optIndex + 1; // 1-5
    setSelectedOption(optIndex);
    setXpGained(score * 20);

    const opt = currentQuestion.options[optIndex];

    // Store adaptive answer in context
    dispatch({
      type: 'ADD_ADAPTIVE_ANSWER',
      answer: {
        questionId: currentQuestion.id,
        level: currentQuestion.level,
        dimension: currentQuestion.dimension || dimensionLabels[currentQuestion.level] || '',
        score,
        questionText: currentQuestion.question_text,
        selectedOption: opt?.text || `Option ${score}`,
        selectedEmoji: opt?.emoji || '',
      },
    });

    const feedbackText = feedbackData[optIndex % feedbackData.length].text.replace(/[^\w\s!?]/g, '');
    if (!state.isMuted) {
      speak(feedbackText);
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      setXpGained(0);
      submitAnswer(score);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-4xl">
          ⏳
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const levelIcon = dimensionIcons[currentLevel] || '📋';
  const levelLabel = dimensionLabels[currentLevel] || 'Assessment';
  const estimatedTotal = Math.max(16, questionsAnswered + (7 - dimensionsCovered.length) + 1);

  return (
    <div className="min-h-screen game-gradient px-4 py-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-10 select-none"
            style={{ top: `${15 + i * 15}%`, left: `${10 + (i % 3) * 35}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {levelIcon}
          </motion.span>
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <MuteButton isPlaying={isPlaying} isLoading={narrationLoading} className="p-2" />
          <motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center gap-2" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <span className="text-xl">{levelIcon}</span>
            <span className="text-game-text font-display font-semibold text-xs">{levelLabel}</span>
          </motion.div>
          <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-1">
            <Zap size={14} className="text-game-gold" />
            <span className="text-game-gold text-xs font-display font-bold">Q{questionsAnswered + 1} / ~{estimatedTotal}</span>
          </div>
        </div>

        {/* Dimension progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                dimensionsCovered.includes(i)
                  ? 'bg-game-green/20 border border-game-green/50'
                  : currentLevel === i
                  ? 'bg-game-gold/20 border border-game-gold/50'
                  : 'bg-game-card/50 border border-game-muted/20'
              }`}
              title={dimensionLabels[i]}
            >
              {dimensionIcons[i]}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-game-card rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full gold-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (questionsAnswered / 16) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {/* Question card */}
            <div className="glass-card rounded-2xl p-5 mb-5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-game-bg/50 flex items-center justify-center text-2xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {levelIcon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-game-gold" />
                    <span className="text-game-gold font-display text-xs font-semibold uppercase tracking-wider">{levelLabel}</span>
                  </div>
                  <div className="text-game-muted text-xs font-body">{currentQuestion.category}</div>
                </div>
              </div>
              <p className="text-game-text font-body leading-relaxed text-sm">{currentQuestion.question_text}</p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
                  onClick={() => handleSelect(idx)}
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

            {/* Feedback overlay */}
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
                    <p className="text-game-gold font-display font-bold text-xl mt-2">{feedbackData[selectedOption % feedbackData.length].text}</p>
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-1 mt-2">
                      <Zap size={14} className="text-game-green" />
                      <span className="text-game-green font-display font-bold text-sm">+{xpGained} XP</span>
                    </motion.div>
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

export default AdaptivePlay;
