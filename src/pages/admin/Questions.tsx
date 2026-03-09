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

interface ProfileOption {
  id: string;
  type: string;
  label: string;
  value: string;
  age_groups: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AGE_GROUPS = ['18-25', '26-39', '40-59', '60+'];
const CATEGORIES = [
  { level: 0, label: 'Level 0 — Financial Reality' },
  { level: 1, label: 'Level 1 — Earning Mindset' },
  { level: 2, label: 'Level 2 — Spending Discipline' },
  { level: 3, label: 'Level 3 — Saving Behaviour' },
  { level: 4, label: 'Level 4 — Debt Awareness' },
  { level: 5, label: 'Level 5 — Investment Awareness' },
  { level: 6, label: 'Level 6 — Financial Safety' },
];
const DIMENSIONS = [
  'Financial Reality', 'Earning Mindset', 'Spending Discipline',
  'Saving Behaviour', 'Debt Awareness', 'Investment Awareness', 'Financial Safety',
];

const emptyOption = (): OptionItem => ({ text: '', emoji: '' });

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(AGE_GROUPS[0]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const { toast } = useToast();

  // Main section toggle
  const [mainSection, setMainSection] = useState<'questions' | 'profile'>('questions');

  // Question form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formLevel, setFormLevel] = useState(0);
  const [formAgeGroups, setFormAgeGroups] = useState<string[]>([]);
  const [formOptions, setFormOptions] = useState<OptionItem[]>(Array(5).fill(null).map(emptyOption));
  const [formActive, setFormActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);
  const [formDifficulty, setFormDifficulty] = useState(2);
  const [formBranchLow, setFormBranchLow] = useState<string>('');
  const [formBranchMid, setFormBranchMid] = useState<string>('');
  const [formBranchHigh, setFormBranchHigh] = useState<string>('');
  const [formDimension, setFormDimension] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Profile option dialog state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileOption | null>(null);
  const [profileFormType, setProfileFormType] = useState<'status' | 'income'>('status');
  const [profileFormLabel, setProfileFormLabel] = useState('');
  const [profileFormValue, setProfileFormValue] = useState('');
  const [profileFormAgeGroups, setProfileFormAgeGroups] = useState<string[]>([]);
  const [profileFormActive, setProfileFormActive] = useState(true);
  const [profileFormOrder, setProfileFormOrder] = useState(0);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [qRes, pRes] = await Promise.all([
      supabase.from('questions').select('*').order('level').order('sort_order'),
      supabase.from('profile_options').select('*').order('sort_order'),
    ]);
    setQuestions(qRes.data || []);
    setProfileOptions((pRes.data as ProfileOption[]) || []);
    setLoading(false);
  };

