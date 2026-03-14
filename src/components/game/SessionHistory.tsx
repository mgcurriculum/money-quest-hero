import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { fqBands, MAX_SCORE, MAX_SCORE_PER_QUESTION, getProfileLabel, dimensions, dimensionIcons } from '@/data/questions';
import { generateReportHTML, downloadReportAsFile, getFinancialTips } from '@/utils/generateReportPDF';
import { Download, History, ChevronDown, ChevronUp } from 'lucide-react';
import finquoLogo from '@/assets/finquo-logo-white.png';

interface HistorySession {
  id: string;
  player_name: string;
  fq_score: number | null;
  band_level: string | null;
  profile_code: string | null;
  created_at: string;
  answers: any;
  reflection_answer: string | null;
  player_age: string | null;
  player_gender: string | null;
}

interface Props {
  phone: string;
  currentSessionScore: number; // to exclude current session from history
}

const SessionHistory = ({ phone, currentSessionScore }: Props) => {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('game_sessions')
        .select('id, player_name, fq_score, band_level, profile_code, created_at, answers, reflection_answer, player_age, player_gender')
        .eq('player_phone', phone)
        .order('created_at', { ascending: false });

      if (data && data.length > 1) {
        // Skip the most recent one (current session)
        setSessions(data.slice(1));
      }
      setLoading(false);
    };
    if (phone) fetchHistory();
  }, [phone]);

  if (loading || sessions.length === 0) return null;

  const handleDownload = async (session: HistorySession) => {
    setDownloading(session.id);
    try {
      const band = fqBands.find(b => (session.fq_score || 0) >= b.min && (session.fq_score || 0) < b.max) || fqBands[0];
      const answersData = session.answers as any;

      // Build dimension scores from stored data
      let dimensionScores = dimensions.map((dim, i) => ({
        dimension: dim,
        icon: dimensionIcons[i],
        score: 0,
        maxScore: 0,
        percentage: 0,
      }));

      let questionsAndAnswers: any[] = [];

      if (answersData?.dimensionScores) {
        dimensionScores = answersData.dimensionScores.map((ds: any, i: number) => ({
          dimension: ds.dimension || dimensions[i],
          icon: dimensionIcons[i] || '📊',
          score: ds.score || 0,
          maxScore: ds.maxScore || 0,
          percentage: ds.percentage || 0,
        }));
      }

      if (answersData?.detailed) {
        questionsAndAnswers = answersData.detailed;
      }

      const tips = getFinancialTips(dimensionScores);

      const html = generateReportHTML({
        logoUrl: window.location.origin + finquoLogo,
        playerName: session.player_name,
        profileLabel: getProfileLabel(session.profile_code || ''),
        totalScore: session.fq_score || 0,
        maxScore: MAX_SCORE,
        bandLevel: band.level,
        bandEmoji: band.emoji,
        bandMeaning: band.meaning,
        dimensionScores,
        questionsAndAnswers,
        tips,
        reflectionAnswer: session.reflection_answer || undefined,
      });

      await downloadReportAsFile(html, `FQ-Report-${session.player_name}-${new Date(session.created_at).toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('Failed to download history report:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 }}
      className="glass-card rounded-2xl p-4 mb-5 print:hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-game-text font-display font-semibold text-sm"
      >
        <span className="flex items-center gap-2">
          <History size={16} className="text-game-gold" />
          Your Past Attempts ({sessions.length})
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {sessions.map((s) => {
            const band = fqBands.find(b => (s.fq_score || 0) >= b.min && (s.fq_score || 0) < b.max) || fqBands[0];
            return (
              <div key={s.id} className="flex items-center justify-between bg-game-surface rounded-xl px-4 py-3 border border-game-card">
                <div className="flex-1 min-w-0">
                  <p className="text-game-text font-body text-sm font-medium truncate">
                    {band.emoji} {s.fq_score || 0}/{MAX_SCORE}
                    <span className="text-game-muted text-xs ml-2">{band.level}</span>
                  </p>
                  <p className="text-game-muted font-body text-xs">
                    {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(s.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(s)}
                  disabled={downloading === s.id}
                  className="ml-3 p-2 rounded-lg bg-game-gold/10 text-game-gold hover:bg-game-gold/20 active:scale-95 transition-all"
                  title="Download PDF"
                >
                  {downloading === s.id ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-game-gold border-t-transparent rounded-full" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default SessionHistory;
