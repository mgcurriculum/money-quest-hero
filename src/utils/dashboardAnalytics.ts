import type { Tables } from '@/integrations/supabase/types';
import { dimensions, dimensionIcons } from '@/data/questions';

type Session = Tables<'game_sessions'>;

export interface DetailedAnswer {
  questionNo: number;
  dimension: string;
  category: string;
  question: string;
  selectedOption: string;
  score: number;
}

export interface DimensionScoreEntry {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface EnrichedAnswers {
  detailed?: DetailedAnswer[];
  dimensionScores?: DimensionScoreEntry[];
  totalScore?: number;
}

export function getEnrichedAnswers(session: Session): EnrichedAnswers {
  const answers = session.answers as any;
  if (answers?.detailed) return answers as EnrichedAnswers;
  return { detailed: [], dimensionScores: [], totalScore: session.fq_score || 0 };
}

export function getDetailedAnswers(session: Session): DetailedAnswer[] {
  return getEnrichedAnswers(session).detailed || [];
}

export function getDimensionScores(session: Session): { dimension: string; score: number }[] {
  const enriched = getEnrichedAnswers(session);
  if (enriched.dimensionScores && enriched.dimensionScores.length > 0) {
    return enriched.dimensionScores.map(ds => ({
      dimension: ds.dimension,
      score: ds.percentage,
    }));
  }
  return dimensions.map(dim => ({ dimension: dim, score: 0 }));
}

// Question-level analytics
export interface QuestionStat {
  question: string;
  dimension: string;
  totalResponses: number;
  avgScore: number;
  distribution: Record<string, number>;
}

export function computeQuestionStats(sessions: Session[]): QuestionStat[] {
  const questionMap = new Map<string, {
    question: string;
    dimension: string;
    scores: number[];
    optionCounts: Record<string, number>;
  }>();

  sessions.forEach(s => {
    const detailed = getDetailedAnswers(s);
    detailed.forEach(d => {
      if (!d.dimension || !d.question) return;
      const key = `${d.dimension}-${d.question.substring(0, 60)}`;
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          question: d.question,
          dimension: d.dimension,
          scores: [],
          optionCounts: {},
        });
      }
      const stat = questionMap.get(key)!;
      stat.scores.push(d.score ?? 0);
      if (d.selectedOption) {
        stat.optionCounts[d.selectedOption] = (stat.optionCounts[d.selectedOption] || 0) + 1;
      }
    });
  });

  return Array.from(questionMap.values()).map(stat => ({
    question: stat.question,
    dimension: stat.dimension,
    totalResponses: stat.scores.length,
    avgScore: stat.scores.length > 0 ? +(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length).toFixed(0) : 0,
    distribution: stat.optionCounts,
  })).sort((a, b) => a.dimension.localeCompare(b.dimension));
}

// Dimension averages across sessions
export interface DimensionAverage {
  dimension: string;
  icon: string;
  avgScore: number;
  sessionCount: number;
}

export function computeDimensionAverages(sessions: Session[]): DimensionAverage[] {
  const sums: number[] = new Array(dimensions.length).fill(0);
  const counts: number[] = new Array(dimensions.length).fill(0);

  sessions.forEach(s => {
    const scores = getDimensionScores(s);
    scores.forEach((ds, i) => {
      if (i < dimensions.length && ds.score > 0) {
        sums[i] += ds.score;
        counts[i]++;
      }
    });
  });

  return dimensions.map((dim, i) => ({
    dimension: dim,
    icon: dimensionIcons[i],
    avgScore: counts[i] > 0 ? Math.round(sums[i] / counts[i]) : 0,
    sessionCount: counts[i],
  }));
}

// Risk indicators
export function computeRiskIndicators(sessions: Session[]): { dimension: string; icon: string; riskPercent: number; totalPlayers: number }[] {
  const criticalDimensions = [3, 5]; // Debt Awareness, Financial Safety (indices in 6-dim array)
  return criticalDimensions.map(dimIdx => {
    let atRisk = 0;
    let total = 0;
    sessions.forEach(s => {
      const scores = getDimensionScores(s);
      if (scores[dimIdx] && scores[dimIdx].score > 0) {
        total++;
        if (scores[dimIdx].score < 40) atRisk++;
      }
    });
    return {
      dimension: dimensions[dimIdx],
      icon: dimensionIcons[dimIdx],
      riskPercent: total > 0 ? Math.round((atRisk / total) * 100) : 0,
      totalPlayers: total,
    };
  });
}

// Reflection answer summary
export function computeReflectionSummary(sessions: Session[]): { option: string; count: number; percent: number }[] {
  const counts: Record<string, number> = {};
  let total = 0;
  sessions.forEach(s => {
    if (s.reflection_answer) {
      counts[s.reflection_answer] = (counts[s.reflection_answer] || 0) + 1;
      total++;
    }
  });
  return Object.entries(counts)
    .map(([option, count]) => ({ option, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

// Score trend over time
export function computeScoreTrend(sessions: Session[]): { date: string; avgScore: number; count: number }[] {
  const byDate: Record<string, { sum: number; count: number }> = {};
  sessions.forEach(s => {
    const date = new Date(s.created_at).toISOString().split('T')[0];
    if (!byDate[date]) byDate[date] = { sum: 0, count: 0 };
    byDate[date].sum += s.fq_score || 0;
    byDate[date].count++;
  });
  return Object.entries(byDate)
    .map(([date, d]) => ({ date, avgScore: Math.round(d.sum / d.count), count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Profile code distribution
export function computeProfileDistribution(sessions: Session[]): { profileCode: string; count: number }[] {
  const counts: Record<string, number> = {};
  sessions.forEach(s => {
    const code = (s as any).profile_code || 'Unknown';
    counts[code] = (counts[code] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([profileCode, count]) => ({ profileCode, count }))
    .sort((a, b) => b.count - a.count);
}
