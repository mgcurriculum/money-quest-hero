import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import type { Tables } from '@/integrations/supabase/types';
import { computeQuestionStats } from '@/utils/dashboardAnalytics';

type Session = Tables<'game_sessions'>;

const scoreColor = (score: number) => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

const QuestionInsights = ({ sessions }: { sessions: Session[] }) => {
  const questionStats = useMemo(() => computeQuestionStats(sessions), [sessions]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');

  const selectedStat = useMemo(() => {
    if (!selectedQuestion) return null;
    return questionStats.find(q => q.question.substring(0, 60) === selectedQuestion) || null;
  }, [selectedQuestion, questionStats]);

  const distributionData = useMemo(() => {
    if (!selectedStat) return [];
    return Object.entries(selectedStat.distribution).map(([option, count]) => ({
      option: option.length > 30 ? option.substring(0, 30) + '…' : option,
      fullOption: option,
      count,
    }));
  }, [selectedStat]);

  return (
    <div className="space-y-6">
      {/* Question Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Explore a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a question to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {questionStats.map(q => (
                <SelectItem key={q.question.substring(0, 60)} value={q.question.substring(0, 60)}>
                  <span className="text-xs text-muted-foreground mr-2">L{q.level}</span>
                  {q.question.substring(0, 80)}{q.question.length > 80 ? '…' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStat && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">Responses: <strong className="text-foreground">{selectedStat.totalResponses}</strong></span>
                <span className="text-muted-foreground">Avg Score: <strong className={scoreColor(selectedStat.avgScore)}>{selectedStat.avgScore}/5</strong></span>
              </div>
              {distributionData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="option" fontSize={9} angle={-15} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => {
                        const pct = selectedStat ? ((value / selectedStat.totalResponses) * 100).toFixed(1) : '0';
                        return [`${value} (${pct}%)`, 'Responses'];
                      }}
                      labelFormatter={(label) => distributionData.find(d => d.option === label)?.fullOption || label}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} label={({ x, y, width, value }: any) => {
                      const pct = selectedStat ? ((value / selectedStat.totalResponses) * 100).toFixed(0) : '0';
                      return <text x={x + width / 2} y={y - 5} fill="hsl(var(--muted-foreground))" textAnchor="middle" fontSize={10}>{pct}%</text>;
                    }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Questions with Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Questions – Answer Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {questionStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No question data available yet.</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {questionStats.map((q, i) => {
                const distEntries = Object.entries(q.distribution).sort((a, b) => b[1] - a[1]);
                return (
                  <AccordionItem key={i} value={`q-${i}`}>
                    <AccordionTrigger className="text-left gap-2 py-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground shrink-0">L{q.level}</span>
                        <span className="text-sm truncate">{q.question.replace(/[🎬🎨🛍️⚡📞😨🎮🏛️🎰🕸️📱🎁]/g, '').trim()}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 mr-2">
                        <span className="text-xs text-muted-foreground">{q.totalResponses} resp</span>
                        <span className={`text-xs font-semibold ${scoreColor(q.avgScore)}`}>{q.avgScore}/5</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-6">
                        {distEntries.map(([option, count]) => {
                          const pct = q.totalResponses > 0 ? (count / q.totalResponses) * 100 : 0;
                          return (
                            <div key={option} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-foreground truncate max-w-[70%]">{option}</span>
                                <span className="text-muted-foreground font-medium">{pct.toFixed(0)}% ({count})</span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionInsights;
