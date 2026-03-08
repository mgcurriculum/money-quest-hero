import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GameProvider, useGame } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import LevelPlay from '@/components/game/LevelPlay';
import RealityCheckPlay from '@/components/game/RealityCheckPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';
import CampaignJoinScreen from '@/components/game/CampaignJoinScreen';
import { Loader2 } from 'lucide-react';

interface CampaignData {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

const CampaignGameFlow = ({ campaign }: { campaign: CampaignData }) => {
  const { state } = useGame();
  const [joinStep, setJoinStep] = useState<'check' | 'game' | null>(null);
  const [existingSession, setExistingSession] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  // If in 'check' step, show the join screen
  if (joinStep === 'check' && existingSession) {
    return (
      <CampaignJoinScreen
        campaign={campaign}
        existingSession={existingSession}
        onJoinExisting={async () => {
          // Clone existing session into this campaign
          await supabase.from('game_sessions').insert({
            ...existingSession,
            id: undefined,
            campaign_id: campaign.id,
            created_at: undefined,
          } as any);
          // Show a success message or redirect
          setJoinStep('game');
          // Jump to report
        }}
        onRetake={() => setJoinStep('game')}
      />
    );
  }

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'profile': return <ProfileScreen campaignId={campaign.id} onExistingUser={(session: any) => {
      setExistingSession(session);
      setJoinStep('check');
    }} />;
    case 'level': return state.currentLevel === 0 ? <RealityCheckPlay /> : <LevelPlay />;
    case 'reflection': return <ReflectionScreen />;
    case 'report': return <ReportScreen campaignId={campaign.id} />;
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
        .select('id, name, slug, is_active')
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
      <GlobalProgressBar />
      <CampaignGameFlow campaign={campaign!} />
    </GameProvider>
  );
};

export default CampaignLanding;
