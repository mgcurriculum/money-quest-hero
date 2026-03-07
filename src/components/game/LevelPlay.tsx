import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import { levels } from '@/data/questions';
import { Zap, Star, Trophy, Sparkles, Shield, ChevronRight } from 'lucide-react';
import MuteButton from './MuteButton';

const feedbackData = [
  { text: "Noted! 📝", icon: <Zap className="text-game-gold" size={28} /> },
  { text: "Interesting! 🧐", icon: <Star className="text-game-gold" size={28} /> },
  { text: "Bold move! 💪", icon: <Sparkles className="text-game-gold" size={28} /> },
  { text: "Smart thinking! 🧠", icon: <Trophy className="text-game-gold" size={28} /> },
  { text: "Power play! 🌟", icon: <Shield className="text-game-gold" size={28} /> },
];

const LevelPlay = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const level = levels[state.currentLevel];
  const totalScenarios = level.scenarios.length;
  const scenario = level.scenarios[state.currentQuestion];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    if (!state.isMuted && scenario) {
      const timer = setTimeout(() => speak("Alright, picture this scenario. Read through the situation and choose how you'd handle it."), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, state.currentLevel, state.currentQuestion]);

  const handleSelect = (optIndex: number) => {
    stop();
    const score = optIndex + 1;
    setSelectedOption(optIndex);
    setXpGained(score * 20);
    dispatch({ type: 'ANSWER_QUESTION', level: state.currentLevel, question: state.currentQuestion, score });

    const feedbackText = feedbackData[optIndex % feedbackData.length].text.replace(/[^\w\s!?]/g, '');
    if (!state.isMuted) {
      speak(feedbackText);
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      setXpGained(0);
      if (state.currentQuestion < totalScenarios - 1) {
        dispatch({ type: 'NEXT_QUESTION' });
      } else {
        dispatch({ type: 'COMPLETE_LEVEL', level: state.currentLevel });
      }
    }, 1200);
  };

  const questionLabels = Array.from({ length: totalScenarios }, (_, i) =>
    i === totalScenarios - 1 ? "Final Quest!" : `Quest ${i + 1} of ${totalScenarios}`
  );

  return (
    <div className="min-h-screen game-gradient px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-10 select-none"
            style={{ top: `${15 + i * 15}%`, left: `${10 + (i % 3) * 35}%` }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {level.bgEmoji}
          </motion.span>
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="flex items-center justify-between mb-4">
          <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="p-2" />
          <motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center gap-2" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <span className="text-xl">{level.icon}</span>
            <span className="text-game-text font-display font-semibold text-xs">{level.title}</span>
          </motion.div>
          <div className="glass-card rounded-full px-3 py-1.5 flex items-center gap-1">
            <Zap size={14} className="text-game-gold" />
            <span className="text-game-gold text-xs font-display font-bold">{questionLabels[state.currentQuestion]}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-game-gold" />
              <span className="text-game-muted text-xs font-body">Progress</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalScenarios }, (_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 ${
                    i < state.currentQuestion ? 'bg-game-green border-game-green'
                    : i === state.currentQuestion ? 'border-game-gold bg-game-gold/30'
                    : 'border-game-muted/30 bg-transparent'
                  }`}
                  animate={i === state.currentQuestion ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 flex-1 rounded-full overflow-hidden bg-game-bg/50">
                <motion.div
                  className="h-full rounded-full gold-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: i <= state.currentQuestion ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.currentLevel}-${state.currentQuestion}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card rounded-2xl p-5 mb-5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-game-bg/50 flex items-center justify-center text-2xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {scenario.character}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-game-gold" />
                    <span className="text-game-gold font-display text-xs font-semibold uppercase tracking-wider">Scenario</span>
                  </div>
                  <div className="text-game-muted text-xs font-body">{level.theme}</div>
                </div>
                <motion.span className="text-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  {scenario.scene}
                </motion.span>
              </div>
              <p className="text-game-text font-body leading-relaxed text-sm">{scenario.situation}</p>
            </div>

            <div className="space-y-2.5">
              {scenario.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
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
                    <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                      {feedbackData[selectedOption].icon}
                    </motion.div>
                    <p className="text-game-gold font-display font-bold text-xl mt-2">{feedbackData[selectedOption].text}</p>
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

export default LevelPlay;
