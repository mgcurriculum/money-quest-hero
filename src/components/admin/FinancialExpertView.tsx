import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Target } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { computeDimensionAverages, computeRiskIndicators } from '@/utils/dashboardAnalytics';

type Session = Tables<'game_sessions'>;

const dimColor = (score: number) => {
  if (score < 40) return 'bg-red-100 text-red-800 border-red-200';
  if (score < 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const FinancialExpertView = ({ sessions }: { sessions: Session[] }) => {
  const dimensionAvgs = useMemo(() => computeDimensionAverages(sessions), [sessions]);
  const riskIndicators = useMemo(() => computeRiskIndicators(sessions), [sessions]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" /> Dimension Health (Population Averages)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <p className="text-[10px] mt-1 opacity-70">{d.sessionCount} responses</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
    </div>
  );
};

export default FinancialExpertView;
