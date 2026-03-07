import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Trophy, TrendingUp, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tables } from '@/integrations/supabase/types';
import { computeScoreTrend, computeStateDistribution } from '@/utils/dashboardAnalytics';

type Session = Tables<'game_sessions'>;

interface Props {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

const DashboardOverview = ({ sessions, onSelectSession }: Props) => {
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

  const archetypeDistribution = useMemo(() => {
    const archs: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.primary_archetype) archs[s.primary_archetype] = (archs[s.primary_archetype] || 0) + 1;
    });
    return Object.entries(archs).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [sessions]);

  const scoreTrend = useMemo(() => computeScoreTrend(sessions), [sessions]);
  const stateData = useMemo(() => computeStateDistribution(sessions).slice(0, 10), [sessions]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Score Bands</p>
              <p className="text-2xl font-bold text-foreground">{bandDistribution.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">States</p>
              <p className="text-2xl font-bold text-foreground">{stateData.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bandDistribution.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Score Band Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bandDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {scoreTrend.length > 1 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Score Trend Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis domain={[0, 1000]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {archetypeDistribution.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Top Archetypes</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={archetypeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" fontSize={11} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {stateData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Top States</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" fontSize={11} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>State</TableHead>
                <TableHead>FQ Score</TableHead>
                <TableHead>Band</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.slice(0, 100).map(s => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-accent/50" onClick={() => onSelectSession(s)}>
                  <TableCell className="font-medium">{s.player_name}</TableCell>
                  <TableCell>{s.player_age}</TableCell>
                  <TableCell>{s.player_gender}</TableCell>
                  <TableCell>{s.player_state}</TableCell>
                  <TableCell>{s.fq_score}</TableCell>
                  <TableCell>{s.band_level}</TableCell>
                  <TableCell>{s.primary_archetype}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No sessions found</TableCell>
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
