import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Loader2, CalendarIcon } from 'lucide-react';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { dimensions, TOTAL_QUESTIONS } from '@/data/questions';
import { getEnrichedAnswers } from '@/utils/dashboardAnalytics';
import DashboardOverview from '@/components/admin/DashboardOverview';
import QuestionInsights from '@/components/admin/QuestionInsights';
import FinancialExpertView from '@/components/admin/FinancialExpertView';
import SessionDetailModal from '@/components/admin/SessionDetailModal';

type Session = Tables<'game_sessions'>;

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageFilter, setAgeFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchSessions();
    fetchCampaigns();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase.from('game_sessions').select('*').order('created_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const fetchCampaigns = async () => {
    const { data } = await supabase.from('campaigns').select('id, name');
    setCampaigns(data || []);
  };

  // Compute effective date range from preset
  const effectiveDateRange = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case 'today': return { from: startOfDay(now), to: now };
      case 'this_week': return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
      case 'this_month': return { from: startOfMonth(now), to: now };
      case 'this_year': return { from: startOfYear(now), to: now };
      case 'custom': return { from: dateFrom, to: dateTo };
      default: return { from: undefined, to: undefined };
    }
  }, [datePreset, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (ageFilter !== 'all' && s.player_age !== ageFilter) return false;
      if (bandFilter !== 'all' && s.band_level !== bandFilter) return false;
      if (campaignFilter !== 'all' && s.campaign_id !== campaignFilter) return false;
      const created = new Date(s.created_at);
      if (effectiveDateRange.from && created < effectiveDateRange.from) return false;
      if (effectiveDateRange.to && created > new Date(effectiveDateRange.to.getTime() + 86400000 - 1)) return false;
      return true;
    });
  }, [sessions, ageFilter, bandFilter, campaignFilter, effectiveDateRange]);

  const exportCSV = () => {
    // Build dynamic question headers
    const qHeaders: string[] = [];
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      qHeaders.push(`Q${i} Answer`, `Q${i} Score`);
    }
    const dimHeaders = dimensions.map(d => `${d} %`);

    const headers = [
      'Name', 'Age Group', 'Age (Exact)', 'Gender', 'Phone', 'Email',
      'Country', 'State', 'District', 'Status', 'Income Type', 'Profile Code',
      'FQ Score', 'Band', 'Primary Archetype', 'Secondary Archetype',
      ...dimHeaders,
      ...qHeaders,
      'Reflection', 'Campaign ID', 'Date',
    ];

    const rows = filtered.map(s => {
      const enriched = getEnrichedAnswers(s);
      const detailed = enriched.detailed || [];
      const dimScores = enriched.dimensionScores || [];

      // Map dimension scores by name
      const dimMap: Record<string, number> = {};
      dimScores.forEach(ds => { dimMap[ds.dimension] = ds.percentage; });
      const dimValues = dimensions.map(d => dimMap[d] ?? '');

      // Map question answers by question number
      const qValues: (string | number)[] = [];
      for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const q = detailed.find(d => d.questionNo === i);
        qValues.push(q?.selectedOption ?? '', q?.score ?? '');
      }

      return [
        s.player_name, s.player_age, s.player_age_number ?? '', s.player_gender, s.player_phone, s.player_email,
        s.player_country, s.player_state, s.player_district, s.player_status, s.player_income_type, s.profile_code,
        s.fq_score, s.band_level, s.primary_archetype, s.secondary_archetype,
        ...dimValues,
        ...qValues,
        s.reflection_answer, s.campaign_id, new Date(s.created_at).toLocaleString(),
      ];
    });

    const escapeCsv = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
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
        <Button onClick={exportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" /> Export CSV ({filtered.length})
        </Button>
      </div>

      {/* Filters */}
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
        {campaigns.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground">Campaign</label>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Date Range</label>
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {datePreset === 'custom' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PP') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PP') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
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
