import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import { parseCsvToQuestions } from '@/utils/questionsCsv';
import { getAllProfileCodes } from '@/data/questions';
import type { ImportSummary } from '@/pages/admin/Questions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (summary: ImportSummary) => void;
}

const PROFILE_CODES = new Set(getAllProfileCodes());

const GoogleSheetImportDialog = ({ open, onOpenChange, onImportComplete }: Props) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setStatus('Fetching sheets from Google...');

    const summary: ImportSummary = {
      created: 0,
      updated: 0,
      errors: [],
      skippedProfiles: [],
      totalParsed: 0,
    };

    try {
      const { data, error } = await supabase.functions.invoke('import-google-sheet', {
        body: { url: url.trim() },
      });

      if (error || !data?.success) {
        summary.errors.push({ row: 0, message: error?.message || data?.error || 'Failed to fetch Google Sheet' });
        onImportComplete(summary);
        setLoading(false);
        setStatus('');
        onOpenChange(false);
        return;
      }

      const sheets: { sheetName: string; csv: string; error?: string }[] = data.sheets || [];
      const skippedSheets: string[] = [];
      const matchedSheets: string[] = [];

      setStatus(`Found ${sheets.length} sheet(s). Processing...`);

      for (const sheet of sheets) {
        if (sheet.error) {
          summary.errors.push({ row: 0, message: `Sheet "${sheet.sheetName}": ${sheet.error}` });
          continue;
        }

        // Sheet name should match a profile code
        const sheetProfileCode = sheet.sheetName.trim().toUpperCase();
        if (!PROFILE_CODES.has(sheetProfileCode)) {
          skippedSheets.push(sheet.sheetName);
          continue;
        }

        matchedSheets.push(sheetProfileCode);

        // Parse CSV rows from this sheet
        const parsed = parseCsvToQuestions(sheet.csv, sheetProfileCode);
        summary.totalParsed += parsed.length;

        if (parsed.length === 0) continue;

        // Filter valid profile rows
        const validRows = parsed.filter(q => {
          const pc = (q.profile_code || sheetProfileCode).toUpperCase();
          return PROFILE_CODES.has(pc);
        });

        // Fetch existing questions for this profile to detect updates
        const { data: existingData } = await supabase
          .from('questions')
          .select('id, profile_code, question_no')
          .eq('profile_code', sheetProfileCode);

        const existingMap = new Map<string, string>();
        (existingData || []).forEach((eq: any) => {
          existingMap.set(`${eq.profile_code}_${eq.question_no}`, eq.id);
        });

        setStatus(`Processing sheet "${sheetProfileCode}" (${validRows.length} questions)...`);

        for (let i = 0; i < validRows.length; i++) {
          const q = validRows[i];
          const row = {
            profile_code: sheetProfileCode,
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

          const existingId = existingMap.get(`${sheetProfileCode}_${q.question_no}`);
          if (existingId) {
            const { error: err } = await supabase.from('questions').update(row as any).eq('id', existingId);
            if (err) summary.errors.push({ row: i + 2, message: `[${sheetProfileCode}] ${err.message}` });
            else summary.updated++;
          } else {
            const { error: err } = await supabase.from('questions').insert(row as any);
            if (err) summary.errors.push({ row: i + 2, message: `[${sheetProfileCode}] ${err.message}` });
            else summary.created++;
          }
        }
      }

      summary.skippedProfiles = skippedSheets;

      onImportComplete(summary);
      onOpenChange(false);
      setUrl('');
    } catch (err) {
      summary.errors.push({ row: 0, message: err instanceof Error ? err.message : 'Unknown error' });
      onImportComplete(summary);
      onOpenChange(false);
    }

    setLoading(false);
    setStatus('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import from Google Sheets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Google Sheets Public Link</Label>
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              disabled={loading}
            />
          </div>

          <div className="rounded-md border bg-muted/50 p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">How it works:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>The spreadsheet must be <strong>publicly accessible</strong> (Share → Anyone with link)</li>
              <li>Each sheet/tab name must match a <strong>profile code</strong> (e.g. A1_STU, A2_SAL)</li>
              <li>Sheets not matching any profile code will be <strong>skipped</strong> and shown in the summary</li>
              <li>Header row: Q No, Dimension, Category, Question, Option 1–5, Score 1–5</li>
              <li>Existing questions (same profile + question_no) will be <strong>updated</strong></li>
            </ul>
          </div>

          {status && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {status}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</> : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleSheetImportDialog;
