import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Session = Tables<'game_sessions'>;

const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageFilter, setAgeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase.from('game_sessions').select('*').order('created_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (ageFilter !== 'all' && s.player_age !== ageFilter) return false;
      if (bandFilter !== 'all' && s.band_level !== bandFilter) return false;
      if (dateFrom && new Date(s.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(s.created_at) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [sessions, ageFilter, bandFilter, dateFrom, dateTo]);

  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, s) => sum + (s.fq_score || 0), 0) / filtered.length)
    : 0;

  const bandDistribution = useMemo(() => {
    const bands: Record<string, number> = {};
    filtered.forEach(s => {
      const band = s.band_level || 'Unknown';
      bands[band] = (bands[band] || 0) + 1;
    });
    return Object.entries(bands).map(([name, count]) => ({ name, count }));
  }, [filtered]);

  const exportCSV = () => {
    const headers = ['Name', 'Age', 'Gender', 'Phone', 'State', 'District', 'Status', 'Income Type', 'FQ Score', 'Band', 'Primary Archetype', 'Secondary Archetype', 'Reflection', 'Date'];
    const rows = filtered.map(s => [
      s.player_name, s.player_age, s.player_gender, s.player_phone, s.player_state, s.player_district,
      s.player_status, s.player_income_type, s.fq_score, s.band_level, s.primary_archetype,
      s.secondary_archetype, s.reflection_answer, new Date(s.created_at).toLocaleString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-quest-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <Button onClick={exportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
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
      </div>

      {/* Chart */}
      {bandDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bandDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Age Group</label>
          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="18-25">18-25</SelectItem>
              <SelectItem value="26-39">26-39</SelectItem>
              <SelectItem value="40-59">40-59</SelectItem>
              <SelectItem value="60+">60+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Band</label>
          <Select value={bandFilter} onValueChange={setBandFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bands</SelectItem>
              <SelectItem value="Financial Beginner">Financial Beginner</SelectItem>
              <SelectItem value="Financial Explorer">Financial Explorer</SelectItem>
              <SelectItem value="Developing Money Skills">Developing Money Skills</SelectItem>
              <SelectItem value="Financially Smart">Financially Smart</SelectItem>
              <SelectItem value="Wealth Builder">Wealth Builder</SelectItem>
              <SelectItem value="Financial Master">Financial Master</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[160px]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[160px]" />
        </div>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>FQ Score</TableHead>
                <TableHead>Band</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 100).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.player_name}</TableCell>
                  <TableCell>{s.player_age}</TableCell>
                  <TableCell>{s.player_gender}</TableCell>
                  <TableCell>{s.fq_score}</TableCell>
                  <TableCell>{s.band_level}</TableCell>
                  <TableCell>{s.primary_archetype}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No sessions found
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

export default Dashboard;
