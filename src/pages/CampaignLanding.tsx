import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GameProvider, useGame } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import QuestionPlay from '@/components/game/QuestionPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import PhoneVerificationScreen from '@/components/game/PhoneVerificationScreen';
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

const CampaignGameFlow = () => {
  const { state } = useGame();
  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'profile': return <ProfileScreen />;
    case 'phone-verify': return <PhoneVerificationScreen />;
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
