import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

const LEVELS = [
  { level: 0, label: 'Level 0 — Reality Check', defaultCount: 7 },
  { level: 1, label: 'Level 1 — Earning Quest', defaultCount: 3 },
  { level: 2, label: 'Level 2 — Spending Challenge', defaultCount: 3 },
  { level: 3, label: 'Level 3 — Saving Mission', defaultCount: 3 },
  { level: 4, label: 'Level 4 — Debt Trap', defaultCount: 3 },
  { level: 5, label: 'Level 5 — Investment World', defaultCount: 3 },
  { level: 6, label: 'Level 6 — Protection Shield', defaultCount: 3 },
];

const Settings = () => {
  const [questionsPerLevel, setQuestionsPerLevel] = useState<Record<number, number>>({});
  const [availableCounts, setAvailableCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);

    // Load settings
    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'questions_per_level')
      .maybeSingle();

    const defaults: Record<number, number> = {};
    LEVELS.forEach(l => { defaults[l.level] = l.defaultCount; });

    if (settingsData?.value && typeof settingsData.value === 'object') {
      const val = settingsData.value as Record<string, number>;
      Object.entries(val).forEach(([k, v]) => {
        defaults[Number(k)] = v;
      });
    }
    setQuestionsPerLevel(defaults);

    // Load available question counts
    const { data: questions } = await supabase.from('questions').select('level, is_active').eq('is_active', true);
    const counts: Record<number, number> = {};
    (questions || []).forEach(q => {
      counts[q.level] = (counts[q.level] || 0) + 1;
    });
    setAvailableCounts(counts);

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const value: Json = questionsPerLevel as unknown as Json;

    // Upsert
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('key', 'questions_per_level')
      .maybeSingle();

    if (existing) {
      await supabase.from('admin_settings').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('admin_settings').insert({ key: 'questions_per_level', value });
    }

    toast({ title: 'Settings saved' });
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Questions Per Level</CardTitle>
          <CardDescription>
            Control how many questions are shown to players in each level. The game will randomly pick this many from the active questions available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LEVELS.map(l => (
            <div key={l.level} className="flex items-center gap-4">
              <Label className="w-64">{l.label}</Label>
              <Input
                type="number"
                min={1}
                max={availableCounts[l.level] || 20}
                value={questionsPerLevel[l.level] || l.defaultCount}
                onChange={e => setQuestionsPerLevel(prev => ({ ...prev, [l.level]: Number(e.target.value) }))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                / {availableCounts[l.level] || 0} active
              </span>
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
