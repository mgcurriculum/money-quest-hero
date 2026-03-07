import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import {
  dimensionLabels,
  dimensionIcons,
  calculateFQScore,
  archetypes,
} from '@/data/questions';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import finquoLogo from '@/assets/finquo-logo-white.png';

const ReportScreen = () => {
  const { state, dispatch } = useGame();
  const hasSaved = useRef(false);

  const { fqScore, normalizedScores, primaryArchetype, secondaryArchetype, band } =
    calculateFQScore(state.answers);

  const radarData = dimensionLabels.map((label, i) => ({
    dimension: `${dimensionIcons[i]} ${label}`,
    score: Math.round(normalizedScores[i]),
    fullMark: 100,
  }));

  // Save session to backend
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const saveSession = async () => {
      try {
        await supabase.from('game_sessions').insert({
          player_name: state.profile.name,
          player_age: state.profile.age,
          player_gender: state.profile.gender,
          player_phone: state.profile.phone,
          player_country: state.profile.country,
          player_state: state.profile.state,
          player_district: state.profile.district,
          player_status: state.profile.status,
          player_income_type: state.profile.incomeType,
          answers: state.answers as any,
          fq_score: fqScore,
          primary_archetype: `${primaryArchetype.emoji} ${primaryArchetype.name}`,
          secondary_archetype: `${secondaryArchetype.emoji} ${secondaryArchetype.name}`,
          band_level: band.level,
          reflection_answer: state.reflectionAnswer,
        });
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    };

    saveSession();
  }, []);

  const shareText = `My FQ Test Score is ${fqScore}/1000! 🏆\nI am a ${primaryArchetype.emoji} ${primaryArchetype.name}\nWhat's your Financial Superpower?\n\nTake the FQ Test: ${window.location.origin}`;

  const handleShare = (platform: string) => {
    const encoded = encodeURIComponent(shareText);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encoded}`,
      instagram: '',
    };
    if (platform === 'instagram') {
      navigator.clipboard.writeText(shareText);
      alert('Score copied to clipboard! Paste it on your Instagram Story 📸');
      return;
    }
    window.open(urls[platform], '_blank');
  };

  return (
    <div className="min-h-screen game-gradient px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-6">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-24 h-auto mx-auto mb-2" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="text-5xl mb-2">
            {band.emoji}
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-game-text mb-1">Your <span className="gold-text">FQ Test</span> Report</h1>
          <p className="text-game-muted font-body text-sm">{state.profile.name}'s Financial Journey Results</p>
        </motion.div>

        {/* FQ Score Ring */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 text-center mb-5">
          <p className="text-game-muted text-xs font-body mb-2"><span className="gold-text font-semibold">FQ Test</span> Score</p>
          <div className="relative w-36 h-36 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--game-card))" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#fqGrad)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - fqScore / 1000) }}
                transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="fqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--game-gold))" />
                  <stop offset="100%" stopColor="hsl(var(--game-purple))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span className="text-4xl font-display font-bold gold-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                {fqScore}
              </motion.span>
              <span className="text-game-muted text-xs font-body">/1000</span>
            </div>
          </div>
          <p className="text-game-gold font-display font-semibold text-lg">{band.level}</p>
          <p className="text-game-muted font-body text-xs mt-1">{band.meaning}</p>
        </motion.div>

        {/* Personality Archetypes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card rounded-2xl p-4 text-center border border-game-gold/30">
            <p className="text-game-muted text-[10px] font-body uppercase tracking-wider mb-1">Primary</p>
            <span className="text-3xl block mb-1">{primaryArchetype.emoji}</span>
            <p className="text-game-text font-display font-bold text-sm">{primaryArchetype.name}</p>
            <p className="text-game-muted font-body text-[10px] mt-1">{primaryArchetype.trait}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center border border-game-text/10">
            <p className="text-game-muted text-[10px] font-body uppercase tracking-wider mb-1">Secondary</p>
            <span className="text-3xl block mb-1">{secondaryArchetype.emoji}</span>
            <p className="text-game-text font-display font-bold text-sm">{secondaryArchetype.name}</p>
            <p className="text-game-muted font-body text-[10px] mt-1">{secondaryArchetype.trait}</p>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="glass-card rounded-2xl p-4 mb-5">
          <p className="text-game-muted text-xs font-body uppercase tracking-wider text-center mb-2">Dimension Breakdown</p>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--game-muted) / 0.2)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--game-muted))', fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--game-gold))" fill="hsl(var(--game-gold))" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dimension Score Bars */}
        <div className="space-y-2.5 mb-5">
          {dimensionLabels.map((label, idx) => {
            const score = Math.round(normalizedScores[idx]);
            const archetype = archetypes[idx];
            const profile = score >= 50 ? archetype.high : archetype.low;

            return (
              <motion.div key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + idx * 0.08 }} className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dimensionIcons[idx]}</span>
                    <div>
                      <p className="text-game-text font-display font-semibold text-xs">{label}</p>
                      <p className="text-game-gold text-[10px] font-body">{profile.emoji} {profile.name}</p>
                    </div>
                  </div>
                  <span className="text-game-muted font-body text-xs font-semibold">{score}%</span>
                </div>
                <div className="h-2 bg-game-card rounded-full overflow-hidden">
                  <motion.div className="h-full gold-gradient rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ delay: 1.1 + idx * 0.08, duration: 0.6 }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reflection */}
        {state.reflectionAnswer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="glass-card rounded-2xl p-4 mb-5 text-center">
            <p className="text-game-muted text-[10px] font-body uppercase tracking-wider mb-1">Your 2025 <span className="gold-text">FQ Test</span> Goal</p>
            <p className="text-game-text font-display font-semibold text-sm">{state.reflectionAnswer}</p>
          </motion.div>
        )}

        {/* Improvement Quest */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="glass-card rounded-2xl p-4 mb-5 border-2 border-game-gold/30">
          <p className="text-game-gold font-display font-semibold mb-2 text-sm">🎯 Your Improvement Quest</p>
          <p className="text-game-text font-body text-xs mb-1"><strong>Mission:</strong> {primaryArchetype.quest}</p>
          <p className="text-game-muted font-body text-[10px]">🏅 Complete this to level up your FQ!</p>
        </motion.div>

        {/* Social Sharing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9 }} className="glass-card rounded-2xl p-4 mb-5 text-center">
          <p className="text-game-text font-display font-semibold text-sm mb-3">📢 Share Your Superpower</p>
          <div className="flex justify-center gap-3">
            {[
              { name: 'whatsapp', emoji: '💬', label: 'WhatsApp', color: 'bg-green-600' },
              { name: 'facebook', emoji: '📘', label: 'Facebook', color: 'bg-blue-600' },
              { name: 'instagram', emoji: '📸', label: 'Instagram', color: 'bg-pink-600' },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => handleShare(p.name)}
                className={`${p.color} text-white px-4 py-2 rounded-xl font-body text-xs font-semibold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform`}
              >
                <span>{p.emoji}</span> {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Play Again */}
        <div className="pb-8">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="w-full py-4 rounded-2xl font-display font-semibold gold-gradient text-white game-shadow hover:scale-105 active:scale-95 transition-transform"
          >
            Take Test Again 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
