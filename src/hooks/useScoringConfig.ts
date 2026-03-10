import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fqBands as defaultBands } from '@/data/questions';

export interface ScoringConfig {
  bands: { min: number; max: number; level: string; meaning: string; emoji: string }[];
  loading: boolean;
}

export function useScoringConfig(): ScoringConfig {
  const [bands, setBands] = useState(defaultBands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('key', 'score_bands');

        if (data) {
          for (const row of data) {
            if (row.key === 'score_bands') {
              const val = row.value as any;
              if (val?.bands && Array.isArray(val.bands) && val.bands.length > 0) {
                setBands(val.bands);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load scoring config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return { bands, loading };
}
