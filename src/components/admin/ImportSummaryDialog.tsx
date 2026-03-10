import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { ImportSummary } from '@/pages/admin/Questions';

interface Props {
  summary: ImportSummary | null;
  onClose: () => void;
}

const ImportSummaryDialog = ({ summary, onClose }: Props) => {
  if (!summary) return null;

  const hasErrors = summary.errors.length > 0;
  const hasSkipped = summary.skippedProfiles.length > 0;

  return (
    <Dialog open={!!summary} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasErrors ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
            Import Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.created}</p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.updated}</p>
              <p className="text-xs text-muted-foreground">Updated</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-destructive">{summary.errors.length}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Total rows parsed: {summary.totalParsed}
          </p>

          {/* Skipped Profiles */}
          {hasSkipped && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                <Info className="h-4 w-4" />
                Skipped Profiles (not matching any valid profile code)
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.skippedProfiles.map(p => (
                  <span key={p} className="inline-block rounded bg-yellow-200 dark:bg-yellow-900 px-2 py-0.5 text-xs font-mono">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <XCircle className="h-4 w-4" />
                Errors ({summary.errors.length})
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {summary.errors.map((err, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="font-mono text-destructive">Row {err.row}:</span> {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSummaryDialog;
