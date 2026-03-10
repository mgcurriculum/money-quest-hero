import { useState, useEffect } from 'react';
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

export function useQuestions(profileCode: string) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileCode) { setLoading(false); return; }
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
          setQuestions(data.map((q: any) => ({
            id: q.id,
            profileCode: q.profile_code,
            questionNo: q.question_no,
            dimension: q.dimension || '',
            category: q.category || '',
            questionText: q.question_text,
            options: [
              { text: q.option_1, score: q.score_1 },
              { text: q.option_2, score: q.score_2 },
              { text: q.option_3, score: q.score_3 },
              { text: q.option_4, score: q.score_4 },
              { text: q.option_5, score: q.score_5 },
            ].filter(o => o.text.trim()),
            isActive: q.is_active,
          })));
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
