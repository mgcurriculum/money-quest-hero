import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
                    <Tooltip formatter={(value: number) => [value, 'Responses']} labelFormatter={(label) => distributionData.find(d => d.option === label)?.fullOption || label} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Questions Ranked */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions Ranked by Average Score (Weakest First)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="text-right">Responses</TableHead>
                <TableHead className="text-right">Avg Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionStats.map((q, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">L{q.level}</TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{q.question.replace(/[🎬🎨🛍️⚡📞😨🎮🏛️🎰🕸️📱🎁]/g, '').trim()}</TableCell>
                  <TableCell className="text-right text-sm">{q.totalResponses}</TableCell>
                  <TableCell className={`text-right text-sm font-semibold ${scoreColor(q.avgScore)}`}>{q.avgScore}</TableCell>
                </TableRow>
              ))}
              {questionStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No question data available yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionInsights;
