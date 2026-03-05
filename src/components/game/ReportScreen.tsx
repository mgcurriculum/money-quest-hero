import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { levelTraits, traitProfiles } from '@/data/questions';

const ReportScreen = () => {
  const { state, dispatch } = useGame();

  // Calculate scores per level (avg of 3 questions, each 1-5)
  const scores = Array.from({ length: 6 }, (_, level) => {
    const answers = state.answers[level] || {};
    const vals = Object.values(answers);
    if (vals.length === 0) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  });

  const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / 6 * 20); // out of 100
  const overallRating = totalScore >= 80 ? 'Financial Hero 🦸' : totalScore >= 60 ? 'Money Explorer 🧭' : totalScore >= 40 ? 'Financial Learner 📚' : 'Beginner Adventurer 🌱';

  const getTraitIndex = (score: number) => Math.min(4, Math.max(0, Math.round(score) - 1));

  return (
    <div className="min-h-screen game-gradient px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <p className="text-game-muted text-xs font-body uppercase tracking-widest mb-1">FQ Test by FinQuo Versity</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-3"
          >
            🏆
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-game-text mb-1">Your Financial Hero Profile</h2>
          <p className="text-game-muted font-body">{state.profile.name}'s Money Journey Results</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 text-center mb-6"
        >
          <p className="text-game-muted text-sm font-body mb-2">Financial Quotient Score</p>
          <div className="relative w-32 h-32 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--game-card))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#goldGradient)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - totalScore / 100) }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--game-gold))" />
                  <stop offset="100%" stopColor="hsl(var(--game-orange))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold gold-text">{totalScore}</span>
              <span className="text-game-muted text-xs font-body">/100</span>
            </div>
          </div>
          <p className="text-game-gold font-display font-semibold text-lg">{overallRating}</p>
        </motion.div>

        {/* Trait Breakdown */}
        <div className="space-y-3 mb-6">
          {levelTraits.map((trait, idx) => {
            const score = scores[idx];
            const traitIdx = getTraitIndex(score);
            const profileName = traitProfiles[idx][traitIdx];
            const pct = (score / 5) * 100;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{trait.icon}</span>
                    <div>
                      <p className="text-game-text font-display font-semibold text-sm">{trait.label}</p>
                      <p className="text-game-gold text-xs font-body">{profileName}</p>
                    </div>
                  </div>
                  <span className="text-game-muted font-body text-sm">{score.toFixed(1)}/5</span>
                </div>
                <div className="h-2 bg-game-card rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gold-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7 + idx * 0.1, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reflection */}
        {state.reflectionAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="glass-card rounded-2xl p-5 mb-6 text-center"
          >
            <p className="text-game-muted text-xs font-body uppercase tracking-wider mb-2">Your 2025 Money Quest</p>
            <p className="text-game-text font-display font-semibold">{state.reflectionAnswer}</p>
          </motion.div>
        )}

        {/* Improvement Quest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="glass-card rounded-2xl p-5 mb-8 border-2 border-game-gold/30"
        >
          <p className="text-game-gold font-display font-semibold mb-2">💰 Your First Quest</p>
          <p className="text-game-text font-body text-sm mb-1"><strong>Mission:</strong> Save ₹500 every week for 4 weeks</p>
          <p className="text-game-muted font-body text-xs">🏅 Reward: Unlock Savings Master Badge</p>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="w-full py-4 rounded-2xl font-display font-semibold gold-gradient text-game-bg game-shadow hover:scale-105 active:scale-95 transition-transform"
          >
            Play Again 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
