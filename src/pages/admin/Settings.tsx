import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { fqBands as defaultBands, MAX_SCORE } from '@/data/questions';
import { toast } from 'sonner';
import { Save, RotateCcw } from 'lucide-react';

const Settings = () => {
  const [bands, setBands] = useState([...defaultBands]);
  const [loading, setLoading] = useState(true);
  const [savingBands, setSavingBands] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('key', 'score_bands');

        if (data) {
          for (const row of data) {
            if (row.key === 'score_bands') {
              const val = row.value as any;
              if (val?.bands?.length > 0) setBands(val.bands);
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
            Each of the 18 questions has 5 options scored 10-50 by admin. Total score is the sum of all selected option scores. Maximum possible score is {MAX_SCORE} (18 × 50).
          </p>
        </CardContent>
      </Card>

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
