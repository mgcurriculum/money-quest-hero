import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Activity, Calendar, Hash } from 'lucide-react';

interface UsageStats {
  todayChars: number;
  monthChars: number;
  totalRequests: number;
  recentLogs: any[];
}

const TTSUsageCard = () => {
  const [stats, setStats] = useState<UsageStats>({ todayChars: 0, monthChars: 0, totalRequests: 0, recentLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [todayRes, monthRes, totalRes, recentRes] = await Promise.all([
          supabase.from('tts_usage_logs').select('text_length').gte('created_at', todayStart),
          supabase.from('tts_usage_logs').select('text_length').gte('created_at', monthStart),
          supabase.from('tts_usage_logs').select('id', { count: 'exact', head: true }),
          supabase.from('tts_usage_logs').select('*').order('created_at', { ascending: false }).limit(20),
        ]);

        setStats({
          todayChars: (todayRes.data || []).reduce((sum, r) => sum + (r.text_length || 0), 0),
          monthChars: (monthRes.data || []).reduce((sum, r) => sum + (r.text_length || 0), 0),
          totalRequests: totalRes.count || 0,
          recentLogs: recentRes.data || [],
        });
      } catch (err) {
        console.error('Failed to load TTS usage:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusColor = (status: string) => {
    if (status === 'success') return 'default';
    if (status === 'quota_exceeded') return 'secondary';
    return 'destructive';
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <div>
            <CardTitle className="text-base">ElevenLabs Usage</CardTitle>
            <CardDescription>TTS API consumption tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Activity className="h-3 w-3" /> Today
            </div>
            <div className="text-lg font-semibold text-foreground">{stats.todayChars.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">characters</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" /> This Month
            </div>
            <div className="text-lg font-semibold text-foreground">{stats.monthChars.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">characters</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Hash className="h-3 w-3" /> All Time
            </div>
            <div className="text-lg font-semibold text-foreground">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">requests</div>
          </div>
        </div>

        {/* Recent logs */}
        {stats.recentLogs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Recent Requests</h4>
            <div className="max-h-64 overflow-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Characters</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">{log.text_length}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(log.status)} className="text-xs">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.error_message || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TTSUsageCard;
