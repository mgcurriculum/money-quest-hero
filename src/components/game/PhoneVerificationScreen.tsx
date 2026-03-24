import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame, PlayerProfile } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import MuteButton from './MuteButton';
import { useNarration } from '@/hooks/useNarration';
import CountryCodePicker, { COUNTRIES, Country } from './CountryCodePicker';
import { getAgeGroup } from './ProfileScreen';
import { AGE_GROUPS, buildProfileCode } from '@/data/questions';
import finquoLogo from '@/assets/finquo-logo-white.png';
import { toast } from '@/hooks/use-toast';

const PhoneVerificationScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading } = useNarration(state.isMuted);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fullPhone = selectedCountry.dial + phone;
  const phoneDigits = phone.replace(/[^\d]/g, '');
  const isPhoneValid = phoneDigits.length >= 10;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isPhoneValid && isEmailValid;

  // Reset OTP state when phone/country changes
  useEffect(() => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
      setResendTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [phone, selectedCountry]);

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
    setError('');
    if (!isPhoneValid) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone, email: email.trim() },
      });
      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to send OTP');
      }
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
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
        setError(errMsg);
        return;
      }
      if (!data?.verified) {
        setError(data?.error || 'Incorrect OTP. Please try again.');
        return;
      }

      // OTP verified — check if user already exists
      dispatch({ type: 'SET_PHONE_VERIFIED', verified: true });

      const { data: existingSessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('player_phone', fullPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0];
        const ageNum = session.player_age_number || 0;
        const ageGroup = getAgeGroup(ageNum) || '';
        
        // Find role info from profile_code
        const profileCode = session.profile_code || '';
        let roleCode = '';
        let roleLabel = '';
        if (profileCode) {
          const parts = profileCode.split('_');
          if (parts.length >= 2) {
            roleCode = parts.slice(1).join('_');
            const ageConfig = AGE_GROUPS.find(a => a.ageGroup === ageGroup);
            const roleInfo = ageConfig?.roles.find(r => r.code === roleCode);
            roleLabel = roleInfo?.label || roleCode;
          }
        }

        const profile: PlayerProfile = {
          name: session.player_name || '',
          age: ageNum,
          ageGroup,
          gender: session.player_gender || '',
          phone: fullPhone,
          country: session.player_country || selectedCountry.name,
          state: session.player_state || '',
          district: session.player_district || '',
          role: roleCode,
          roleLabel,
          profileCode,
        };

        dispatch({ type: 'SET_PROFILE', profile });

        // Only set campaign from old session if we're NOT already in a campaign flow
        if (!state.campaignId && session.campaign_id) {
          dispatch({ type: 'SET_CAMPAIGN', campaignId: session.campaign_id });
        }

        // If in a campaign flow, link the existing session to this campaign
        if (state.campaignId) {
          try {
            await supabase
              .from('game_sessions')
              .update({ campaign_id: state.campaignId } as any)
              .eq('id', session.id);
          } catch (err) {
            console.error('Failed to link session to campaign:', err);
          }
        }

        dispatch({ type: 'SET_STEP', step: 'existing-user' });
      } else {
        // New user — store phone in profile and go to profile screen
        dispatch({
          type: 'SET_PROFILE',
          profile: {
            ...state.profile,
            phone: fullPhone,
            country: selectedCountry.name,
          },
        });
        dispatch({ type: 'SET_STEP', step: 'profile' });
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative">
      <MuteButton isPlaying={isPlaying} isLoading={isLoading} className="absolute top-4 right-4 z-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto mx-auto mb-4" />
          <div className="w-12 h-12 rounded-full bg-game-gold/20 flex items-center justify-center mx-auto mb-3">
            <Smartphone size={24} className="text-game-gold" />
          </div>
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">
            Verify Your Account
          </h2>
          <p className="text-game-muted text-sm font-body">
            {step === 'phone'
              ? "Enter your phone number and email to get started"
              : `Enter the OTP sent to your mobile number (${fullPhone}) and email (${email.trim()}). Please enter the OTP you received.`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
          {/* Phone input */}
          <div>
            <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">
              Phone Number <span className="text-game-gold">*</span>
            </label>
            <div className="flex gap-2">
              <CountryCodePicker selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="9876543210"
                disabled={step === 'otp'}
                className="flex-1 min-w-0 bg-game-surface text-game-text rounded-xl px-3 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors disabled:opacity-60"
              />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">
                Email Address <span className="text-game-gold">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={step === 'otp'}
                className="w-full bg-game-surface text-game-text rounded-xl px-3 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-game-muted text-xs font-body uppercase tracking-wider block">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="• • • • • •"
                className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-xl tracking-[0.4em] text-center font-mono"
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || sending}
                  className={`text-xs font-body ${resendTimer > 0 ? 'text-game-muted' : 'text-game-gold hover:underline'}`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
                <button
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                  className="text-xs font-body text-game-muted hover:text-game-text"
                >
                  Change Email & Phone Number
                </button>
              </div>
            </motion.div>
          )}

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>

        <div className="mt-6 space-y-3">
          {step === 'phone' ? (
            <button
              disabled={!isFormValid || sending}
              onClick={handleSendOTP}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${
                isFormValid
                  ? 'gold-gradient text-white game-shadow hover:scale-105 active:scale-95'
                  : 'bg-game-card text-game-muted cursor-not-allowed'
              }`}
            >
              {sending ? 'Sending...' : 'Send OTP →'}
            </button>
          ) : (
            <button
              disabled={otp.length !== 6 || verifying}
              onClick={handleVerifyOTP}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${
                otp.length === 6
                  ? 'gold-gradient text-white game-shadow hover:scale-105 active:scale-95'
                  : 'bg-game-card text-game-muted cursor-not-allowed'
              }`}
            >
              {verifying ? 'Verifying...' : 'Verify & Continue →'}
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'consent' })}
            className="w-full py-3 text-game-muted font-body text-sm hover:text-game-text transition-colors"
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneVerificationScreen;
