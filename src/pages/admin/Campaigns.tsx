import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, QrCode, Link as LinkIcon, Copy, Check, Trash2, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  campaign_code: string;
  is_active: boolean;
  created_at: string;
  response_count?: number;
  avg_score?: number;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<Campaign | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignData) {
      // Get response counts for each campaign
      const enriched = await Promise.all(
        campaignData.map(async (c: any) => {
          const { count } = await supabase
            .from('game_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', c.id);
          const { data: scores } = await supabase
            .from('game_sessions')
            .select('fq_score')
            .eq('campaign_id', c.id);
          const avg = scores && scores.length > 0
            ? Math.round(scores.reduce((s: number, r: any) => s + (r.fq_score || 0), 0) / scores.length)
            : 0;
          return { ...c, response_count: count || 0, avg_score: avg };
        })
      );
      setCampaigns(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const slug = generateSlug(name);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('campaigns').insert({
      name: name.trim(),
      description: description.trim() || null,
      slug,
      created_by: user?.id,
    } as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Campaign created!' });
      setName('');
      setDescription('');
      setCreateOpen(false);
      fetchCampaigns();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await supabase.from('campaigns').delete().eq('id', id);
    fetchCampaigns();
  };

  const handleToggleActive = async (campaign: Campaign) => {
    await supabase.from('campaigns').update({ is_active: !campaign.is_active } as any).eq('id', campaign.id);
    fetchCampaigns();
  };

  const getCampaignUrl = (slug: string) => `${window.location.origin}/c/${slug}`;

  const copyLink = (campaign: Campaign) => {
    navigator.clipboard.writeText(getCampaignUrl(campaign.slug));
    setCopiedId(campaign.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Create campaigns with unique links and track responses</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No campaigns yet. Create your first campaign!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-lg">{c.name}</h3>
                      <Badge variant={c.is_active ? 'default' : 'secondary'}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {c.description && (
                      <p className="text-sm text-muted-foreground mb-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono font-semibold text-foreground">Code: {c.campaign_code}</span>
                      <span>{c.response_count} responses</span>
                      <span>Avg Score: {c.avg_score}/1000</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyLink(c)}>
                      {copiedId === c.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setQrOpen(c)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/campaigns/${c.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(c)}>
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Create a new campaign with a unique link and QR code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button onClick={handleCreate} disabled={creating || !name.trim()} className="w-full">
              {creating ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrOpen} onOpenChange={() => setQrOpen(null)}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>{qrOpen?.name}</DialogTitle>
            <DialogDescription>Scan this QR code to join the campaign</DialogDescription>
          </DialogHeader>
          {qrOpen && (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeSVG value={getCampaignUrl(qrOpen.slug)} size={220} />
              </div>
              <p className="text-lg font-bold font-mono tracking-widest text-foreground">
                Campaign Code: {qrOpen.campaign_code}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <span className="truncate max-w-[300px]">{getCampaignUrl(qrOpen.slug)}</span>
              </div>
              <Button variant="outline" onClick={() => copyLink(qrOpen)}>
                {copiedId === qrOpen.id ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
