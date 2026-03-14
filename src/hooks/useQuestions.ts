import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuestionItem {
  id: string;
  profileCode: string;
  questionNo: number;
  dimension: string;
  category: string;
  questionText: string;
  options: { text: string; score: number }[];
  isActive: boolean;
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useQuestions(profileCode: string) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const hasShuffled = useRef(false);

  useEffect(() => {
    if (!profileCode) { setLoading(false); return; }
    hasShuffled.current = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('questions')
          .select('*')
          .eq('profile_code', profileCode)
          .eq('is_active', true)
          .order('question_no');

        if (data) {
          const mapped = data.map((q: any) => ({
            id: q.id,
            profileCode: q.profile_code,
            questionNo: q.question_no,
            dimension: q.dimension || '',
            category: q.category || '',
            questionText: q.question_text,
            options: shuffle([
              { text: q.option_1, score: q.score_1 },
              { text: q.option_2, score: q.score_2 },
              { text: q.option_3, score: q.score_3 },
              { text: q.option_4, score: q.score_4 },
              { text: q.option_5, score: q.score_5 },
            ].filter(o => o.text.trim())),
            isActive: q.is_active,
          }));
          // Shuffle questions order
          setQuestions(shuffle(mapped));
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
      }
      setLoading(false);
    };
    load();
  }, [profileCode]);

  return { questions, loading };
}
