import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptionItem {
  text: string;
  emoji: string;
}

export interface AdaptiveQuestion {
  id: string;
  level: number;
  dimension: string;
  category: string;
  question_text: string;
  options: OptionItem[];
  difficulty: number;
  branch_low: number | null;
  branch_mid: number | null;
  branch_high: number | null;
}

interface DimensionScore {
  scores: number[];
  total: number;
}

const DIMENSION_LEVELS: Record<number, string> = {
  0: 'Financial Reality',
  1: 'Earning Mindset',
  2: 'Spending Discipline',
  3: 'Saving Behaviour',
  4: 'Debt Awareness',
  5: 'Investment Awareness',
  6: 'Financial Safety',
};

const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 18;
const TOTAL_DIMENSIONS = 7;

function getAgeGroup(age: string): string {
  if (!age) return '18-25';
  if (['18-25', '26-39', '40-59', '60+'].includes(age)) return age;
  const n = parseInt(age);
  if (n <= 25) return '18-25';
  if (n <= 39) return '26-39';
  if (n <= 59) return '40-59';
  return '60+';
}

export function useAdaptiveEngine(playerAge?: string) {
  const [allQuestions, setAllQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [dimensionScores, setDimensionScores] = useState<Record<number, DimensionScore>>({});
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const ageGroup = getAgeGroup(playerAge || '');

  // Load all active questions from DB
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('questions')
          .select('*')
          .eq('is_active', true)
          .order('level')
          .order('sort_order');

        if (data && data.length > 0) {
          const mapped: AdaptiveQuestion[] = data.map((q: any) => ({
            id: q.id,
            level: q.level,
            dimension: q.dimension || DIMENSION_LEVELS[q.level] || '',
            category: q.category,
            question_text: q.question_text,
            options: q.options as any as OptionItem[],
            difficulty: q.difficulty ?? 2,
            branch_low: q.branch_low,
            branch_mid: q.branch_mid,
            branch_high: q.branch_high,
          }));
          setAllQuestions(mapped);
        }
      } catch {
        // fallback: no questions
      }
      setLoading(false);
    };
    load();
  }, []);

  // Pick next question for a given level
  const pickQuestion = useCallback((targetLevel: number, excludeIds: Set<string>): AdaptiveQuestion | null => {
    const candidates = allQuestions.filter(q =>
      q.level === targetLevel &&
      !excludeIds.has(q.id) &&
      q.options && q.options.length > 0
    );

    // Filter by age group if questions have age_groups data
    // (the DB field is age_groups array; we check via raw data)
    if (candidates.length === 0) return null;

    // Pick by difficulty preference: start medium, go easy/hard based on performance
    const dimScores = dimensionScores[targetLevel];
    let preferred = 2; // medium
    if (dimScores && dimScores.scores.length > 0) {
      const avg = dimScores.total / dimScores.scores.length;
      if (avg <= 1.5) preferred = 1; // easy
      else if (avg >= 3.5) preferred = 3; // hard
    }

    // Sort by closeness to preferred difficulty
    const sorted = [...candidates].sort((a, b) =>
      Math.abs(a.difficulty - preferred) - Math.abs(b.difficulty - preferred)
    );

    return sorted[0] || null;
  }, [allQuestions, dimensionScores]);

  // Initialize: pick first question from level 0
  useEffect(() => {
    if (loading || initialized.current || allQuestions.length === 0) return;
    initialized.current = true;
    const first = pickQuestion(0, new Set());
    if (first) {
      setCurrentQuestion(first);
      setAskedIds(new Set([first.id]));
    }
  }, [loading, allQuestions, pickQuestion]);

  // Get dimensions covered so far
  const dimensionsCovered = Object.keys(dimensionScores).map(Number);

  // Check completion
  const checkComplete = useCallback((answered: number, dimsCovered: number[]) => {
    if (answered >= MAX_QUESTIONS) return true;
    if (answered >= MIN_QUESTIONS && dimsCovered.length >= TOTAL_DIMENSIONS) return true;
    return false;
  }, []);

  // Submit answer and get next question
  const submitAnswer = useCallback((score: number) => {
    if (!currentQuestion || isComplete) return;

    const level = currentQuestion.level;
    const newAnswered = questionsAnswered + 1;
    const newAskedIds = new Set(askedIds);
    newAskedIds.add(currentQuestion.id);

    // Update dimension scores
    const newDimScores = { ...dimensionScores };
    if (!newDimScores[level]) {
      newDimScores[level] = { scores: [], total: 0 };
    }
    newDimScores[level] = {
      scores: [...newDimScores[level].scores, score],
      total: newDimScores[level].total + score,
    };

    const coveredDims = Object.keys(newDimScores).map(Number);

    // Check if done
    if (checkComplete(newAnswered, coveredDims)) {
      setDimensionScores(newDimScores);
      setQuestionsAnswered(newAnswered);
      setAskedIds(newAskedIds);
      setIsComplete(true);
      setCurrentQuestion(null);
      return;
    }

    // Determine next level via branching
    let nextLevel: number;
    const hasBranching = currentQuestion.branch_low !== null ||
      currentQuestion.branch_mid !== null ||
      currentQuestion.branch_high !== null;

    if (hasBranching) {
      if (score <= 1 && currentQuestion.branch_low !== null) {
        nextLevel = currentQuestion.branch_low;
      } else if (score >= 3 && currentQuestion.branch_high !== null) {
        nextLevel = currentQuestion.branch_high;
      } else if (currentQuestion.branch_mid !== null) {
        nextLevel = currentQuestion.branch_mid;
      } else {
        nextLevel = Math.min(level + 1, 6);
      }
    } else {
      // No branching: prioritize uncovered dimensions, then sequential
      const uncovered = Array.from({ length: 7 }, (_, i) => i).filter(i => !coveredDims.includes(i));
      if (uncovered.length > 0) {
        nextLevel = uncovered[0];
      } else {
        // All covered — pick dimension with fewest questions
        const counts = coveredDims.map(d => ({ dim: d, count: newDimScores[d]?.scores.length || 0 }));
        counts.sort((a, b) => a.count - b.count);
        nextLevel = counts[0].dim;
      }
    }

    // Ensure nextLevel is valid
    nextLevel = Math.max(0, Math.min(6, nextLevel));

    // Pick next question
    let next = pickQuestion(nextLevel, newAskedIds);

    // If no question available at target level, try other levels
    if (!next) {
      for (let i = 0; i < 7; i++) {
        const tryLevel = (nextLevel + i) % 7;
        next = pickQuestion(tryLevel, newAskedIds);
        if (next) {
          nextLevel = tryLevel;
          break;
        }
      }
    }

    // If still no question, we're done
    if (!next) {
      setDimensionScores(newDimScores);
      setQuestionsAnswered(newAnswered);
      setAskedIds(newAskedIds);
      setIsComplete(true);
      setCurrentQuestion(null);
      return;
    }

    setDimensionScores(newDimScores);
    setQuestionsAnswered(newAnswered);
    setAskedIds(newAskedIds);
    setCurrentLevel(nextLevel);
    setCurrentQuestion(next);
  }, [currentQuestion, questionsAnswered, askedIds, dimensionScores, isComplete, pickQuestion, checkComplete]);

  return {
    currentQuestion,
    questionsAnswered,
    dimensionsCovered,
    dimensionScores,
    isComplete,
    loading,
    submitAnswer,
    currentLevel,
    hasQuestions: allQuestions.length > 0,
  };
}
