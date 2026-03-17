import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { fqBands as defaultBands, MAX_SCORE } from '@/data/questions';
import { toast } from 'sonner';
import { Save, RotateCcw, Eye, EyeOff, Key } from 'lucide-react';
import TTSUsageCard from '@/components/admin/TTSUsageCard';
import TTSCacheCard from '@/components/admin/TTSCacheCard';
import TTSPreGenerateCard from '@/components/admin/TTSPreGenerateCard';

const Settings = () => {
  const [bands, setBands] = useState([...defaultBands]);
  const [loading, setLoading] = useState(true);
  const [savingBands, setSavingBands] = useState(false);

  // API Key state
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', ['score_bands', 'elevenlabs_api_key']);

        if (data) {
          for (const row of data) {
            if (row.key === 'score_bands') {
              const val = row.value as any;
              if (val?.bands?.length > 0) setBands(val.bands);
            }
            if (row.key === 'elevenlabs_api_key') {
              const val = row.value as any;
              if (val?.key) setElevenLabsKey(val.key);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBandChange = (idx: number, field: string, val: string | number) => {
    const next = [...bands];
    next[idx] = { ...next[idx], [field]: field === 'min' || field === 'max' ? Number(val) : val };
    setBands(next);
  };

  const upsert = async (key: string, value: any) => {
    const { data: existing } = await supabase.from('admin_settings').select('id').eq('key', key).maybeSingle();
    if (existing) {
      await supabase.from('admin_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    } else {
      await supabase.from('admin_settings').insert({ key, value });
    }
  };

  const saveBands = async () => {
    setSavingBands(true);
    try {
      await upsert('score_bands', { bands });
      toast.success('Score bands saved');
    } catch { toast.error('Failed to save bands'); }
    finally { setSavingBands(false); }
  };

  const saveApiKey = async () => {
    if (!elevenLabsKey.trim()) { toast.error('Please enter an API key'); return; }
    setSavingKey(true);
    try {
      await upsert('elevenlabs_api_key', { key: elevenLabsKey.trim() });
      toast.success('ElevenLabs API key saved');
    } catch { toast.error('Failed to save API key'); }
    finally { setSavingKey(false); }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Scoring Settings</h1>

      {/* Formula */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How FQ Score is Calculated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm text-center">
            FQ Score = Σ <span className="text-primary">option_scores</span> → <strong>0–{MAX_SCORE}</strong>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Each of the 18 questions has 5 options scored 10-45 by admin. Total score is the sum of all selected option scores. Maximum possible score is {MAX_SCORE} (18 × 45).
          </p>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>Manage third-party API keys used by the application</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">ElevenLabs API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={showKey ? elevenLabsKey : (elevenLabsKey ? maskKey(elevenLabsKey) : '')}
                  onChange={e => { setShowKey(true); setElevenLabsKey(e.target.value); }}
                  placeholder="sk_..."
                  className="h-9 text-sm pr-9 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button size="sm" onClick={saveApiKey} disabled={savingKey} className="h-9">
                <Save className="h-3.5 w-3.5 mr-1" /> {savingKey ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Used for text-to-speech narration. Get your key from{' '}
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">elevenlabs.io</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TTS Pre-Generate & Cache */}
      <TTSPreGenerateCard />
      <TTSCacheCard />
      <TTSUsageCard />

      {/* Score Bands */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Score Bands</CardTitle>
              <CardDescription>Define FQ score ranges (0–{MAX_SCORE}) and their labels</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setBands([...defaultBands])}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
              <Button size="sm" onClick={saveBands} disabled={savingBands}>
                <Save className="h-3.5 w-3.5 mr-1" /> {savingBands ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Emoji</TableHead>
                <TableHead className="w-20">Min</TableHead>
                <TableHead className="w-20">Max</TableHead>
                <TableHead>Band Name</TableHead>
                <TableHead>Meaning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.map((band, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input value={band.emoji} onChange={e => handleBandChange(i, 'emoji', e.target.value)} className="w-14 h-8 text-center text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={band.min} onChange={e => handleBandChange(i, 'min', e.target.value)} className="w-20 h-8 text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={band.max} onChange={e => handleBandChange(i, 'max', e.target.value)} className="w-20 h-8 text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input value={band.level} onChange={e => handleBandChange(i, 'level', e.target.value)} className="h-8 text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input value={band.meaning} onChange={e => handleBandChange(i, 'meaning', e.target.value)} className="h-8 text-sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