  // ── Question CRUD ──
  const openCreate = () => {
    setEditing(null);
    setFormText(''); setFormCategory(''); setFormLevel(0);
    setFormAgeGroups([activeTab]);
    setFormOptions(Array(5).fill(null).map(emptyOption));
    setFormActive(true); setFormOrder(0);
    setFormDifficulty(2); setFormBranchLow(''); setFormBranchMid(''); setFormBranchHigh('');
    setFormDimension(DIMENSIONS[0]);
    setDialogOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setFormText(q.question_text); setFormCategory(q.category); setFormLevel(q.level);
    setFormAgeGroups([...(q.age_groups || AGE_GROUPS)]);
    const opts = (q.options as any as OptionItem[]) || [];
    setFormOptions([...opts, ...Array(Math.max(0, 5 - opts.length)).fill(null).map(emptyOption)]);
    setFormActive(q.is_active); setFormOrder(q.sort_order);
    const ext = q as any;
    setFormDifficulty(ext.difficulty ?? 2);
    setFormBranchLow(ext.branch_low != null ? String(ext.branch_low) : '');
    setFormBranchMid(ext.branch_mid != null ? String(ext.branch_mid) : '');
    setFormBranchHigh(ext.branch_high != null ? String(ext.branch_high) : '');
    setFormDimension(ext.dimension || DIMENSIONS[q.level] || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validOptions = formOptions.filter(o => o.text.trim());
    if (!formText.trim() || validOptions.length < 2) {
      toast({ title: 'Validation Error', description: 'Question text and at least 2 options required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      question_text: formText.trim(), category: formCategory.trim(), level: formLevel,
      age_groups: formAgeGroups, options: validOptions as any,
      is_active: formActive, sort_order: formOrder, updated_at: new Date().toISOString(),
      difficulty: formDifficulty,
      branch_low: formBranchLow !== '' ? Number(formBranchLow) : null,
      branch_mid: formBranchMid !== '' ? Number(formBranchMid) : null,
      branch_high: formBranchHigh !== '' ? Number(formBranchHigh) : null,
      dimension: formDimension || DIMENSIONS[formLevel] || null,
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
    setSaving(false); setDialogOpen(false); fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await supabase.from('questions').delete().eq('id', id);
    toast({ title: 'Question deleted' }); fetchAll();
  };

  const toggleActive = async (q: Question) => {
    await supabase.from('questions').update({ is_active: !q.is_active, updated_at: new Date().toISOString() }).eq('id', q.id);
    fetchAll();
  };

  const toggleAgeGroup = (group: string) => {
    setFormAgeGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
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

  // ── CSV ──
  const handleExport = () => {
    const filtered = getFilteredQuestions(activeTab);
    if (filtered.length === 0) {
      toast({ title: 'No questions to export', description: `No questions found for age group ${activeTab}.`, variant: 'destructive' });
      return;
    }
    const csv = exportQuestionsToCsv(filtered.map(q => ({ ...q, options: (q.options as any) || [] })));
    downloadCsv(csv, `questions-${activeTab}.csv`);
    toast({ title: 'Exported', description: `${filtered.length} questions exported for ${activeTab}.` });
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
        const parsed = parseCsvToQuestions(text);
        if (parsed.length === 0) { toast({ title: 'Import failed', description: 'No valid questions found.', variant: 'destructive' }); setImporting(false); return; }
        const rows = parsed.map(q => ({
          question_text: q.question_text, category: q.category, level: q.level,
          age_groups: q.age_groups.length > 0 ? q.age_groups : [activeTab],
          options: q.options as any, is_active: q.is_active, sort_order: q.sort_order,
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('questions').insert(rows);
        if (error) toast({ title: 'Import error', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Imported', description: `${rows.length} questions imported.` }); fetchAll(); }
      } catch { toast({ title: 'Import failed', description: 'Could not read CSV file.', variant: 'destructive' }); }
      setImporting(false);
    };
    input.click();
  };

  // ── Profile Option CRUD ──
  const openCreateProfile = (type: 'status' | 'income') => {
    setEditingProfile(null);
    setProfileFormType(type); setProfileFormLabel(''); setProfileFormValue('');
    setProfileFormAgeGroups([activeTab]); setProfileFormActive(true); setProfileFormOrder(0);
    setProfileDialogOpen(true);
  };

  const openEditProfile = (opt: ProfileOption) => {
    setEditingProfile(opt);
    setProfileFormType(opt.type as 'status' | 'income');
    setProfileFormLabel(opt.label); setProfileFormValue(opt.value);
    setProfileFormAgeGroups([...opt.age_groups]); setProfileFormActive(opt.is_active);
    setProfileFormOrder(opt.sort_order);
    setProfileDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profileFormLabel.trim() || !profileFormValue.trim()) {
      toast({ title: 'Validation Error', description: 'Label and value are required.', variant: 'destructive' });
      return;
    }
    setProfileSaving(true);
    const payload = {
      type: profileFormType, label: profileFormLabel.trim(), value: profileFormValue.trim(),
      age_groups: profileFormAgeGroups, is_active: profileFormActive, sort_order: profileFormOrder,
      updated_at: new Date().toISOString(),
    };
    if (editingProfile) {
      const { error } = await supabase.from('profile_options').update(payload).eq('id', editingProfile.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Profile option updated' });
    } else {
      const { error } = await supabase.from('profile_options').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Profile option created' });
    }
    setProfileSaving(false); setProfileDialogOpen(false); fetchAll();
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Delete this option?')) return;
    await supabase.from('profile_options').delete().eq('id', id);
    toast({ title: 'Option deleted' }); fetchAll();
  };

  const toggleProfileActive = async (opt: ProfileOption) => {
    await supabase.from('profile_options').update({ is_active: !opt.is_active, updated_at: new Date().toISOString() }).eq('id', opt.id);
    fetchAll();
  };

  const toggleProfileAgeGroup = (group: string) => {
    setProfileFormAgeGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const getFilteredProfileOptions = (ageGroup: string, type: string) => {
    return profileOptions.filter(o => o.type === type && o.age_groups.includes(ageGroup));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // ── Question List Renderer ──
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
                {CATEGORIES.map(c => (<SelectItem key={c.level} value={String(c.level)}>{c.label}</SelectItem>))}
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
              <CardHeader><CardTitle className="flex items-center justify-between"><span>{cat.label}</span><Badge variant="secondary">{levelQs.length} question{levelQs.length !== 1 ? 's' : ''}</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {levelQs.map((q, idx) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                    <span className="text-sm text-muted-foreground font-mono w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${q.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{q.question_text}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.category && <Badge variant="secondary" className="text-xs">{q.category}</Badge>}
                        {(q as any).dimension && <Badge variant="outline" className="text-xs">📐 {(q as any).dimension}</Badge>}
                        {(q as any).difficulty != null && <Badge variant="outline" className="text-xs">⚡ D{(q as any).difficulty}</Badge>}
                        {((q as any).branch_low != null || (q as any).branch_mid != null || (q as any).branch_high != null) && (
                          <Badge variant="outline" className="text-xs text-amber-600">🔀 Branching</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={q.is_active} onCheckedChange={() => toggleActive(q)} />
                      <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {levelQs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No questions in this level</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ── Profile Options Renderer ──
  const renderProfileOptions = (ageGroup: string) => {
    const statusOpts = getFilteredProfileOptions(ageGroup, 'status');
    const incomeOpts = getFilteredProfileOptions(ageGroup, 'income');

    const renderOptionCard = (title: string, type: 'status' | 'income', opts: ProfileOption[]) => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{opts.length} option{opts.length !== 1 ? 's' : ''}</Badge>
              <Button size="sm" onClick={() => openCreateProfile(type)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {opts.map((opt, idx) => (
            <div key={opt.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
              <span className="text-sm text-muted-foreground font-mono w-6">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${opt.is_active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{opt.label}</p>
                <Badge variant="outline" className="text-xs mt-1">{opt.value}</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={opt.is_active} onCheckedChange={() => toggleProfileActive(opt)} />
                <Button size="icon" variant="ghost" onClick={() => openEditProfile(opt)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteProfile(opt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {opts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No options for this age group</p>}
        </CardContent>
      </Card>
    );

    return (
      <div className="space-y-4">
        {renderOptionCard('🎯 Current Stage Options', 'status', statusOpts)}
        {renderOptionCard('💰 Income Source Options', 'income', incomeOpts)}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {mainSection === 'questions' ? 'Questions' : 'Profile Options'}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={mainSection === 'questions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMainSection('questions')}
          >
            📝 Questions
          </Button>
          <Button
            variant={mainSection === 'profile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMainSection('profile')}
          >
            👤 Profile Options
          </Button>
          {mainSection === 'questions' && (
            <>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
              <Button variant="outline" size="sm" onClick={handleImport} disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Import CSV
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {AGE_GROUPS.map(ag => (
            <TabsTrigger key={ag} value={ag}>
              {ag}
              <Badge variant="outline" className="ml-2 text-xs">
                {mainSection === 'questions'
                  ? questions.filter(q => (q.age_groups || []).includes(ag)).length
                  : profileOptions.filter(o => o.age_groups.includes(ag)).length
                }
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {AGE_GROUPS.map(ag => (
          <TabsContent key={ag} value={ag}>
            {mainSection === 'questions' ? renderQuestionList(ag) : renderProfileOptions(ag)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Question Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Question' : 'New Question'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={String(formLevel)} onValueChange={v => setFormLevel(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => (<SelectItem key={c.level} value={String(c.level)}>{c.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label><Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Real Income Level" /></div>
            </div>
            <div><Label>Question Text</Label><Textarea value={formText} onChange={e => setFormText(e.target.value)} rows={3} /></div>
            <div>
              <Label>Age Groups</Label>
              <div className="flex gap-4 mt-1">
                {AGE_GROUPS.map(ag => (<label key={ag} className="flex items-center gap-2 text-sm"><Checkbox checked={formAgeGroups.includes(ag)} onCheckedChange={() => toggleAgeGroup(ag)} />{ag}</label>))}
              </div>
            </div>
            <div>
              <Label>Options (score 1–5, top to bottom)</Label>
              <div className="space-y-2 mt-1">
                {formOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <Input value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} placeholder={`Option ${idx + 1}`} className="flex-1" />
                    <Input value={opt.emoji} onChange={e => updateOption(idx, 'emoji', e.target.value)} placeholder="🎯" className="w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sort Order</Label><Input type="number" value={formOrder} onChange={e => setFormOrder(Number(e.target.value))} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={formActive} onCheckedChange={setFormActive} /><Label>Active</Label></div>
            </div>

            {/* Adaptive Branching Config */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">🔀 Adaptive Branching</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dimension</Label>
                  <Select value={formDimension} onValueChange={setFormDimension}>
                    <SelectTrigger><SelectValue placeholder="Select dimension" /></SelectTrigger>
                    <SelectContent>
                      {DIMENSIONS.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={String(formDifficulty)} onValueChange={v => setFormDifficulty(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — Easy</SelectItem>
                      <SelectItem value="2">2 — Medium</SelectItem>
                      <SelectItem value="3">3 — Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Branch Low (score ≤1)</Label>
                  <Select value={formBranchLow} onValueChange={setFormBranchLow}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {CATEGORIES.map(c => (<SelectItem key={c.level} value={String(c.level)}>L{c.level}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Branch Mid (score = 2)</Label>
                  <Select value={formBranchMid} onValueChange={setFormBranchMid}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {CATEGORIES.map(c => (<SelectItem key={c.level} value={String(c.level)}>L{c.level}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Branch High (score ≥3)</Label>
                  <Select value={formBranchHigh} onValueChange={setFormBranchHigh}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {CATEGORIES.map(c => (<SelectItem key={c.level} value={String(c.level)}>L{c.level}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Set branching to control which level the engine jumps to based on the user's answer score. Leave empty for sequential flow.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Option Edit/Create Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingProfile ? 'Edit Profile Option' : 'New Profile Option'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={profileFormType} onValueChange={v => setProfileFormType(v as 'status' | 'income')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">🎯 Current Stage</SelectItem>
                  <SelectItem value="income">💰 Income Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Label (with emoji)</Label><Input value={profileFormLabel} onChange={e => setProfileFormLabel(e.target.value)} placeholder="🎓 In college" /></div>
            <div><Label>Value (internal key)</Label><Input value={profileFormValue} onChange={e => setProfileFormValue(e.target.value)} placeholder="college" /></div>
            <div>
              <Label>Age Groups</Label>
              <div className="flex gap-4 mt-1">
                {AGE_GROUPS.map(ag => (<label key={ag} className="flex items-center gap-2 text-sm"><Checkbox checked={profileFormAgeGroups.includes(ag)} onCheckedChange={() => toggleProfileAgeGroup(ag)} />{ag}</label>))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Sort Order</Label><Input type="number" value={profileFormOrder} onChange={e => setProfileFormOrder(Number(e.target.value))} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={profileFormActive} onCheckedChange={setProfileFormActive} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={profileSaving}>{profileSaving ? 'Saving...' : editingProfile ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questions;
