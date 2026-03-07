import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dimensionWeights as defaultWeights, fqBands as defaultBands } from '@/data/questions';

export interface ScoringConfig {
  weights: number[];
  bands: { min: number; max: number; level: string; meaning: string; emoji: string }[];
  loading: boolean;
}

export function useScoringConfig(): ScoringConfig {
  const [weights, setWeights] = useState<number[]>(defaultWeights);
  const [bands, setBands] = useState(defaultBands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .in('key', ['dimension_weights', 'score_bands']);

        if (data) {
          for (const row of data) {
            if (row.key === 'dimension_weights') {
              const val = row.value as any;
              if (val?.weights && Array.isArray(val.weights) && val.weights.length === 7) {
                setWeights(val.weights);
              }
            }
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
    fetch();
  }, []);

  return { weights, bands, loading };
}
