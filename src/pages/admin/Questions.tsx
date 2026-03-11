import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { exportQuestionsToCsv, parseCsvToQuestions, downloadCsv } from '@/utils/questionsCsv';
import { getAllProfileCodes, getProfileLabel, getProfileNumber, dimensions } from '@/data/questions';
import QuestionEditDialog from '@/components/admin/QuestionEditDialog';
import ImportSummaryDialog from '@/components/admin/ImportSummaryDialog';
import GoogleSheetImportDialog from '@/components/admin/GoogleSheetImportDialog';

interface Question {
  id: string;
  profile_code: string;
  question_no: number;
  dimension: string | null;
  category: string;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  option_5: string;
  score_1: number;
  score_2: number;
  score_3: number;
  score_4: number;
  score_5: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImportSummary {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
  skippedProfiles: string[];
  totalParsed: number;
}

const PROFILE_CODES = getAllProfileCodes();

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(PROFILE_CODES[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [clearAllConfirmText, setClearAllConfirmText] = useState('');
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [gsheetOpen, setGsheetOpen] = useState(false);
  const [profileCounts, setProfileCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDimension, setFormDimension] = useState('');
  const [formQuestionNo, setFormQuestionNo] = useState(1);
  const [formOptions, setFormOptions] = useState(['', '', '', '', '']);
  const [formScores, setFormScores] = useState([10, 20, 30, 40, 50]);
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchQuestions(); }, [selectedProfile]);
  useEffect(() => { fetchProfileCounts(); }, []);

