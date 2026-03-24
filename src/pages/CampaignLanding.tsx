import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GameProvider, useGame, GameState } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import PhoneVerificationScreen from '@/components/game/PhoneVerificationScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import ExistingUserScreen from '@/components/game/ExistingUserScreen';
import QuestionPlay from '@/components/game/QuestionPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';

import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';
import { Loader2 } from 'lucide-react';

interface CampaignData {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  campaign_code: string;
}

const CampaignInit = ({ campaign }: { campaign: CampaignData }) => {
  const { dispatch } = useGame();
  useEffect(() => {
    dispatch({ type: 'SET_CAMPAIGN', campaignId: campaign.id });
    dispatch({ type: 'SET_CAMPAIGN_CODE', code: campaign.campaign_code });
  }, [campaign.id, campaign.campaign_code, dispatch]);
  return null;
};

function getCampaignPreviousStep(currentStep: GameState['step']): GameState['step'] | null {
  switch (currentStep) {
    case 'consent': return 'welcome';
    case 'phone-verify': return 'consent';
    case 'profile': return 'phone-verify';
    case 'existing-user': return 'phone-verify';
    case 'quiz': return 'profile';
    case 'reflection': return 'quiz';
    case 'report': return 'reflection';
    default: return null;
  }
}

const CampaignGameFlow = () => {
  const { state, dispatch } = useGame();
  const isPopstateRef = useRef(false);
  const prevStepRef = useRef(state.step);

  // Push browser history when step changes (forward navigation)
  useEffect(() => {
    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      prevStepRef.current = state.step;
      return;
    }
    if (state.step !== prevStepRef.current && state.step !== 'welcome') {
      window.history.pushState({ gameStep: state.step }, '');
    }
    prevStepRef.current = state.step;
  }, [state.step]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      isPopstateRef.current = true;
      const prev = getCampaignPreviousStep(prevStepRef.current);
      if (prev) {
        dispatch({ type: 'SET_STEP', step: prev });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'profile': return <ProfileScreen />;
    case 'quiz': return <QuestionPlay />;
    case 'reflection': return <ReflectionScreen />;
    case 'report': return <ReportScreen />;
    default: return <WelcomeScreen />;
  }
};

const CampaignLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) { setError('Invalid campaign link'); setLoading(false); return; }
      const { data, error: err } = await supabase
        .from('campaigns')
        .select('id, name, slug, is_active, campaign_code')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (err || !data) {
        setError('Campaign not found or inactive');
      } else {
        setCampaign(data as CampaignData);
      }
      setLoading(false);
    };
    fetchCampaign();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center game-gradient"><Loader2 className="h-8 w-8 animate-spin text-game-gold" /></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center game-gradient">
      <div className="text-center">
        <p className="text-4xl mb-4">😔</p>
        <p className="text-game-text text-lg font-semibold">{error}</p>
        <p className="text-game-muted text-sm mt-2">This campaign link is invalid or has been deactivated.</p>
      </div>
    </div>
  );

  return (
    <GameProvider>
      <CampaignInit campaign={campaign!} />
      <GlobalProgressBar />
      <CampaignGameFlow />
    </GameProvider>
  );
};

export default CampaignLanding;
