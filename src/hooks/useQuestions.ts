import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { realityQuestions, levels } from '@/data/questions';

interface OptionItem {
  text: string;
  emoji: string;
}

interface DBQuestion {
  id: string;
  level: number;
  category: string;
  question_text: string;
  options: OptionItem[];
  age_groups: string[];
  is_active: boolean;
  sort_order: number;
}

function getAgeGroup(age: string): string {
  if (!age) return '18-25';
  if (['18-25', '26-39', '40-59', '60+'].includes(age)) return age;
  const n = parseInt(age);
  if (n < 18) return '18-25';
  if (n <= 25) return '18-25';
  if (n <= 39) return '26-39';
  if (n <= 59) return '40-59';
  return '60+';
}

export function useQuestions(playerAge?: string) {
  const [dbQuestions, setDbQuestions] = useState<DBQuestion[] | null>(null);
  const [questionsPerLevel, setQuestionsPerLevel] = useState<Record<number, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: qData }, { data: settingsData }] = await Promise.all([
          supabase.from('questions').select('*').eq('is_active', true).order('level').order('sort_order'),
          supabase.from('admin_settings').select('*').eq('key', 'questions_per_level').maybeSingle(),
        ]);

        if (qData && qData.length > 0) {
          setDbQuestions(qData.map(q => ({
            ...q,
            options: q.options as any as OptionItem[],
          })));
        }

        if (settingsData?.value && typeof settingsData.value === 'object') {
          setQuestionsPerLevel(settingsData.value as Record<number, number>);
        }
      } catch {
        // fallback to hardcoded
      }
      setLoading(false);
    };
    load();
  }, []);

  const getQuestionsForLevel = (level: number) => {
    const ageGroup = getAgeGroup(playerAge || '');

    if (dbQuestions) {
      let filtered = dbQuestions.filter(q => q.level === level && q.age_groups.includes(ageGroup));
      const limit = questionsPerLevel?.[level];
      if (limit && filtered.length > limit) {
        // Shuffle and take limit
        filtered = [...filtered].sort(() => Math.random() - 0.5).slice(0, limit);
        filtered.sort((a, b) => a.sort_order - b.sort_order);
      }
      return filtered.map(q => ({
        question: q.question_text,
        category: q.category,
        options: q.options,
      }));
    }

    // Fallback to hardcoded
    if (level === 0) return realityQuestions;
    const lvl = levels.find(l => l.id === level);
    return (lvl?.scenarios || []).map(s => ({
      question: s.situation,
      category: '',
      options: s.options,
    }));
  };

  return { getQuestionsForLevel, loading };
}
