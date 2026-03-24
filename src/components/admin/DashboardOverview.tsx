import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Trophy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tables } from '@/integrations/supabase/types';
import { MAX_SCORE } from '@/data/questions';

type Session = Tables<'game_sessions'>;

interface Props {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  campaigns?: { id: string; name: string }[];
}

const DashboardOverview = ({ sessions, onSelectSession, campaigns = [] }: Props) => {
  const campaignMap = useMemo(() => {
    const map: Record<string, string> = {};
    campaigns.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [campaigns]);
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.fq_score || 0), 0) / sessions.length)
    : 0;

  const bandDistribution = useMemo(() => {
    const bands: Record<string, number> = {};
    sessions.forEach(s => {
      const band = s.band_level || 'Unknown';
      bands[band] = (bands[band] || 0) + 1;
    });
    return Object.entries(bands).map(([name, count]) => ({ name, count }));
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Average FQ Score</p>
              <p className="text-2xl font-bold text-foreground">{avgScore}/{MAX_SCORE}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {bandDistribution.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Score Band Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bandDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-15} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Sessions ({sessions.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>FQ Score</TableHead>
                <TableHead>Band</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 100).map(s => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-accent/50" onClick={() => onSelectSession(s)}>
                  <TableCell className="font-medium">{s.player_name}</TableCell>
                  <TableCell>{s.player_age}</TableCell>
                  <TableCell>{(s as any).profile_code || '-'}</TableCell>
                  <TableCell>{s.fq_score}/{MAX_SCORE}</TableCell>
                  <TableCell>{s.band_level}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No sessions found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
