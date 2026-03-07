import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame, PlayerProfile } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import MuteButton from './MuteButton';

const statusOptions = [
  { label: '🎒 In school (Class 11/12)', value: 'school' },
  { label: '🎓 In college', value: 'college' },
  { label: '🧑‍💻 Doing a course or skill program', value: 'skill' },
  { label: '💼 Working part-time or full-time', value: 'working' },
  { label: '🚀 Running a business / startup', value: 'business' },
];

const incomeOptions = [
  { label: '👨‍👩‍👧 Fully dependent on parents', value: 'dependent' },
  { label: '💸 Pocket money from family', value: 'pocket' },
  { label: '🧑‍💻 Freelance / gig work', value: 'freelance' },
  { label: '💼 Salary from job', value: 'salary' },
  { label: '🚀 Business / startup income', value: 'business' },
];

const PROFILE_TEXT_0 = "Let's get to know you a bit! Just fill in your name, and optionally your age and gender. This helps us personalize your results.";
const PROFILE_TEXT_1 = "Great! Now tell me — what best describes your current stage in life?";
const PROFILE_TEXT_2 = "Almost there! How does money usually come your way?";

const ProfileScreen = () => {
  const { state, dispatch } = useGame();
  const { isPlaying, isLoading, speak, stop } = useNarration(state.isMuted);
  const hasNarrated = useRef<number>(-1);
  const [profile, setProfile] = useState<PlayerProfile>({
    name: '', age: '', gender: '', phone: '',
    country: 'India', state: '', district: '',
    status: '', incomeType: '',
  });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!state.isMuted && hasNarrated.current !== step) {
      hasNarrated.current = step;
      const texts = [PROFILE_TEXT_0, PROFILE_TEXT_1, PROFILE_TEXT_2];
      const timer = setTimeout(() => speak(texts[step]), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, step]);

  const updateField = (field: keyof PlayerProfile, value: string) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const canProceedStep0 = profile.name.trim().length > 0;

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
          <span className="text-5xl mb-4 block">{step === 0 ? '🧑‍🎮' : step === 1 ? '🎯' : '💰'}</span>
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">
            {step === 0 ? 'Create Your Profile' : step === 1 ? 'Your Current Stage' : 'Your Income Source'}
          </h2>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all ${i <= step ? 'gold-gradient' : 'bg-game-card'}`} />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Your Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={e => updateField('age', e.target.value)}
                  placeholder="Age"
                  className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Gender</label>
                <select
                  value={profile.gender}
                  onChange={e => updateField('gender', e.target.value)}
                  className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Phone (optional)</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+91"
                className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-game-muted text-sm font-body text-center mb-4">What best describes your current stage?</p>
            <div className="space-y-2.5">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateField('status', opt.value); stop(); setStep(2); }}
                  className={`w-full glass-card rounded-xl px-5 py-4 text-sm font-body text-left transition-all ${profile.status === opt.value ? 'border-2 border-game-gold text-game-gold' : 'text-game-text hover:border-game-gold/30 hover:scale-[1.01] active:scale-[0.99]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-game-muted text-sm font-body text-center mb-4">How do you usually receive money?</p>
            <div className="space-y-2.5">
              {incomeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const updatedProfile = { ...profile, incomeType: opt.value };
                    stop();
                    dispatch({ type: 'SET_PROFILE', profile: updatedProfile });
                    dispatch({ type: 'START_LEVEL', level: 0 });
                  }}
                  className={`w-full glass-card rounded-xl px-5 py-4 text-sm font-body text-left transition-all ${profile.incomeType === opt.value ? 'border-2 border-game-gold text-game-gold' : 'text-game-text hover:border-game-gold/30 hover:scale-[1.01] active:scale-[0.99]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {step === 0 && (
            <button
              disabled={!canProceedStep0}
              onClick={() => { stop(); setStep(1); }}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${canProceedStep0 ? 'gold-gradient text-white game-shadow hover:scale-105 active:scale-95' : 'bg-game-card text-game-muted cursor-not-allowed'}`}
            >
              Next →
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
