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
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
  const [filterLevel, setFilterLevel] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const { toast } = useToast();

  // Form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formLevel, setFormLevel] = useState(0);
  const [formAgeGroups, setFormAgeGroups] = useState<string[]>([...AGE_GROUPS]);
  const [formOptions, setFormOptions] = useState<OptionItem[]>(Array(5).fill(null).map(emptyOption));
  const [formActive, setFormActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);

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
    setFormAgeGroups(filterAgeGroup !== 'all' ? [filterAgeGroup] : [...AGE_GROUPS]);
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

  const filteredQuestions = filterLevel === 'all' ? questions : questions.filter(q => q.level === Number(filterLevel));

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Questions</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-end">
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
      </div>

      {/* Questions by level */}
      {CATEGORIES.filter(c => filterLevel === 'all' || c.level === Number(filterLevel)).map(cat => {
        const levelQs = filteredQuestions.filter(q => q.level === cat.level);
        if (levelQs.length === 0 && filterLevel !== 'all') return null;
        return (
          <Card key={cat.level}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{cat.label}</span>
                <Badge variant="secondary">{levelQs.length} questions</Badge>
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
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(q.age_groups || []).map(ag => (
                        <Badge key={ag} variant="outline" className="text-xs">{ag}</Badge>
                      ))}
                      {q.category && <Badge variant="secondary" className="text-xs">{q.category}</Badge>}
                    </div>
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
