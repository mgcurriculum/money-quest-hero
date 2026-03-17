import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame, PlayerProfile } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import { supabase } from '@/integrations/supabase/client';
import { AGE_GROUPS, buildProfileCode } from '@/data/questions';
import { User, Briefcase, GraduationCap, Home, Rocket, Laptop, Palmtree, CheckCircle2 } from 'lucide-react';
import MuteButton from './MuteButton';
import CountryCodePicker, { COUNTRIES, Country } from './CountryCodePicker';
import finquoLogo from '@/assets/finquo-logo-white.png';

const NARRATION_TEXTS = [
  "Let's get to know you a bit! Fill in your details to personalize your results.",
  "Almost there! What best describes your current role?",
];

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SAL: <Briefcase size={18} />,
  STU: <GraduationCap size={18} />,
  HOM: <Home size={18} />,
  BUS: <Rocket size={18} />,
  SELF: <Laptop size={18} />,
  RET: <Palmtree size={18} />,
};

function getAgeGroup(age: number): string | null {
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 39) return '26-39';
  if (age >= 40 && age <= 59) return '40-59';
  if (age >= 60) return '60+';
  return null;
}

const ProfileScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const hasNarrated = useRef<number>(-1);
  // Derive initial phone digits by stripping country dial code
  const existingProfile = state.profile;
  const matchedCountry = COUNTRIES.find(c => c.name === existingProfile.country) || COUNTRIES[0];
  const initialPhone = existingProfile.phone
    ? existingProfile.phone.replace(matchedCountry.dial, '')
    : '';

  const isRetake = existingProfile.name.trim().length > 0 && existingProfile.age > 0;
  const [step, setStep] = useState(isRetake ? 1 : 0);
  const [name, setName] = useState(existingProfile.name || '');
  const [age, setAge] = useState(existingProfile.age > 0 ? String(existingProfile.age) : '');
  const [gender, setGender] = useState(existingProfile.gender || '');
  const [phone, setPhone] = useState(initialPhone);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(matchedCountry);
  const [campaignCode, setCampaignCode] = useState(state.campaignCode || '');
  const [campaignCodeError, setCampaignCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  // OTP inline state — auto-verified on retake
  const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verified'>(
    state.phoneVerified ? 'verified' : 'idle'
  );
  const [otp, setOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();


  useEffect(() => {
    if (!state.isMuted && hasNarrated.current !== step) {
      hasNarrated.current = step;
      const timer = setTimeout(() => speak(NARRATION_TEXTS[step]), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, step]);

  useEffect(() => {
    if (otpStep !== 'idle' && otpStep !== 'verified') {
      setOtpStep('idle');
      setOtp('');
      setOtpError('');
      setResendTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [phone, selectedCountry]);

  const ageNum = parseInt(age, 10);
  const isValidAge = !isNaN(ageNum) && ageNum >= 18 && ageNum <= 120;
  const phoneDigits = phone.replace(/[^\d]/g, '');
  const isPhoneValid = phoneDigits.length >= 10;
  const canProceedStep0 = (isRetake || name.trim().length > 0) && isValidAge && otpStep === 'verified';

  const fullPhone = selectedCountry.dial + phone;

  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
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

  const handleSendOTP = async () => {
    setOtpError('');
    setOtpSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone },
      });
      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to send OTP');
      }
      setOtpStep('sent');
      startResendTimer();
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setOtpVerifying(true);
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
        dispatch({ type: 'SET_PHONE_VERIFIED', verified: true });
        return;
      }
      setOtpError(data?.error || 'Incorrect OTP. Please try again.');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setOtpError('');
    await handleSendOTP();
  };

  const handleStep0Next = async () => {
    stop();
    if (campaignCode.trim() && !state.campaignCode) {
      setValidatingCode(true);
      setCampaignCodeError('');
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, campaign_code')
        .eq('campaign_code', campaignCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      setValidatingCode(false);
      if (error || !data) {
        setCampaignCodeError('Invalid campaign code');
        return;
      }
      dispatch({ type: 'SET_CAMPAIGN', campaignId: data.id });
      dispatch({ type: 'SET_CAMPAIGN_CODE', code: data.campaign_code });
    }
    const ageGroup = getAgeGroup(ageNum);
    if (!ageGroup) return;
    setSelectedAgeGroup(ageGroup);
    setStep(1);
  };

  const handleRoleSelect = (roleCode: string, roleLabel: string) => {
    stop();
    const ageConfig = AGE_GROUPS.find(a => a.ageGroup === selectedAgeGroup);
    if (!ageConfig) return;
    const profileCode = buildProfileCode(ageConfig.ageCode, roleCode);

    const profile: PlayerProfile = {
      name: name.trim(),
      age: ageNum,
      ageGroup: selectedAgeGroup,
      gender,
      phone: fullPhone,
      country: selectedCountry.name,
      state: '',
      district: '',
      role: roleCode,
      roleLabel,
      profileCode,
    };

    dispatch({ type: 'SET_PROFILE', profile });
    dispatch({ type: 'START_QUIZ' });
  };

  const selectedAgeConfig = AGE_GROUPS.find(a => a.ageGroup === selectedAgeGroup);

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12 relative">
      <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="absolute top-4 right-4 z-20" />
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto mx-auto mb-4" />
          <div className="w-12 h-12 rounded-full bg-game-gold/20 flex items-center justify-center mx-auto mb-3">
            {step === 0 ? <User size={24} className="text-game-gold" /> : <Briefcase size={24} className="text-game-gold" />}
          </div>
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">
            {step === 0 ? 'Create Your Profile' : 'Your Role'}
          </h2>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1].map(i => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all ${i <= step ? 'gold-gradient' : 'bg-game-card'}`} />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            {!isRetake && (
              <>
                <div>
                  <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Your Name <span className="text-game-gold">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Your Age <span className="text-game-gold">*</span></label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    min={18}
                    max={120}
                    className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                  />
                  {age && !isValidAge && <p className="text-red-400 text-xs mt-1">Please enter a valid age (18+)</p>}
                </div>
                <div>
                  <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Gender (optional)</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            {isRetake && (
              <div className="text-center py-2">
                <p className="text-game-text font-body text-sm">Welcome back, <span className="text-game-gold font-semibold">{name}</span>!</p>
                <p className="text-game-muted text-xs mt-1">Please verify your phone number to continue.</p>
              </div>
            )}

            {/* Phone + inline OTP */}
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">
                Phone Number <span className="text-game-gold">*</span>
                {otpStep === 'verified' && (
                  <span className="inline-flex items-center gap-1 ml-2 text-green-400 normal-case tracking-normal">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <CountryCodePicker selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="9876543210"
                  disabled={false}
                  className="flex-1 min-w-0 bg-game-surface text-game-text rounded-xl px-3 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors disabled:opacity-60"
                />
              </div>
              {isPhoneValid && otpStep === 'idle' && (
                <button
                  onClick={handleSendOTP}
                  disabled={otpSending}
                  className="w-full mt-2 px-4 py-3 rounded-xl text-sm font-display font-semibold gold-gradient text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                >
                  {otpSending ? 'Sending…' : 'Send OTP'}
                </button>
              )}

              {/* OTP input area */}
              {otpStep === 'sent' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  <label className="text-game-muted text-xs font-body uppercase tracking-wider block">Enter OTP</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                      placeholder="• • • • • •"
                      className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-xl tracking-[0.4em] text-center font-mono"
                    />
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || otpVerifying}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                        otp.length === 6
                          ? 'gold-gradient text-white hover:scale-105 active:scale-95'
                          : 'bg-game-card text-game-muted cursor-not-allowed'
                      }`}
                    >
                      {otpVerifying ? 'Verifying…' : 'Verify OTP'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleResend}
                      disabled={resendTimer > 0 || otpSending}
                      className={`text-xs font-body ${resendTimer > 0 ? 'text-game-muted' : 'text-game-gold hover:underline'}`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}

              {otpError && <p className="text-red-400 text-xs mt-1">{otpError}</p>}
            </div>

            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Campaign Code (optional)</label>
              <input
                type="text"
                maxLength={5}
                value={campaignCode}
                onChange={e => { setCampaignCode(e.target.value.toUpperCase()); setCampaignCodeError(''); }}
                placeholder="e.g. AB12C"
                readOnly={!!state.campaignCode}
                className={`w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border ${campaignCodeError ? 'border-red-500' : 'border-game-card'} focus:border-game-gold focus:outline-none transition-colors ${state.campaignCode ? 'opacity-70' : ''}`}
              />
              {campaignCodeError && <p className="text-red-400 text-xs mt-1">{campaignCodeError}</p>}
            </div>
          </div>
        )}

        {step === 1 && selectedAgeConfig && (
          <div>
            <p className="text-game-muted text-sm font-body text-center mb-4">What best describes your current role?</p>
            <div className="space-y-2.5">
              {selectedAgeConfig.roles.map(role => (
                <button
                  key={role.code}
                  onClick={() => handleRoleSelect(role.code, role.label)}
                  className="w-full glass-card rounded-xl px-5 py-4 text-sm font-body text-left transition-all text-game-text active:border-game-gold/30 active:scale-[0.99] flex items-center gap-3"
                >
                  <span className="text-game-gold">{ROLE_ICONS[role.code] || <User size={18} />}</span>
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {step === 0 && (
            <button
              disabled={!canProceedStep0 || validatingCode}
              onClick={handleStep0Next}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${canProceedStep0 ? 'gold-gradient text-white game-shadow hover:scale-105 active:scale-95' : 'bg-game-card text-game-muted cursor-not-allowed'}`}
            >
              {validatingCode ? 'Validating...' : 'Next →'}
            </button>
          )}
          <button
            onClick={() => { stop(); step === 0 ? dispatch({ type: 'SET_STEP', step: 'consent' }) : setStep(step - 1); }}
            className="w-full py-3 text-game-muted font-body text-sm hover:text-game-text transition-colors"
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileScreen;
