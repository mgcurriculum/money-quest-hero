import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, BarChart3, Loader2 } from 'lucide-react';
import SpinWheel from '@/components/admin/SpinWheel';
import QuestionInsights from '@/components/admin/QuestionInsights';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface Session {
  id: string;
  player_name: string;
  player_email: string | null;
  player_phone: string | null;
  fq_score: number | null;
  band_level: string | null;
  created_at: string;
  answers: Json;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  winner_session_id: string | null;
}

const CampaignDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Session | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const { data: c } = await supabase.from('campaigns').select('*').eq('id', id).single();
    if (c) setCampaign(c as Campaign);

    const { data: s } = await supabase
      .from('game_sessions')
      .select('id, player_name, player_email, player_phone, fq_score, band_level, created_at, answers')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false });
    if (s) {
      setSessions(s);
      if (c?.winner_session_id) {
        const w = s.find((x: Session) => x.id === c.winner_session_id);
        if (w) setWinner(w);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`campaign-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_sessions',
        filter: `campaign_id=eq.${id}`,
      }, (payload) => {
        setSessions((prev) => [payload.new as Session, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + (r.fq_score || 0), 0) / sessions.length)
    : 0;

  const bandCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.band_level) bandCounts[s.band_level] = (bandCounts[s.band_level] || 0) + 1;
  });

  const handleSpinComplete = async (winnerSession: Session) => {
    setWinner(winnerSession);
    await supabase.from('campaigns').update({ winner_session_id: winnerSession.id } as any).eq('id', id);
    toast({ title: '🎉 Winner Selected!', description: `${winnerSession.player_name} won the campaign!` });
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!campaign) return <div className="p-6">Campaign not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
          {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
        </div>
        <Badge variant={campaign.is_active ? 'default' : 'secondary'} className="ml-auto">
          {campaign.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgScore}</p>
              <p className="text-sm text-muted-foreground">Avg FQ Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{winner ? winner.player_name : 'None'}</p>
              <p className="text-sm text-muted-foreground">Winner</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Band Distribution */}
      {Object.keys(bandCounts).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Score Band Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(bandCounts).map(([band, count]) => (
                <div key={band} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-foreground">{band}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spin Wheel */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">🎡 Lucky Draw - Spin Wheel</CardTitle></CardHeader>
          <CardContent>
            <SpinWheel
              participants={sessions}
              onComplete={handleSpinComplete}
              existingWinner={winner}
            />
          </CardContent>
        </Card>
      )}

      {/* Question Insights */}
      {sessions.length > 0 && (
        <QuestionInsights sessions={sessions as any} />
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Responses ({sessions.length})</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No responses yet. Share the campaign link!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email/Phone</th>
                    <th className="pb-2 pr-4">FQ Score</th>
                    <th className="pb-2 pr-4">Band</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className={`border-b border-border/50 ${winner?.id === s.id ? 'bg-primary/5' : ''}`}>
                      <td className="py-2 pr-4 font-medium text-foreground">
                        {s.player_name}
                        {winner?.id === s.id && <span className="ml-2">🏆</span>}
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{s.player_email || s.player_phone || '-'}</td>
                      <td className="py-2 pr-4 font-semibold text-foreground">{s.fq_score || '-'}</td>
                      <td className="py-2 pr-4"><Badge variant="outline">{s.band_level || '-'}</Badge></td>
                      <td className="py-2 text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDashboard;
