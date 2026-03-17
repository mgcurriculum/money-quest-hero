import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/integrations/supabase/types';
import { getDetailedAnswers, getDimensionScores } from '@/utils/dashboardAnalytics';
import { MAX_SCORE_PER_QUESTION } from '@/data/questions';
import { MAX_SCORE } from '@/data/questions';

type Session = Tables<'game_sessions'>;

interface Props {
  session: Session | null;
  open: boolean;
  onClose: () => void;
}

const SessionDetailModal = ({ session, open, onClose }: Props) => {
  if (!session) return null;

  const detailed = getDetailedAnswers(session);
  const dimensionScores = getDimensionScores(session);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{session.player_name}'s Session</DialogTitle>
          <DialogDescription>
            {new Date(session.created_at).toLocaleString()} · Score: {session.fq_score}/{MAX_SCORE} · {session.band_level}
            {(session as any).profile_code && ` · Profile: ${(session as any).profile_code}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          {session.player_age && <Badge variant="outline">Age: {session.player_age}</Badge>}
          {session.player_gender && <Badge variant="outline">{session.player_gender}</Badge>}
          {session.player_status && <Badge variant="outline">Role: {session.player_status}</Badge>}
          {(session as any).profile_code && <Badge>Profile: {(session as any).profile_code}</Badge>}
        </div>

        {dimensionScores.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Dimension Scores</h4>
            <div className="grid grid-cols-2 gap-2">
              {dimensionScores.map((ds, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs w-32 truncate">{ds.dimension}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${ds.score < 40 ? 'bg-destructive' : ds.score < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${ds.score}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right">{ds.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {detailed.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold mb-2">Question-by-Question Breakdown</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right w-16">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailed.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{d.questionNo || i + 1}</TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <span className="text-muted-foreground">{d.dimension}:</span> {d.question.substring(0, 80)}
                    </TableCell>
                    <TableCell className="text-xs">{d.selectedOption}</TableCell>
                    <TableCell className={`text-right text-xs font-semibold ${d.score <= 20 ? 'text-destructive' : d.score >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {d.score}/{MAX_SCORE_PER_QUESTION}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Detailed Q&A data not available for this session.</p>
        )}

        {session.reflection_answer && (
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Reflection Answer</p>
            <p className="text-sm">{session.reflection_answer}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailModal;
