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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Download, Upload } from 'lucide-react';
import { exportQuestionsToCsv, parseCsvToQuestions, downloadCsv } from '@/utils/questionsCsv';
import type { Tables } from '@/integrations/supabase/types';

type Question = Tables<'questions'>;

interface OptionItem {
  text: string;
  emoji: string;
}

const AGE_GROUPS = ['18-25', '26-39', '40-59', '60+'];
const CATEGORIES = [
  { level: 0, label: 'Level 0 — Reality Check' },
  { level: 1, label: 'Level 1 — Earning Quest' },
  { level: 2, label: 'Level 2 — Spending Challenge' },
  { level: 3, label: 'Level 3 — Saving Mission' },
  { level: 4, label: 'Level 4 — Debt Trap' },
  { level: 5, label: 'Level 5 — Investment World' },
  { level: 6, label: 'Level 6 — Protection Shield' },
];

const emptyOption = (): OptionItem => ({ text: '', emoji: '' });

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(AGE_GROUPS[0]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const { toast } = useToast();

  // Form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formLevel, setFormLevel] = useState(0);
  const [formAgeGroups, setFormAgeGroups] = useState<string[]>([]);
  const [formOptions, setFormOptions] = useState<OptionItem[]>(Array(5).fill(null).map(emptyOption));
  const [formActive, setFormActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase.from('questions').select('*').order('level').order('sort_order');
    setQuestions(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFormText('');
    setFormCategory('');
    setFormLevel(0);
    setFormAgeGroups([activeTab]);
    setFormOptions(Array(5).fill(null).map(emptyOption));
    setFormActive(true);
    setFormOrder(0);
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setFormText(q.question_text);
    setFormCategory(q.category);
    setFormLevel(q.level);
    setFormAgeGroups([...(q.age_groups || AGE_GROUPS)]);
    const opts = (q.options as any as OptionItem[]) || [];
    setFormOptions([...opts, ...Array(Math.max(0, 5 - opts.length)).fill(null).map(emptyOption)]);
    setFormActive(q.is_active);
    setFormOrder(q.sort_order);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validOptions = formOptions.filter(o => o.text.trim());
    if (!formText.trim() || validOptions.length < 2) {
      toast({ title: 'Validation Error', description: 'Question text and at least 2 options required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      question_text: formText.trim(),
      category: formCategory.trim(),
      level: formLevel,
      age_groups: formAgeGroups,
      options: validOptions as any,
      is_active: formActive,
      sort_order: formOrder,
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
    setSaving(false);
    setDialogOpen(false);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    toast({ title: 'Question deleted' });
    fetchQuestions();
  };

  const toggleActive = async (q: Question) => {
    await supabase.from('questions').update({ is_active: !q.is_active, updated_at: new Date().toISOString() }).eq('id', q.id);
    fetchQuestions();
  };

  const toggleAgeGroup = (group: string) => {
    setFormAgeGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const updateOption = (idx: number, field: keyof OptionItem, value: string) => {
    setFormOptions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const getFilteredQuestions = (ageGroup: string) => {
    return questions.filter(q => {
      if (!(q.age_groups || []).includes(ageGroup)) return false;
      if (filterLevel !== 'all' && q.level !== Number(filterLevel)) return false;
      return true;
    });
  };

  const handleExport = () => {
    const filtered = getFilteredQuestions(activeTab);
    if (filtered.length === 0) {
      toast({ title: 'No questions to export', description: `No questions found for age group ${activeTab}.`, variant: 'destructive' });
      return;
    }
    const csv = exportQuestionsToCsv(filtered.map(q => ({
      ...q,
      options: (q.options as any) || [],
    })));
    downloadCsv(csv, `questions-${activeTab}.csv`);
    toast({ title: 'Exported', description: `${filtered.length} questions exported for ${activeTab}.` });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const text = await file.text();
        const parsed = parseCsvToQuestions(text);
        if (parsed.length === 0) {
          toast({ title: 'Import failed', description: 'No valid questions found in CSV.', variant: 'destructive' });
          setImporting(false);
          return;
        }
        const rows = parsed.map(q => ({
          question_text: q.question_text,
          category: q.category,
          level: q.level,
          age_groups: q.age_groups.length > 0 ? q.age_groups : [activeTab],
          options: q.options as any,
          is_active: q.is_active,
          sort_order: q.sort_order,
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('questions').insert(rows);
        if (error) {
          toast({ title: 'Import error', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Imported', description: `${rows.length} questions imported successfully.` });
          fetchQuestions();
        }
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

  const renderQuestionList = (ageGroup: string) => {
    const filtered = getFilteredQuestions(ageGroup);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground">Filter by Level</label>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.level} value={String(c.level)}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
        </div>

        {CATEGORIES.filter(c => filterLevel === 'all' || c.level === Number(filterLevel)).map(cat => {
          const levelQs = filtered.filter(q => q.level === cat.level);
          if (levelQs.length === 0 && filterLevel !== 'all') return null;
          return (
            <Card key={cat.level}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{cat.label}</span>
                  <Badge variant="secondary">{levelQs.length} question{levelQs.length !== 1 ? 's' : ''}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {levelQs.map((q, idx) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                    <span className="text-sm text-muted-foreground font-mono w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${q.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                        {q.question_text}
                      </p>
                      {q.category && (
                        <Badge variant="secondary" className="text-xs mt-1">{q.category}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={q.is_active} onCheckedChange={() => toggleActive(q)} />
                      <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {levelQs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No questions in this level</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Questions</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {AGE_GROUPS.map(ag => (
            <TabsTrigger key={ag} value={ag}>
              {ag} <Badge variant="outline" className="ml-2 text-xs">{questions.filter(q => (q.age_groups || []).includes(ag)).length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {AGE_GROUPS.map(ag => (
          <TabsContent key={ag} value={ag}>
            {renderQuestionList(ag)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Question' : 'New Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={String(formLevel)} onValueChange={v => setFormLevel(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.level} value={String(c.level)}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Real Income Level" />
              </div>
            </div>

            <div>
              <Label>Question Text</Label>
              <Textarea value={formText} onChange={e => setFormText(e.target.value)} rows={3} />
            </div>

            <div>
              <Label>Age Groups</Label>
              <div className="flex gap-4 mt-1">
                {AGE_GROUPS.map(ag => (
                  <label key={ag} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={formAgeGroups.includes(ag)} onCheckedChange={() => toggleAgeGroup(ag)} />
                    {ag}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Options (score 1–5, top to bottom)</Label>
              <div className="space-y-2 mt-1">
                {formOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <Input
                      value={opt.text}
                      onChange={e => updateOption(idx, 'text', e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                    <Input
                      value={opt.emoji}
                      onChange={e => updateOption(idx, 'emoji', e.target.value)}
                      placeholder="🎯"
                      className="w-16"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={formOrder} onChange={e => setFormOrder(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questions;
