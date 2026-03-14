import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame, PlayerProfile } from '@/context/GameContext';
import { useNarration } from '@/hooks/useNarration';
import { supabase } from '@/integrations/supabase/client';
import { AGE_GROUPS, buildProfileCode } from '@/data/questions';
import { User, Briefcase, GraduationCap, Home, Rocket, Laptop, Palmtree } from 'lucide-react';
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
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [campaignCode, setCampaignCode] = useState(state.campaignCode || '');
  const [campaignCodeError, setCampaignCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  useEffect(() => {
    if (!state.isMuted && hasNarrated.current !== step) {
      hasNarrated.current = step;
      const timer = setTimeout(() => speak(NARRATION_TEXTS[step]), 500);
      return () => clearTimeout(timer);
    }
  }, [state.isMuted, speak, step]);

  const ageNum = parseInt(age, 10);
  const isValidAge = !isNaN(ageNum) && ageNum >= 18 && ageNum <= 120;
  const canProceedStep0 = name.trim().length > 0 && isValidAge && phone.replace(/[^\d]/g, '').length >= 10;

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
      ageGroup: selectedAgeGroup,
      gender,
      phone: selectedCountry.dial + phone,
      country: selectedCountry.name,
      state: '',
      district: '',
      role: roleCode,
      roleLabel,
      profileCode,
    };

    dispatch({ type: 'SET_PROFILE', profile });
    dispatch({ type: 'SET_STEP', step: 'phone-verify' });
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
            <div>
              <label className="text-game-muted text-xs font-body uppercase tracking-wider mb-1 block">Phone Number <span className="text-game-gold">*</span></label>
              <div className="flex gap-2">
                <CountryCodePicker selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors"
                />
              </div>
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
