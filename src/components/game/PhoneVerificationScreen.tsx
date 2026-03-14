import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone } from 'lucide-react';
import MuteButton from './MuteButton';
import { useNarration } from '@/hooks/useNarration';
import finquoLogo from '@/assets/finquo-logo-white.png';

const PhoneVerificationScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading } = useNarration(state.isMuted);
  const [phone, setPhone] = useState(state.profile.phone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

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

  const handleSendOTP = async () => {
    setError('');
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone },
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
        body: { phone, otp },
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

      if (data?.verified) {
        dispatch({ type: 'SET_PHONE_VERIFIED', verified: true });
        dispatch({ type: 'START_QUIZ' });
        return;
      }

      setError(data?.error || 'Incorrect OTP. Please try again.');
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
    setSending(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone },
      });
      if (fnError || data?.error) throw new Error(data?.error || 'Failed to resend');
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12 relative">
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
            Verify Your Phone
          </h2>
          <p className="text-game-muted text-sm font-body">
            {step === 'phone'
              ? `We'll send a verification code to ${phone}`
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          {step === 'phone' ? (
            <div className="text-center">
              <p className="text-game-text text-lg font-body tracking-wider">{phone}</p>
              <p className="text-game-muted text-xs mt-1">Tap Send OTP to receive your code</p>
            </div>
          ) : (
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="• • • • • •"
                className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-2xl tracking-[0.5em] text-center font-mono"
              />
              <div className="flex justify-between items-center mt-2">
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
                  Change number
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-destructive text-xs text-center">{error}</p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {step === 'phone' ? (
            <button
              disabled={!phone.trim() || sending}
              onClick={handleSendOTP}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${
                phone.trim()
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
            onClick={() => dispatch({ type: 'SET_STEP', step: 'profile' })}
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
