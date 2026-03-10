interface QuestionRow {
  id?: string;
  profile_code: string;
  question_no: number;
  dimension: string;
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
}

const CSV_HEADERS = [
  'profile_code', 'question_no', 'dimension', 'category', 'question_text',
  'option_1', 'option_2', 'option_3', 'option_4', 'option_5',
  'score_1', 'score_2', 'score_3', 'score_4', 'score_5',
  'is_active',
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
    rows.push([
      escapeCsv(q.profile_code),
      String(q.question_no),
      escapeCsv(q.dimension || ''),
      escapeCsv(q.category || ''),
      escapeCsv(q.question_text),
      escapeCsv(q.option_1),
      escapeCsv(q.option_2),
      escapeCsv(q.option_3),
      escapeCsv(q.option_4),
      escapeCsv(q.option_5),
      String(q.score_1),
      String(q.score_2),
      String(q.score_3),
      String(q.score_4),
      String(q.score_5),
      q.is_active ? 'true' : 'false',
    ].join(','));
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
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

export function parseCsvToQuestions(csv: string, defaultProfileCode?: string): QuestionRow[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const questions: QuestionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 5) continue;
    questions.push({
      profile_code: cols[0]?.trim() || defaultProfileCode || '',
      question_no: parseInt(cols[1]) || (i),
      dimension: cols[2]?.trim() || '',
      category: cols[3]?.trim() || '',
      question_text: cols[4]?.trim() || '',
      option_1: cols[5]?.trim() || '',
      option_2: cols[6]?.trim() || '',
      option_3: cols[7]?.trim() || '',
      option_4: cols[8]?.trim() || '',
      option_5: cols[9]?.trim() || '',
      score_1: parseInt(cols[10]) || 10,
      score_2: parseInt(cols[11]) || 20,
      score_3: parseInt(cols[12]) || 30,
      score_4: parseInt(cols[13]) || 40,
      score_5: parseInt(cols[14]) || 50,
      is_active: cols[15]?.toLowerCase() !== 'false',
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
