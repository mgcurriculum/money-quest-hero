interface OptionItem {
  text: string;
  emoji: string;
}

interface QuestionRow {
  id?: string;
  level: number;
  category: string;
  question_text: string;
  options: OptionItem[];
  age_groups: string[];
  is_active: boolean;
  sort_order: number;
}

const CSV_HEADERS = [
  'level',
  'category',
  'question_text',
  'age_groups',
  'is_active',
  'sort_order',
  'option1_text',
  'option1_emoji',
  'option2_text',
  'option2_emoji',
  'option3_text',
  'option3_emoji',
  'option4_text',
  'option4_emoji',
  'option5_text',
  'option5_emoji',
];

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportQuestionsToCsv(questions: QuestionRow[]): string {
  const rows = [CSV_HEADERS.join(',')];
  for (const q of questions) {
    const opts = q.options || [];
    const row = [
      String(q.level),
      escapeCsv(q.category || ''),
      escapeCsv(q.question_text),
      escapeCsv((q.age_groups || []).join('|')),
      q.is_active ? 'true' : 'false',
      String(q.sort_order),
    ];
    for (let i = 0; i < 5; i++) {
      row.push(escapeCsv(opts[i]?.text || ''));
      row.push(escapeCsv(opts[i]?.emoji || ''));
    }
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export function parseCsvToQuestions(csv: string): QuestionRow[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Skip header
  const questions: QuestionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 6) continue;

    const options: OptionItem[] = [];
    for (let j = 0; j < 5; j++) {
      const text = (cols[6 + j * 2] || '').trim();
      const emoji = (cols[7 + j * 2] || '').trim();
      if (text) options.push({ text, emoji });
    }

    questions.push({
      level: parseInt(cols[0]) || 0,
      category: cols[1] || '',
      question_text: cols[2] || '',
      age_groups: (cols[3] || '').split('|').filter(Boolean),
      is_active: cols[4]?.toLowerCase() !== 'false',
      sort_order: parseInt(cols[5]) || 0,
      options,
    });
  }
  return questions;
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
