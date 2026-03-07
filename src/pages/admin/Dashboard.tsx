import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import DashboardOverview from '@/components/admin/DashboardOverview';
import QuestionInsights from '@/components/admin/QuestionInsights';
import FinancialExpertView from '@/components/admin/FinancialExpertView';
import SessionDetailModal from '@/components/admin/SessionDetailModal';

type Session = Tables<'game_sessions'>;

const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageFilter, setAgeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [incomeFilter, setIncomeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => { fetchSessions(); }, []);

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
      if (genderFilter !== 'all' && s.player_gender !== genderFilter) return false;
      if (stateFilter !== 'all' && s.player_state !== stateFilter) return false;
      if (statusFilter !== 'all' && s.player_status !== statusFilter) return false;
      if (incomeFilter !== 'all' && s.player_income_type !== incomeFilter) return false;
      if (dateFrom && new Date(s.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(s.created_at) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [sessions, ageFilter, bandFilter, genderFilter, stateFilter, statusFilter, incomeFilter, dateFrom, dateTo]);

  // Unique values for filters
  const uniqueStates = useMemo(() => [...new Set(sessions.map(s => s.player_state).filter(Boolean))].sort(), [sessions]);
  const uniqueGenders = useMemo(() => [...new Set(sessions.map(s => s.player_gender).filter(Boolean))], [sessions]);
  const uniqueStatuses = useMemo(() => [...new Set(sessions.map(s => s.player_status).filter(Boolean))], [sessions]);
  const uniqueIncomes = useMemo(() => [...new Set(sessions.map(s => s.player_income_type).filter(Boolean))], [sessions]);

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

      {/* Global Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Age Group</label>
          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
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
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
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
          <label className="text-xs text-muted-foreground">Gender</label>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueGenders.map(g => <SelectItem key={g} value={g!}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">State</label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {uniqueStates.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueStatuses.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Income</label>
          <Select value={incomeFilter} onValueChange={setIncomeFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueIncomes.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[140px]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[140px]" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Insights</TabsTrigger>
          <TabsTrigger value="expert">Financial Expert</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview sessions={filtered} onSelectSession={setSelectedSession} />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionInsights sessions={filtered} />
        </TabsContent>

        <TabsContent value="expert">
          <FinancialExpertView sessions={filtered} />
        </TabsContent>
      </Tabs>

      <SessionDetailModal session={selectedSession} open={!!selectedSession} onClose={() => setSelectedSession(null)} />
    </div>
  );
};

export default Dashboard;
