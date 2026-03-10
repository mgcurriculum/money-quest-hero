import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Download, Upload } from 'lucide-react';
import { exportQuestionsToCsv, parseCsvToQuestions, downloadCsv } from '@/utils/questionsCsv';
import { getAllProfileCodes, getProfileLabel, dimensions } from '@/data/questions';

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

const PROFILE_CODES = getAllProfileCodes();

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(PROFILE_CODES[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
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
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchQuestions(); }, [selectedProfile]);

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
    setSaving(false); setDialogOpen(false); fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    toast({ title: 'Question deleted' }); fetchQuestions();
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
      try {
        const text = await file.text();
        const parsed = parseCsvToQuestions(text, selectedProfile);
        if (parsed.length === 0) {
          toast({ title: 'Import failed', description: 'No valid questions found.', variant: 'destructive' });
          setImporting(false); return;
        }
        const rows = parsed.map(q => ({
          profile_code: q.profile_code || selectedProfile,
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
        }));
        const { error } = await supabase.from('questions').insert(rows as any);
        if (error) toast({ title: 'Import error', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Imported', description: `${rows.length} questions imported.` }); fetchQuestions(); }
      } catch { toast({ title: 'Import failed', description: 'Could not read CSV file.', variant: 'destructive' }); }
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
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
        </div>
      </div>

      {/* Profile Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="shrink-0">Profile Code</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger className="w-[300px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROFILE_CODES.map(code => (
                  <SelectItem key={code} value={code}>{code} — {getProfileLabel(code)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{questions.length} / 18 questions</Badge>
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Question' : 'New Question'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Question No</Label>
                <Input type="number" min={1} max={18} value={formQuestionNo} onChange={e => setFormQuestionNo(Number(e.target.value))} />
              </div>
              <div>
                <Label>Dimension</Label>
                <Select value={formDimension} onValueChange={setFormDimension}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {dimensions.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label><Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Part-time Work" /></div>
            </div>
            <div><Label>Question Text</Label><Textarea value={formText} onChange={e => setFormText(e.target.value)} rows={3} /></div>
            <div>
              <Label>Options & Scores</Label>
              <div className="space-y-2 mt-1">
                {formOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <Input value={opt} onChange={e => {
                      const next = [...formOptions]; next[idx] = e.target.value; setFormOptions(next);
                    }} placeholder={`Option ${idx + 1}`} className="flex-1" />
                    <Input type="number" value={formScores[idx]} onChange={e => {
                      const next = [...formScores]; next[idx] = Number(e.target.value); setFormScores(next);
                    }} className="w-20" min={0} max={50} step={10} />
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questions;
