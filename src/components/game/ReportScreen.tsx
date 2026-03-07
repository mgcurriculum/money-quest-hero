import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import {
  dimensionLabels,
  dimensionIcons,
  calculateNormalizedScore,
  archetypes,
  fqBands as defaultBands,
  dimensionWeights as defaultWeights,
  levels,
} from '@/data/questions';
import { useScoringConfig } from '@/hooks/useScoringConfig';
import {
  extractQuestionsAndAnswers,
  getFinancialTips,
  generateReportHTML,
  openPrintableReport,
} from '@/utils/generateReportPDF';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import finquoLogo from '@/assets/finquo-logo-white.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ReportScreen = () => {
  const { state, dispatch } = useGame();
  const hasSaved = useRef(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { fqScore, normalizedScores, band, primaryArchetype, secondaryArchetype } =
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
        // Build detailed Q&A data for admin analytics
        const detailed = questionsAndAnswers.map((qa, idx) => ({
          index: idx,
          level: levels.findIndex(l => l.title === qa.levelTitle) ?? 0,
          levelTitle: qa.levelTitle,
          category: qa.levelTitle, // dimension name
          question: qa.question,
          selectedOption: qa.selectedOption,
          selectedEmoji: qa.selectedEmoji,
          score: qa.score,
        }));

        const enrichedAnswers = {
          detailed,
          raw: state.answers,
          normalizedScores: normalizedScores.map((s, i) => ({
            dimension: dimensionLabels[i],
            score: Math.round(s),
          })),
        };

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
          answers: enrichedAnswers as any,
          fq_score: fqScore,
          band_level: band.level,
          primary_archetype: primaryArchetype.name,
          secondary_archetype: secondaryArchetype.name,
          reflection_answer: state.reflectionAnswer,
        });
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    };

    saveSession();
  }, []);

  const questionsAndAnswers = extractQuestionsAndAnswers(state.answers);
  const { tips, suggestions } = getFinancialTips(normalizedScores);

  const handleDownloadPDF = () => {
    const html = generateReportHTML({
      logoUrl: window.location.origin + finquoLogo,
      playerName: state.profile.name,
      fqScore,
      bandLevel: band.level,
      bandEmoji: band.emoji,
      bandMeaning: band.meaning,
      normalizedScores,
      questionsAndAnswers,
      tips,
      suggestions,
      reflectionAnswer: state.reflectionAnswer,
    });
    openPrintableReport(html);
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) return;
    setEmailSending(true);
    try {
      await supabase.from('game_sessions').update({ player_email: email } as any).eq('player_name', state.profile.name).eq('fq_score', fqScore);

      await supabase.functions.invoke('send-report-email', {
        body: {
          email,
          playerName: state.profile.name,
          fqScore,
          bandLevel: band.level,
          bandEmoji: band.emoji,
          bandMeaning: band.meaning,
          dimensionScores: dimensionLabels.map((label, i) => ({
            label,
            icon: dimensionIcons[i],
            score: Math.round(normalizedScores[i]),
          })),
          reflectionAnswer: state.reflectionAnswer,
          questionsAndAnswers: questionsAndAnswers.map(qa => ({
            levelTitle: qa.levelTitle,
            levelIcon: qa.levelIcon,
            question: qa.question,
            selectedOption: qa.selectedOption,
            selectedEmoji: qa.selectedEmoji,
            score: qa.score,
          })),
          tips,
          suggestions,
        },
      });
      setEmailSent(true);
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setEmailSending(false);
    }
  };

  const shareText = `My FQ Test Score is ${fqScore}/1000! 🏆\nWhat's your Financial Superpower?\n\nTake the FQ Test: ${window.location.origin}`;

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
    <div className="min-h-screen game-gradient px-4 py-6 print:bg-white print:text-black">
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

        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-4 mb-5">
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
        {dimensionLabels.map((label, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-game-text font-display text-sm">{dimensionIcons[i]} {label}</span>
              <span className="text-game-gold font-display font-bold">{Math.round(normalizedScores[i])}%</span>
            </div>
            <div className="h-2.5 bg-game-card rounded-full overflow-hidden">
              <motion.div className="h-full gold-gradient rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.round(normalizedScores[i])}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: 'easeOut' }} />
            </div>
          </motion.div>
        ))}


        {/* Social Sharing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="glass-card rounded-2xl p-4 mb-5 text-center print:hidden">
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

        {/* Download PDF & Send Email */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="grid grid-cols-2 gap-3 mb-5 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="py-3 rounded-2xl font-display font-semibold text-sm glass-card border border-game-gold/30 text-game-gold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            📥 Download PDF
          </button>
          <button
            onClick={() => setEmailOpen(true)}
            className="py-3 rounded-2xl font-display font-semibold text-sm glass-card border border-game-gold/30 text-game-gold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            📧 Send to Email
          </button>
        </motion.div>

        {/* Play Again */}
        <div className="pb-8 print:hidden">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="w-full py-4 rounded-2xl font-display font-semibold gold-gradient text-white game-shadow hover:scale-105 active:scale-95 transition-transform"
          >
            Take Test Again 🔄
          </button>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="bg-game-surface border-game-card text-game-text max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-game-text">📧 Send Report to Email</DialogTitle>
            <DialogDescription className="text-game-muted font-body text-xs">
              Enter your email address and we'll send your FQ Test report.
            </DialogDescription>
          </DialogHeader>
          {emailSent ? (
            <div className="text-center py-4">
              <span className="text-4xl block mb-2">✅</span>
              <p className="text-game-text font-display font-semibold">Report Sent!</p>
              <p className="text-game-muted font-body text-xs mt-1">Check your inbox for your FQ Test report.</p>
              <Button onClick={() => { setEmailOpen(false); setEmailSent(false); setEmail(''); }} className="mt-4 gold-gradient text-white font-display">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-game-card border-game-muted/30 text-game-text placeholder:text-game-muted/50 font-body"
              />
              <Button
                onClick={handleSendEmail}
                disabled={emailSending || !email.includes('@')}
                className="w-full gold-gradient text-white font-display font-semibold hover:scale-105 active:scale-95 transition-transform"
              >
                {emailSending ? 'Sending...' : 'Send Report 📨'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportScreen;
