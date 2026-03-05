import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame, PlayerProfile } from '@/context/GameContext';

const statusOptions = [
  { label: '🎓 School (11/12)', value: 'school' },
  { label: '🎓 College', value: 'college' },
  { label: '🎓 Skill Program', value: 'skill' },
  { label: '💼 Working', value: 'working' },
];

const incomeOptions = [
  { label: '💰 Pocket Money', value: 'pocket' },
  { label: '💰 Part-time Income', value: 'parttime' },
  { label: '👪 Dependent on Parents', value: 'dependent' },
  { label: '💼 Salary', value: 'salary' },
  { label: '💼 Business Revenue', value: 'business' },
];

const ProfileScreen = () => {
  const { dispatch } = useGame();
  const [profile, setProfile] = useState<PlayerProfile>({
    name: '', age: '', gender: '', phone: '',
    country: 'India', state: '', district: '',
    status: '', incomeType: '',
  });
  const [step, setStep] = useState(0); // 0: personal, 1: status

  const updateField = (field: keyof PlayerProfile, value: string) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const canProceedStep0 = profile.name.trim().length > 0;
  const canProceedStep1 = profile.status && profile.incomeType;

  return (
    <div className="min-h-screen game-gradient flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🧑‍🎮</span>
          <h2 className="text-3xl font-display font-bold text-game-text mb-2">Create Your Money Profile</h2>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${i <= step ? 'gold-gradient' : 'bg-game-card'}`} />
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
          <div className="space-y-5">
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-3 block text-center">Current Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('status', opt.value)}
                    className={`glass-card rounded-xl px-4 py-3 text-sm font-body text-left transition-all ${profile.status === opt.value ? 'border-2 border-game-gold text-game-gold' : 'text-game-text hover:border-game-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-3 block text-center">Income Type</label>
              <div className="grid grid-cols-2 gap-2">
                {incomeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('incomeType', opt.value)}
                    className={`glass-card rounded-xl px-4 py-3 text-sm font-body text-left transition-all ${profile.incomeType === opt.value ? 'border-2 border-game-gold text-game-gold' : 'text-game-text hover:border-game-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {step === 0 && (
            <button
              disabled={!canProceedStep0}
              onClick={() => setStep(1)}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${canProceedStep0 ? 'gold-gradient text-game-bg game-shadow hover:scale-105 active:scale-95' : 'bg-game-card text-game-muted cursor-not-allowed'}`}
            >
              Next →
            </button>
          )}
          {step === 1 && (
            <button
              disabled={!canProceedStep1}
              onClick={() => {
                dispatch({ type: 'SET_PROFILE', profile });
                dispatch({ type: 'SET_STEP', step: 'journey' });
              }}
              className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all ${canProceedStep1 ? 'gold-gradient text-game-bg game-shadow hover:scale-105 active:scale-95' : 'bg-game-card text-game-muted cursor-not-allowed'}`}
            >
              Begin Quest! 🎮
            </button>
          )}
          <button
            onClick={() => step === 0 ? dispatch({ type: 'SET_STEP', step: 'consent' }) : setStep(0)}
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
