import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useQuestions, type QuestionItem } from '@/hooks/useQuestions';
import { useNarration } from '@/hooks/useNarration';
import { dimensions, dimensionIcons, fqBands, MAX_SCORE, MAX_SCORE_PER_QUESTION, getProfileLabel } from '@/data/questions';
import {
  extractQuestionsAndAnswers,
  getFinancialTips,
  generateReportHTML,
  downloadReportAsFile,
} from '@/utils/generateReportPDF';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import finquoLogo from '@/assets/finquo-logo-white.png';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Facebook, Instagram, Download, Mail, RefreshCw } from 'lucide-react';
import SessionHistory from './SessionHistory';

// Map short DB dimension names to full display names
const dimensionKeyMap: Record<string, string> = {
  'Earning': 'Earning Mindset',
  'Spending': 'Spending Behaviour',
  'Saving': 'Saving Behaviour',
  'Borrowing': 'Debt Awareness',
  'Investing': 'Investment Awareness',
  'Protecting': 'Financial Safety',
};

function computeDimensionScores(questions: QuestionItem[], answers: { [idx: number]: number }) {
  const dimMap: Record<string, { total: number; count: number }> = {};
  questions.forEach((q, idx) => {
    const rawDim = q.dimension || 'Other';
    const dim = dimensionKeyMap[rawDim] || rawDim;
    if (!dimMap[dim]) dimMap[dim] = { total: 0, count: 0 };
    const score = answers[idx] || 0;
    dimMap[dim].total += score;
    dimMap[dim].count++;
  });
  return dimensions.map((dim, i) => {
    const d = dimMap[dim];
    if (!d || d.count === 0) return { dimension: dim, icon: dimensionIcons[i], score: 0, maxScore: 0, percentage: 0 };
    const maxScore = d.count * MAX_SCORE_PER_QUESTION;
    return {
      dimension: dim,
      icon: dimensionIcons[i],
      score: d.total,
      maxScore,
      percentage: Math.min(100, Math.round((d.total / maxScore) * 100)),
    };
  });
}