  const fetchProfileCounts = async () => {
    const { data } = await supabase
      .from('questions')
      .select('profile_code');
    const counts: Record<string, number> = {};
    PROFILE_CODES.forEach(c => counts[c] = 0);
    (data || []).forEach((row: any) => {
      if (counts[row.profile_code] !== undefined) counts[row.profile_code]++;
    });
    setProfileCounts(counts);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('profile_code', selectedProfile)
      .order('question_no');
    setQuestions((data as any as Question[]) || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFormText(''); setFormCategory(''); setFormDimension('');
    setFormQuestionNo(questions.length + 1);
    setFormOptions(['', '', '', '', '']);
    setFormScores([10, 20, 30, 40, 50]);
    setFormActive(true);
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setFormText(q.question_text);
    setFormCategory(q.category);
    setFormDimension(q.dimension || '');
    setFormQuestionNo(q.question_no);
    setFormOptions([q.option_1, q.option_2, q.option_3, q.option_4, q.option_5]);
    setFormScores([q.score_1, q.score_2, q.score_3, q.score_4, q.score_5]);
    setFormActive(q.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formText.trim()) {
      toast({ title: 'Validation Error', description: 'Question text is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      profile_code: selectedProfile,
      question_no: formQuestionNo,
      dimension: formDimension || null,
      category: formCategory.trim(),
      question_text: formText.trim(),
      option_1: formOptions[0].trim(),
      option_2: formOptions[1].trim(),
      option_3: formOptions[2].trim(),
      option_4: formOptions[3].trim(),
      option_5: formOptions[4].trim(),
      score_1: formScores[0],
      score_2: formScores[1],
      score_3: formScores[2],
      score_4: formScores[3],
      score_5: formScores[4],
      is_active: formActive,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      const { error } = await supabase.from('questions').update(payload).eq('id', editing.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Question updated' });
    } else {
      const { error } = await supabase.from('questions').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Question created' });
    }
    setSaving(false); setDialogOpen(false); fetchQuestions(); fetchProfileCounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    toast({ title: 'Question deleted' }); fetchQuestions(); fetchProfileCounts();
  };

  const openClearConfirm = () => {
    setClearConfirmText('');
    setClearConfirmOpen(true);
  };

  const handleClearAll = async () => {
    if (clearConfirmText !== 'clear') return;
    setClearConfirmOpen(false);
    setClearing(true);
    const { error } = await supabase.from('questions').delete().eq('profile_code', selectedProfile);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Cleared', description: `All questions for ${selectedProfile} deleted.` });
    setClearing(false);
    fetchQuestions(); fetchProfileCounts();
  };

  const toggleActive = async (q: Question) => {
    await supabase.from('questions').update({ is_active: !q.is_active, updated_at: new Date().toISOString() } as any).eq('id', q.id);
    fetchQuestions();
  };

  const handleExport = () => {
    if (questions.length === 0) {
      toast({ title: 'No questions', description: `No questions for ${selectedProfile}.`, variant: 'destructive' });
      return;
    }
    const csv = exportQuestionsToCsv(questions as any);
    downloadCsv(csv, `questions-${selectedProfile}.csv`);
    toast({ title: 'Exported', description: `${questions.length} questions exported.` });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      const summary: ImportSummary = { created: 0, updated: 0, errors: [], skippedProfiles: [], totalParsed: 0 };

      try {
        const text = await file.text();
        const parsed = parseCsvToQuestions(text, selectedProfile);
        summary.totalParsed = parsed.length;

        if (parsed.length === 0) {
          toast({ title: 'Import failed', description: 'No valid questions found in CSV.', variant: 'destructive' });
          setImporting(false); return;
        }

        // Separate valid profile rows from invalid/skipped ones
        const validProfileSet = new Set(PROFILE_CODES);
        const validRows: typeof parsed = [];
        const skippedProfileSet = new Set<string>();

        for (const q of parsed) {
          const pc = q.profile_code || selectedProfile;
          if (validProfileSet.has(pc)) {
            validRows.push({ ...q, profile_code: pc });
          } else {
            skippedProfileSet.add(pc);
          }
        }
        summary.skippedProfiles = Array.from(skippedProfileSet);

        if (validRows.length === 0) {
          summary.errors.push({ row: 0, message: 'No rows matched a valid profile code.' });
          setImportSummary(summary);
          setImporting(false);
          return;
        }

        // Fetch existing questions for relevant profiles to detect updates
        const profileCodes = [...new Set(validRows.map(r => r.profile_code))];
        const { data: existingData } = await supabase
          .from('questions')
          .select('id, profile_code, question_no')
          .in('profile_code', profileCodes);
        const existingMap = new Map<string, string>();
        (existingData || []).forEach((eq: any) => {
          existingMap.set(`${eq.profile_code}_${eq.question_no}`, eq.id);
        });

        // Process each row: upsert (update if exists, insert if new)
        for (let i = 0; i < validRows.length; i++) {
          const q = validRows[i];
          const row = {
            profile_code: q.profile_code,
            question_no: q.question_no,
            dimension: q.dimension || null,
            category: q.category,
            question_text: q.question_text,
            option_1: q.option_1,
            option_2: q.option_2,
            option_3: q.option_3,
            option_4: q.option_4,
            option_5: q.option_5,
            score_1: q.score_1,
            score_2: q.score_2,
            score_3: q.score_3,
            score_4: q.score_4,
            score_5: q.score_5,
            is_active: q.is_active,
            updated_at: new Date().toISOString(),
          };

          const existingId = existingMap.get(`${q.profile_code}_${q.question_no}`);
          if (existingId) {
            const { error } = await supabase.from('questions').update(row as any).eq('id', existingId);
            if (error) summary.errors.push({ row: i + 2, message: error.message });
            else summary.updated++;
          } else {
            const { error } = await supabase.from('questions').insert(row as any);
            if (error) summary.errors.push({ row: i + 2, message: error.message });
            else summary.created++;
          }
        }

        setImportSummary(summary);
        fetchQuestions();
      } catch {
        toast({ title: 'Import failed', description: 'Could not read CSV file.', variant: 'destructive' });
      }
      setImporting(false);
    };
    input.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-foreground">Questions</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button variant="outline" size="sm" onClick={handleImport} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setGsheetOpen(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />Google Sheets
          </Button>
          <Button variant="destructive" size="sm" onClick={() => { setClearAllConfirmText(''); setClearAllConfirmOpen(true); }}>
            <Trash2 className="h-4 w-4 mr-2" />Clear All Questions
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
        </div>
      </div>

      {/* Profile Overview Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profile Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {PROFILE_CODES.map(code => {
              const num = getProfileNumber(code);
              const count = profileCounts[code] ?? 0;
              const isSelected = code === selectedProfile;
              const statusClass = count === 18
                ? 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
                : count > 0
                  ? 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800'
                  : 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
              return (
                <button
                  key={code}
                  onClick={() => setSelectedProfile(code)}
                  className={`flex items-center gap-2 p-2 rounded-md border text-left text-xs transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-muted-foreground/30'}`}
                >
                  <span className="font-mono font-bold text-muted-foreground w-5 shrink-0">#{num}</span>
                  <span className="flex-1 truncate font-medium text-foreground">{code}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusClass}`}>
                    {count === 18 ? '✓ 18/18' : count > 0 ? `⚠ ${count}/18` : '✗ 0/18'}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Label className="shrink-0">Profile Code</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger className="w-[340px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROFILE_CODES.map(code => (
                  <SelectItem key={code} value={code}>#{getProfileNumber(code)} {code} — {getProfileLabel(code)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{questions.length} / 18 questions</Badge>
            {questions.length > 0 && (
              <Button variant="destructive" size="sm" onClick={openClearConfirm} disabled={clearing}>
                {clearing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{getProfileLabel(selectedProfile)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
              <span className="text-sm text-muted-foreground font-mono w-6 shrink-0">Q{q.question_no}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${q.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{q.question_text}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {q.dimension && <Badge variant="secondary" className="text-xs">{q.dimension}</Badge>}
                  {q.category && <Badge variant="outline" className="text-xs">{q.category}</Badge>}
                </div>
                <div className="mt-2 space-y-1">
                  {[q.option_1, q.option_2, q.option_3, q.option_4, q.option_5].map((opt, i) => (
                    opt && <div key={i} className="text-xs text-muted-foreground flex justify-between">
                      <span>{i + 1}. {opt}</span>
                      <span className="font-mono text-primary">{[q.score_1, q.score_2, q.score_3, q.score_4, q.score_5][i]}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={q.is_active} onCheckedChange={() => toggleActive(q)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No questions for this profile. Add or import questions.</p>
          )}
        </CardContent>
      </Card>

      {/* Question Edit/Create Dialog */}
      <QuestionEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={!!editing}
        formText={formText}
        setFormText={setFormText}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formDimension={formDimension}
        setFormDimension={setFormDimension}
        formQuestionNo={formQuestionNo}
        setFormQuestionNo={setFormQuestionNo}
        formOptions={formOptions}
        setFormOptions={setFormOptions}
        formScores={formScores}
        setFormScores={setFormScores}
        formActive={formActive}
        setFormActive={setFormActive}
        saving={saving}
        onSave={handleSave}
      />

      {/* Import Summary Dialog */}
      <ImportSummaryDialog
        summary={importSummary}
        onClose={() => setImportSummary(null)}
      />

      {/* Google Sheets Import Dialog */}
      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear All Questions
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>This will permanently delete all <strong>{questions.length}</strong> questions for profile <strong>{selectedProfile}</strong>. This action cannot be undone.</p>
              <div>
                <Label htmlFor="clear-confirm" className="text-sm text-muted-foreground">Type <strong>clear</strong> to confirm</Label>
                <Input
                  id="clear-confirm"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="Type clear"
                  className="mt-1"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearConfirmText !== 'clear'}
            >
              Clear All
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GoogleSheetImportDialog
        open={gsheetOpen}
        onOpenChange={setGsheetOpen}
        onImportComplete={(summary) => {
          setImportSummary(summary);
          fetchQuestions(); fetchProfileCounts();
        }}
      />

      {/* Clear All Questions (all profiles) Confirmation Dialog */}
      <AlertDialog open={clearAllConfirmOpen} onOpenChange={setClearAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear All Questions (All Profiles)
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>This will permanently delete <strong>all questions across all 19 profiles</strong>. This action cannot be undone.</p>
              <div>
                <Label htmlFor="clear-all-confirm" className="text-sm text-muted-foreground">Type <strong>clear all</strong> to confirm</Label>
                <Input
                  id="clear-all-confirm"
                  value={clearAllConfirmText}
                  onChange={(e) => setClearAllConfirmText(e.target.value)}
                  placeholder="Type clear all"
                  className="mt-1"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                if (clearAllConfirmText !== 'clear all') return;
                setClearAllConfirmOpen(false);
                setClearing(true);
                const { error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
                else toast({ title: 'Cleared', description: 'All questions across all profiles deleted.' });
                setClearing(false);
                fetchQuestions(); fetchProfileCounts();
              }}
              disabled={clearAllConfirmText !== 'clear all'}
            >
              Clear All
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Questions;
