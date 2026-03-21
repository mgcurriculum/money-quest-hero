import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { fqBands, MAX_SCORE, getProfileLabel, dimensions, dimensionIcons } from '@/data/questions';
import { generateReportHTML, downloadReportAsFile, getFinancialTips } from '@/utils/generateReportPDF';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, User, Phone, TrendingUp, History, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CountryCodePicker, { COUNTRIES, Country } from '@/components/game/CountryCodePicker';
import finquoLogo from '@/assets/finquo-logo-white.png';

interface SessionData {
  id: string;
  player_name: string;
  player_age: string | null;
  player_age_number: number | null;
  player_gender: string | null;
  player_phone: string | null;
  player_country: string | null;
  profile_code: string | null;
  fq_score: number | null;
  band_level: string | null;
  created_at: string;
  answers: any;
  reflection_answer: string | null;
}

type OtpStep = 'phone' | 'otp' | 'verified';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>('phone');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fullPhone = selectedCountry.dial + phone.replace(/[^\d]/g, '');

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 10) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setOtpError('Please enter a valid email address');
      return;
    }
    setOtpError('');
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone, email: trimmedEmail },
      });
      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to send OTP');
      }
      setOtpStep('otp');
      startResendTimer();
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setOtpError('');
    setVerifying(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: fullPhone, otp },
      });

      if (fnError) {
        let errMsg = 'Verification failed. Please try again.';
        const maybeContext = (fnError as any)?.context;
        if (maybeContext instanceof Response) {
          const body = await maybeContext.json().catch(() => null);
          errMsg = body?.error || errMsg;
        }
        setOtpError(errMsg);
        return;
      }

      if (data?.verified) {
        setOtpStep('verified');
        // Now fetch sessions
        await fetchSessions();
        return;
      }

      setOtpError(data?.error || 'Incorrect OTP. Please try again.');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setOtpError('');
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone },
      });
      if (fnError || data?.error) throw new Error(data?.error || 'Failed to resend');
      startResendTimer();
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setSending(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('game_sessions')
      .select('id, player_name, player_age, player_age_number, player_gender, player_phone, player_country, profile_code, fq_score, band_level, created_at, answers, reflection_answer')
      .eq('player_phone', fullPhone)
      .order('created_at', { ascending: false });
    setSessions((data as SessionData[]) || []);
    setLoading(false);
  };

  const handleLogout = () => {
    setSessions([]);
    setOtpStep('phone');
    setOtp('');
    setOtpError('');
    setPhone('');
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    navigate('/');
  };

  const latestSession = sessions[0];
  const profile = latestSession ? {
    name: latestSession.player_name,
    age: latestSession.player_age_number || null,
    ageGroup: latestSession.player_age,
    gender: latestSession.player_gender,
    country: latestSession.player_country,
    profileCode: latestSession.profile_code,
  } : null;

  const trendData = [...sessions].reverse().map((s, i) => ({
    attempt: `#${i + 1}`,
    score: s.fq_score || 0,
    date: new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  const handleDownload = async (session: SessionData) => {
    setDownloading(session.id);
    try {
      const band = fqBands.find(b => (session.fq_score || 0) >= b.min && (session.fq_score || 0) < b.max) || fqBands[0];
      const answersData = session.answers as any;

      let dimensionScores = dimensions.map((dim, i) => ({
        dimension: dim, icon: dimensionIcons[i], score: 0, maxScore: 0, percentage: 0,
      }));
      let questionsAndAnswers: any[] = [];

      if (answersData?.dimensionScores) {
        dimensionScores = answersData.dimensionScores.map((ds: any, i: number) => ({
          dimension: ds.dimension || dimensions[i], icon: dimensionIcons[i] || '📊',
          score: ds.score || 0, maxScore: ds.maxScore || 0, percentage: ds.percentage || 0,
        }));
      }
      if (answersData?.detailed) questionsAndAnswers = answersData.detailed;

      const html = generateReportHTML({
        logoUrl: window.location.origin + finquoLogo,
        playerName: session.player_name,
        profileLabel: getProfileLabel(session.profile_code || ''),
        playerAge: session.player_age_number || undefined,
        totalScore: session.fq_score || 0,
        maxScore: MAX_SCORE,
        bandLevel: band.level,
        bandEmoji: band.emoji,
        bandMeaning: band.meaning,
        dimensionScores,
        questionsAndAnswers,
        tips: getFinancialTips(dimensionScores),
        reflectionAnswer: session.reflection_answer || undefined,
      });

      await downloadReportAsFile(html, `FQ-Report-${session.player_name}-${new Date(session.created_at).toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen game-gradient px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="text-game-muted hover:text-game-text transition-colors">
            <ArrowLeft size={20} />
          </button>
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto" />
          {otpStep === 'verified' && sessions.length > 0 ? (
            <button
              onClick={handleLogout}
              className="text-game-muted hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold text-game-text">My <span className="gold-text">Profile</span></h1>
          <p className="text-game-muted font-body text-sm mt-1">
            {otpStep === 'verified' ? 'Your test history and scores' : 'Verify your phone to view your profile'}
          </p>
        </motion.div>

        {/* Phone + OTP Flow */}
        {otpStep !== 'verified' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-4 sm:p-5 mb-6">
            {otpStep === 'phone' && (
              <>
                <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-2 block">
                  <Phone size={12} className="inline mr-1" /> Enter your registered phone number
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="flex-shrink-0">
                    <CountryCodePicker selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 min-w-0 bg-game-surface text-game-text rounded-xl px-3 sm:px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-sm sm:text-base"
                  />
                </div>
                <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-game-surface text-game-text rounded-xl px-3 sm:px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-sm sm:text-base mb-3"
                />
                <Button
                  onClick={handleSendOtp}
                  disabled={phone.replace(/[^\d]/g, '').length < 10 || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || sending}
                  className="w-full gold-gradient text-white font-display font-semibold rounded-xl py-3 hover:scale-105 active:scale-95 transition-transform"
                >
                  {sending ? 'Sending OTP...' : <><ShieldCheck size={16} className="mr-2" /> Send OTP</>}
                </Button>
              </>
            )}

            {otpStep === 'otp' && (
              <>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-game-gold/20 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck size={24} className="text-game-gold" />
                  </div>
                  <p className="text-game-text font-body text-sm">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-game-gold font-display font-semibold text-sm">{fullPhone}</p>
                </div>
                <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">
                  Enter OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  placeholder="• • • • • •"
                  className="w-full bg-game-surface text-game-text rounded-xl px-3 sm:px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] text-center font-mono mb-3"
                />
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || sending}
                    className={`text-xs font-body ${resendTimer > 0 ? 'text-game-muted' : 'text-game-gold hover:underline'}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                  <button
                    onClick={() => { setOtpStep('phone'); setOtp(''); setOtpError(''); }}
                    className="text-xs font-body text-game-muted hover:text-game-text"
                  >
                    Change number
                  </button>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || verifying}
                  className="w-full gold-gradient text-white font-display font-semibold rounded-xl py-3 hover:scale-105 active:scale-95 transition-transform"
                >
                  {verifying ? 'Verifying...' : 'Verify & View Profile →'}
                </Button>
              </>
            )}

            {otpError && (
              <p className="text-destructive text-xs text-center mt-3">{otpError}</p>
            )}
          </motion.div>
        )}

        {/* Loading */}
        {otpStep === 'verified' && loading && (
          <div className="text-center py-12">
            <span className="animate-spin inline-block w-8 h-8 border-3 border-game-gold border-t-transparent rounded-full" />
            <p className="text-game-muted font-body text-sm mt-3">Loading your profile...</p>
          </div>
        )}

        {/* No records */}
        {otpStep === 'verified' && !loading && sessions.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 text-center">
            <p className="text-game-muted font-body text-sm">No records found for this phone number.</p>
            <Button onClick={() => navigate('/')} variant="outline" className="mt-4 border-game-gold/30 text-game-gold bg-transparent font-display">
              Take the FQ Test →
            </Button>
          </motion.div>
        )}

        {/* Profile & History (only when verified) */}
        {otpStep === 'verified' && profile && (
          <>
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-game-gold/20 flex items-center justify-center">
                  <User size={24} className="text-game-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-game-text">{profile.name}</h2>
                  <p className="text-game-muted font-body text-xs">
                    {getProfileLabel(profile.profileCode || '')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Age', value: profile.age ? `${profile.age} years` : (profile.ageGroup || '-') },
                  { label: 'Gender', value: profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '-' },
                  { label: 'Country', value: profile.country || '-' },
                  { label: 'Tests Taken', value: sessions.length },
                ].map(item => (
                  <div key={item.label} className="bg-game-surface rounded-xl px-3 py-2 border border-game-card">
                    <p className="text-game-muted text-[10px] font-body uppercase tracking-wider">{item.label}</p>
                    <p className="text-game-text font-display font-semibold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Latest Score */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 mb-5 text-center">
              <p className="text-game-muted text-xs font-body mb-1">Latest FQ Score</p>
              {(() => {
                const band = fqBands.find(b => (latestSession.fq_score || 0) >= b.min && (latestSession.fq_score || 0) < b.max) || fqBands[0];
                return (
                  <>
                    <p className="text-4xl font-display font-bold gold-text">{latestSession.fq_score || 0}<span className="text-lg text-game-muted font-normal">/{MAX_SCORE}</span></p>
                    <p className="text-game-gold font-display text-sm mt-1">{band.emoji} {band.level}</p>
                  </>
                );
              })()}
            </motion.div>

            {/* Score Trend Chart */}
            {trendData.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-4 mb-5">
                <p className="text-game-muted text-xs font-body uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
                  <TrendingUp size={14} className="text-game-gold" /> Score Trend
                </p>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--game-muted) / 0.15)" />
                      <XAxis dataKey="date" tick={{ fill: 'hsl(var(--game-muted))', fontSize: 10 }} />
                      <YAxis domain={[0, MAX_SCORE]} tick={{ fill: 'hsl(var(--game-muted))', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--game-surface))', border: '1px solid hsl(var(--game-card))', borderRadius: '12px', color: 'hsl(var(--game-text))' }}
                        labelStyle={{ color: 'hsl(var(--game-muted))' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--game-gold))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--game-gold))', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Test History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-4 mb-6">
              <p className="text-game-text font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <History size={16} className="text-game-gold" /> Test History ({sessions.length})
              </p>
              <div className="space-y-2">
                {sessions.map((s) => {
                  const band = fqBands.find(b => (s.fq_score || 0) >= b.min && (s.fq_score || 0) < b.max) || fqBands[0];
                  return (
                    <div key={s.id} className="flex items-center justify-between bg-game-surface rounded-xl px-4 py-3 border border-game-card">
                      <div className="flex-1 min-w-0">
                        <p className="text-game-text font-body text-sm font-medium">
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
            </motion.div>

            {/* Take Test Again */}
            <Button
              onClick={() => navigate('/', { state: { retake: true, profile: { name: profile!.name, age: profile!.age, gender: profile!.gender, phone: fullPhone, country: profile!.country } } })}
              className="w-full py-6 text-base gold-gradient text-white font-display font-semibold rounded-2xl hover:scale-105 active:scale-95 transition-transform mb-8"
            >
              Take Test Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
