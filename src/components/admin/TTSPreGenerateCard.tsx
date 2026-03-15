import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Volume2, Loader2, CheckCircle2, XCircle, SkipForward } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface GenerateResult {
  total: number;
  generated: number;
  skipped: number;
  failed: number;
  results: { text: string; status: string; error?: string }[];
}

const TTSPreGenerateCard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-all-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.error || 'Failed to generate audio');
        setLoading(false);
        return;
      }

      const data: GenerateResult = await response.json();
      setResult(data);

      if (data.failed === 0) {
        toast.success(`Done! ${data.generated} generated, ${data.skipped} already cached.`);
      } else {
        toast.warning(`Completed with ${data.failed} failures.`);
      }
    } catch (err: any) {
      toast.error('Request failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-base">Pre-Generate All Audio</CardTitle>
              <CardDescription>Generate all 24 narration files upfront to avoid runtime API calls</CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Volume2 className="h-3.5 w-3.5 mr-1" />}
            {loading ? 'Generating...' : 'Generate All Audio'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Generating audio files... This may take a minute.</p>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.generated}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Generated</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <SkipForward className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.skipped}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Already Cached</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xl font-semibold">{result.failed}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Failed</div>
              </div>
            </div>

            {result.failed > 0 && (
              <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-destructive">Failed items:</p>
                {result.results.filter(r => r.status === 'failed').map((r, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {r.text} — {r.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Generates audio for Welcome, Consent, Profile, Reflection, and all 18 question narrations.
          Already cached files are skipped. Uses the same cache as live narration.
        </p>
      </CardContent>
    </Card>
  );
};

export default TTSPreGenerateCard;
