import type { Tables } from '@/integrations/supabase/types';
import { dimensionLabels, dimensionIcons, dimensionWeights } from '@/data/questions';

type Session = Tables<'game_sessions'>;

export interface DetailedAnswer {
  index: number;
  level: number;
  levelTitle: string;
  category: string;
  question: string;
  selectedOption: string;
  selectedEmoji: string;
  score: number;
}

export interface NormalizedDimensionScore {
  dimension: string;
  score: number;
}

export interface EnrichedAnswers {
  detailed?: DetailedAnswer[];
  raw?: Record<string, Record<string, number>>;
  normalizedScores?: NormalizedDimensionScore[];
}

export function getEnrichedAnswers(session: Session): EnrichedAnswers {
  const answers = session.answers as any;
  if (answers?.detailed) return answers as EnrichedAnswers;
  // Legacy format: just raw scores
  return { raw: answers, detailed: [], normalizedScores: [] };
}

export function getDetailedAnswers(session: Session): DetailedAnswer[] {
  return getEnrichedAnswers(session).detailed || [];
}

export function getDimensionScores(session: Session): NormalizedDimensionScore[] {
  const enriched = getEnrichedAnswers(session);
  if (enriched.normalizedScores && enriched.normalizedScores.length > 0) {
    return enriched.normalizedScores;
  }
  // Compute from raw if available
  const raw = enriched.raw || (session.answers as any);
  if (!raw || typeof raw !== 'object') return [];
  
  return dimensionLabels.map((dim, level) => {
    const levelAnswers = raw[level] || {};
    const vals = Object.values(levelAnswers) as number[];
    if (vals.length === 0) return { dimension: dim, score: 0 };
    const userScore = vals.reduce((a: number, b: number) => a + b, 0);
    const minScore = vals.length;
    const maxScore = vals.length * 5;
    const normalized = maxScore > minScore ? ((userScore - minScore) / (maxScore - minScore)) * 100 : 0;
    return { dimension: dim, score: Math.round(normalized) };
  });
}

// Question-level analytics
export interface QuestionStat {
  question: string;
  level: number;
  levelTitle: string;
  totalResponses: number;
  avgScore: number;
  distribution: Record<string, number>; // option text -> count
  scoreDistribution: number[]; // index 0-4 for scores 1-5
}

export function computeQuestionStats(sessions: Session[]): QuestionStat[] {
  const questionMap = new Map<string, {
    question: string;
    level: number;
    levelTitle: string;
    scores: number[];
    optionCounts: Record<string, number>;
    scoreDist: number[];
  }>();

  sessions.forEach(s => {
    const detailed = getDetailedAnswers(s);
    detailed.forEach(d => {
      const key = `${d.level}-${d.question.substring(0, 60)}`;
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          question: d.question,
          level: d.level,
          levelTitle: d.levelTitle,
          scores: [],
          optionCounts: {},
          scoreDist: [0, 0, 0, 0, 0],
        });
      }
      const stat = questionMap.get(key)!;
      stat.scores.push(d.score);
      stat.optionCounts[d.selectedOption] = (stat.optionCounts[d.selectedOption] || 0) + 1;
      if (d.score >= 1 && d.score <= 5) stat.scoreDist[d.score - 1]++;
    });
  });

  return Array.from(questionMap.values()).map(stat => ({
    question: stat.question,
    level: stat.level,
    levelTitle: stat.levelTitle,
    totalResponses: stat.scores.length,
    avgScore: stat.scores.length > 0 ? +(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length).toFixed(2) : 0,
    distribution: stat.optionCounts,
    scoreDistribution: stat.scoreDist,
  })).sort((a, b) => a.level - b.level || a.avgScore - b.avgScore);
}

// Dimension averages across sessions
export interface DimensionAverage {
  dimension: string;
  icon: string;
  avgScore: number;
  weight: number;
  sessionCount: number;
}

export function computeDimensionAverages(sessions: Session[]): DimensionAverage[] {
  const sums = new Array(7).fill(0);
  const counts = new Array(7).fill(0);

  sessions.forEach(s => {
    const scores = getDimensionScores(s);
    scores.forEach((ds, i) => {
      if (i < 7 && ds.score > 0) {
        sums[i] += ds.score;
        counts[i]++;
      }
    });
  });

  return dimensionLabels.map((dim, i) => ({
    dimension: dim,
    icon: dimensionIcons[i],
    avgScore: counts[i] > 0 ? Math.round(sums[i] / counts[i]) : 0,
    weight: dimensionWeights[i],
    sessionCount: counts[i],
  }));
}

// Risk indicators: % of players scoring 1-2 on critical dimensions (Debt, Safety)
export function computeRiskIndicators(sessions: Session[]): { dimension: string; icon: string; riskPercent: number; totalPlayers: number }[] {
  const criticalDimensions = [4, 6]; // Debt Awareness, Financial Safety
  
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
      dimension: dimensionLabels[dimIdx],
      icon: dimensionIcons[dimIdx],
      riskPercent: total > 0 ? Math.round((atRisk / total) * 100) : 0,
      totalPlayers: total,
    };
  });
}

// Archetype pairing analysis
export function computeArchetypePairings(sessions: Session[]): { pair: string; count: number }[] {
  const pairMap: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.primary_archetype && s.secondary_archetype) {
      const pair = `${s.primary_archetype} + ${s.secondary_archetype}`;
      pairMap[pair] = (pairMap[pair] || 0) + 1;
    }
  });
  return Object.entries(pairMap)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count);
}

// Dimension scores by age group (heatmap data)
export function computeDimensionByAgeGroup(sessions: Session[]): { dimension: string; icon: string; ageGroups: Record<string, number> }[] {
  const ageGroups = ['18-25', '26-39', '40-59', '60+'];
  const data: { sums: number[]; counts: number[] }[][] = dimensionLabels.map(() =>
    ageGroups.map(() => ({ sums: [0], counts: [0] }))
  );

  sessions.forEach(s => {
    const ageIdx = ageGroups.indexOf(s.player_age || '');
    if (ageIdx === -1) return;
    const scores = getDimensionScores(s);
    scores.forEach((ds, dimIdx) => {
      if (dimIdx < 7 && ds.score > 0) {
        data[dimIdx][ageIdx].sums[0] += ds.score;
        data[dimIdx][ageIdx].counts[0]++;
      }
    });
  });

  return dimensionLabels.map((dim, dimIdx) => {
    const ageGroupScores: Record<string, number> = {};
    ageGroups.forEach((ag, agIdx) => {
      const d = data[dimIdx][agIdx];
      ageGroupScores[ag] = d.counts[0] > 0 ? Math.round(d.sums[0] / d.counts[0]) : 0;
    });
    return { dimension: dim, icon: dimensionIcons[dimIdx], ageGroups: ageGroupScores };
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

// Geographic breakdown
export function computeStateDistribution(sessions: Session[]): { state: string; count: number }[] {
  const stateCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const st = s.player_state || 'Unknown';
    stateCounts[st] = (stateCounts[st] || 0) + 1;
  });
  return Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
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