const ReportScreen = () => {
  const { state, dispatch } = useGame();
  const { questions } = useQuestions(state.profile.profileCode);
  const { speak, stop, isPlaying, isLoading: narrationLoading } = useNarration(state.isMuted);
  const hasSaved = useRef(false);
  const hasNarrated = useRef(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const totalScore = Object.values(state.answers).reduce((sum, s) => sum + s, 0);
  const band = fqBands.find(b => totalScore >= b.min && totalScore < b.max) || fqBands[0];
  const dimScores = computeDimensionScores(questions, state.answers);

  const radarData = dimScores.map(ds => ({
    dimension: ds.dimension,
    score: ds.percentage,
    fullMark: 100,
  }));

  const questionsAndAnswers = extractQuestionsAndAnswers(questions, state.answers);
  const tips = getFinancialTips(dimScores);

  useEffect(() => {
    if (!hasNarrated.current && !state.isMuted) {
      hasNarrated.current = true;
      const timer = setTimeout(() => {
        speak("Here's your FQ Test report! Your overall score shows how financially aware you are. Check out the radar chart to see how you performed across six key dimensions like Earning, Spending, Saving, and more. You can download your report, share it with friends, or even take the test again to improve your score!");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak]);

  useEffect(() => {
    if (hasSaved.current || questions.length === 0) return;
    hasSaved.current = true;

    const saveSession = async () => {
      try {
        const enrichedAnswers = {
          detailed: questionsAndAnswers,
          dimensionScores: dimScores.map(ds => ({
            dimension: ds.dimension,
            score: ds.score,
            maxScore: ds.maxScore,
            percentage: ds.percentage,
          })),
          totalScore,
        };

        await supabase.from('game_sessions').insert({
          player_name: state.profile.name,
          player_age: state.profile.ageGroup,
          player_age_number: state.profile.age,
          player_gender: state.profile.gender,
          player_phone: state.profile.phone,
          player_country: state.profile.country,
          player_state: state.profile.state,
          player_district: state.profile.district,
          player_status: state.profile.role,
          player_income_type: state.profile.roleLabel,
          profile_code: state.profile.profileCode,
          answers: enrichedAnswers as any,
          fq_score: totalScore,
          band_level: band.level,
          reflection_answer: state.reflectionAnswer,
          campaign_id: state.campaignId || null,
        } as any);
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    };
    saveSession();
  }, [questions.length]);

  const handleDownloadPDF = async () => {
    const html = generateReportHTML({
      logoUrl: window.location.origin + finquoLogo,
      playerName: state.profile.name,
      profileLabel: getProfileLabel(state.profile.profileCode),
      playerAge: state.profile.age,
      totalScore,
      maxScore: MAX_SCORE,
      bandLevel: band.level,
      bandEmoji: band.emoji,
      bandMeaning: band.meaning,
      dimensionScores: dimScores,
      questionsAndAnswers,
      tips,
      reflectionAnswer: state.reflectionAnswer,
    });
    await downloadReportAsFile(html, `FQ-Test-Report-${state.profile.name}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) return;
    setEmailSending(true);
    try {
      await supabase.from('game_sessions').update({ player_email: email } as any)
        .eq('player_name', state.profile.name).eq('fq_score', totalScore);

      await supabase.functions.invoke('send-report-email', {
        body: {
          email,
          playerName: state.profile.name,
          profileLabel: getProfileLabel(state.profile.profileCode),
          fqScore: totalScore,
          maxScore: MAX_SCORE,
          bandLevel: band.level,
          bandEmoji: band.emoji,
          bandMeaning: band.meaning,
          dimensionScores: dimScores.map(ds => ({
            label: ds.dimension,
            icon: ds.icon,
            score: ds.percentage,
          })),
          reflectionAnswer: state.reflectionAnswer,
          questionsAndAnswers,
          tips,
        },
      });
      setEmailSent(true);
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setEmailSending(false);
    }
  };

  const appUrl = window.location.origin;
  const scorePercent = Math.round((totalScore / MAX_SCORE) * 100);

  const whatsappText = `🏆 *My FQ Test Results*\n\n📊 Score: ${totalScore}/${MAX_SCORE} (${scorePercent}%)\n🎖️ Level: ${band.emoji} ${band.level}\n\n📈 *Dimension Scores:*\n${dimScores.map(ds => `${ds.icon} ${ds.dimension}: ${ds.percentage}%`).join('\n')}\n\n💡 ${band.meaning}\n\n🔗 Take your FQ Test now:\n${appUrl}\n\n_Powered by FinQuo Versity_`;

  const fbText = `🏆 I just took the FQ Test by FinQuo Versity!\n\n📊 My Score: ${totalScore}/${MAX_SCORE} (${scorePercent}%)\n🎖️ Level: ${band.emoji} ${band.level}\n\n${band.meaning}\n\nDiscover your Financial Quotient — Take the free FQ Test!\n${appUrl}`;

  const handleShare = (platform: string) => {
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(fbText)}`, '_blank');
    } else if (platform === 'instagram') {
      const instaText = `🏆 My FQ Test Score: ${totalScore}/${MAX_SCORE} (${scorePercent}%)\n🎖️ ${band.emoji} ${band.level}\n\n${dimScores.map(ds => `${ds.icon} ${ds.dimension}: ${ds.percentage}%`).join('\n')}\n\n${band.meaning}\n\nTake your FQ Test: ${appUrl}\n\n#FQTest #FinQuoVersity #FinancialLiteracy #MoneySmarts`;
      navigator.clipboard.writeText(instaText);
      alert('Detailed score copied to clipboard! Paste it on your Instagram Story 📸');
    }
  };

  return (
    <div className="min-h-screen game-gradient px-4 py-6 print:bg-white print:text-black">
      <div className="max-w-md mx-auto">
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
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - totalScore / MAX_SCORE) }}
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
                {totalScore}
              </motion.span>
              <span className="text-game-muted text-xs font-body">/{MAX_SCORE}</span>
            </div>
          </div>
          <p className="text-game-text font-body text-sm mb-1">You are</p>
          <p className="text-game-gold font-display font-semibold text-lg">{band.emoji} {band.level}</p>
          <p className="text-game-muted font-body text-xs mt-1">{band.meaning}</p>
        </motion.div>

        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-4 mb-5">
          <p className="text-game-muted text-xs font-body uppercase tracking-wider text-center mb-2">Dimension Breakdown</p>
          <div className="w-full h-72 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="hsl(var(--game-muted) / 0.2)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--game-muted))', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--game-gold))" fill="hsl(var(--game-gold))" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dimension Score Bars */}
        {dimScores.map((ds, i) => (
          <motion.div key={ds.dimension} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-game-text font-display text-sm">{ds.icon} {ds.dimension}</span>
              <span className="text-game-gold font-display font-bold">{ds.percentage}%</span>
            </div>
            <div className="h-2.5 bg-game-card rounded-full overflow-hidden">
              <motion.div className="h-full gold-gradient rounded-full" initial={{ width: 0 }} animate={{ width: `${ds.percentage}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: 'easeOut' }} />
            </div>
          </motion.div>
        ))}

        {/* Social Sharing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="glass-card rounded-2xl p-4 mb-5 text-center print:hidden">
          <p className="text-game-text font-display font-semibold text-sm mb-3 flex items-center justify-center gap-1.5"><Share2 size={14} /> Share Your Results</p>
          <div className="flex justify-center gap-3">
            {[
              { name: 'whatsapp', icon: <MessageCircle size={14} />, label: 'WhatsApp', color: 'bg-green-600' },
              { name: 'facebook', icon: <Facebook size={14} />, label: 'Facebook', color: 'bg-blue-600' },
              { name: 'instagram', icon: <Instagram size={14} />, label: 'Instagram', color: 'bg-pink-600' },
            ].map(p => (
              <button key={p.name} onClick={() => handleShare(p.name)}
                className={`${p.color} text-white px-4 py-2 rounded-xl font-body text-xs font-semibold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform`}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Download & Send Email */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="grid grid-cols-2 gap-3 mb-5 print:hidden">
          <button onClick={handleDownloadPDF} className="py-3 rounded-2xl font-display font-semibold text-sm glass-card border border-game-gold/30 text-game-gold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Download size={16} /> Download Report
          </button>
          <button onClick={() => setEmailOpen(true)} className="py-3 rounded-2xl font-display font-semibold text-sm glass-card border border-game-gold/30 text-game-gold hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Mail size={16} /> Send to Email
          </button>
        </motion.div>

        {/* Session History */}
        <SessionHistory phone={state.profile.phone} currentSessionScore={totalScore} />

        <div className="pb-8 print:hidden">
          <button onClick={() => { stop(); dispatch({ type: 'RETAKE' }); }} className="w-full py-4 rounded-2xl font-display font-semibold gold-gradient text-white game-shadow hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2">
            Take Test Again <RefreshCw size={16} />
          </button>
        </div>
      </div>

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
              <Button onClick={() => { setEmailOpen(false); setEmailSent(false); setEmail(''); }} className="mt-4 gold-gradient text-white font-display">Close</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                className="bg-game-card border-game-muted/30 text-game-text placeholder:text-game-muted/50 font-body" />
              <Button onClick={handleSendEmail} disabled={emailSending || !email.includes('@')}
                className="w-full gold-gradient text-white font-display font-semibold hover:scale-105 active:scale-95 transition-transform">
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
