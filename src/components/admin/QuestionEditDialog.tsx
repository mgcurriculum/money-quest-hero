import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dimensions } from '@/data/questions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  formText: string;
  setFormText: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formDimension: string;
  setFormDimension: (v: string) => void;
  formQuestionNo: number;
  setFormQuestionNo: (v: number) => void;
  formOptions: string[];
  setFormOptions: (v: string[]) => void;
  formScores: number[];
  setFormScores: (v: number[]) => void;
  formActive: boolean;
  setFormActive: (v: boolean) => void;
  saving: boolean;
  onSave: () => void;
}

const QuestionEditDialog = ({
  open, onOpenChange, editing, formText, setFormText, formCategory, setFormCategory,
  formDimension, setFormDimension, formQuestionNo, setFormQuestionNo,
  formOptions, setFormOptions, formScores, setFormScores,
  formActive, setFormActive, saving, onSave,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
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
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default QuestionEditDialog;
