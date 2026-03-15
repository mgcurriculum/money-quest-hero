import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HardDrive, Trash2, Loader2 } from 'lucide-react';

const TTSCacheCard = () => {
  const [clearing, setClearing] = useState(false);
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadCacheInfo = async () => {
    try {
      const { data, error } = await supabase.storage.from('tts-cache').list('', { limit: 1000 });
      if (!error && data) {
        setFileCount(data.filter(f => f.name.endsWith('.mp3')).length);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  };

  if (!loaded) {
    loadCacheInfo();
  }

  const clearCache = async () => {
    setClearing(true);
    try {
      const { data } = await supabase.storage.from('tts-cache').list('', { limit: 1000 });
      if (data && data.length > 0) {
        const filePaths = data.map(f => f.name);
        await supabase.storage.from('tts-cache').remove(filePaths);
      }
      setFileCount(0);
      toast.success('TTS cache cleared');
    } catch {
      toast.error('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-base">TTS Audio Cache</CardTitle>
              <CardDescription>Cached audio files reduce API calls and latency</CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={clearCache}
            disabled={clearing || fileCount === 0}
          >
            {clearing ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
            Clear Cache
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">{fileCount ?? '—'}</div>
          <div className="text-xs text-muted-foreground mt-1">cached audio files</div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Audio is automatically cached when narration plays. Subsequent plays of the same text serve from cache instantly with zero API cost. Clear cache if you change voice settings or want to regenerate audio.
        </p>
      </CardContent>
    </Card>
  );
};

export default TTSCacheCard;
