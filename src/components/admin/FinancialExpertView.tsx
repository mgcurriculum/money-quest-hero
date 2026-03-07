import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Target } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import {
  computeDimensionAverages,
  computeRiskIndicators,
  computeArchetypePairings,
  computeReflectionSummary,
  computeDimensionByAgeGroup,
} from '@/utils/dashboardAnalytics';

type Session = Tables<'game_sessions'>;

const dimColor = (score: number) => {
  if (score < 40) return 'bg-red-100 text-red-800 border-red-200';
  if (score < 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const FinancialExpertView = ({ sessions }: { sessions: Session[] }) => {
  const dimensionAvgs = useMemo(() => computeDimensionAverages(sessions), [sessions]);
  const riskIndicators = useMemo(() => computeRiskIndicators(sessions), [sessions]);
  const archetypePairs = useMemo(() => computeArchetypePairings(sessions).slice(0, 10), [sessions]);
  const reflectionSummary = useMemo(() => computeReflectionSummary(sessions), [sessions]);
  const heatmapData = useMemo(() => computeDimensionByAgeGroup(sessions), [sessions]);

  // Find weakest dimensions per age group
  const weakestByAge = useMemo(() => {
    const ageGroups = ['18-25', '26-39', '40-59', '60+'];
    return ageGroups.map(ag => {
      const scores = heatmapData
        .map(d => ({ dimension: `${d.icon} ${d.dimension}`, score: d.ageGroups[ag] }))
        .filter(d => d.score > 0)
        .sort((a, b) => a.score - b.score);
      return { ageGroup: ag, weakest: scores.slice(0, 2) };
    }).filter(a => a.weakest.length > 0);
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      {/* Dimension Health Cards */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" /> Dimension Health (Population Averages)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dimensionAvgs.map(d => (
            <Card key={d.dimension} className={`border ${dimColor(d.avgScore)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{d.icon} {d.dimension}</span>
                  <span className="text-lg font-bold">{d.avgScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                  <div className="h-full rounded-full bg-current opacity-40" style={{ width: `${d.avgScore}%` }} />
                </div>
                <p className="text-[10px] mt-1 opacity-70">Weight: {(d.weight * 100).toFixed(0)}% · {d.sessionCount} responses</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskIndicators.map(r => (
              <div key={r.dimension} className="flex items-center justify-between">
                <span className="text-sm">{r.icon} {r.dimension}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-destructive" style={{ width: `${r.riskPercent}%` }} />
                  </div>
                  <span className={`text-sm font-semibold ${r.riskPercent > 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {r.riskPercent}%
                  </span>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground">% of players scoring below 40% on critical dimensions</p>
          </CardContent>
        </Card>

        {/* Weakest Areas by Age */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Weakest Areas by Age Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Age</TableHead>
                  <TableHead>Weakest Dimension</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weakestByAge.map(a => (
                  a.weakest.map((w, i) => (
                    <TableRow key={`${a.ageGroup}-${i}`}>
                      {i === 0 && <TableCell rowSpan={a.weakest.length} className="font-medium text-sm">{a.ageGroup}</TableCell>}
                      <TableCell className="text-sm">{w.dimension}</TableCell>
                      <TableCell className={`text-right text-sm font-semibold ${w.score < 40 ? 'text-destructive' : 'text-yellow-600'}`}>{w.score}%</TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Archetype Pairings & Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archetypePairs.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Top Archetype Pairings</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={archetypePairs} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="pair" type="category" fontSize={10} width={180} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {reflectionSummary.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Reflection Answers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reflectionSummary.map(r => (
                  <div key={r.option} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{r.option}</span>
                        <span className="text-xs text-muted-foreground">{r.count} ({r.percent}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${r.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinancialExpertView;
