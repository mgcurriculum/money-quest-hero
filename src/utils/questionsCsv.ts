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

// Normalize header names to our internal field names
function normalizeHeader(h: string): string | null {
  const s = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const map: Record<string, string> = {
    'profilecode': 'profile_code',
    'profile': 'profile_code',
    'qno': 'question_no',
    'questionno': 'question_no',
    'no': 'question_no',
    'sno': 'question_no',
    'dimension': 'dimension',
    'category': 'category',
    'question': 'question_text',
    'questiontext': 'question_text',
    'option1': 'option_1',
    'option2': 'option_2',
    'option3': 'option_3',
    'option4': 'option_4',
    'option5': 'option_5',
    'score1': 'score_1',
    'score2': 'score_2',
    'score3': 'score_3',
    'score4': 'score_4',
    'score5': 'score_5',
    'isactive': 'is_active',
    'active': 'is_active',
  };
  return map[s] || null;
}

export function parseCsvToQuestions(csv: string, defaultProfileCode?: string): QuestionRow[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse header row and build column index map
  const headerCols = parseCsvLine(lines[0]);
  const colMap: Record<string, number> = {};
  headerCols.forEach((h, idx) => {
    const field = normalizeHeader(h);
    if (field && !(field in colMap)) {
      colMap[field] = idx;
    }
  });

  const get = (cols: string[], field: string): string => {
    const idx = colMap[field];
    return idx !== undefined ? (cols[idx]?.trim() || '') : '';
  };

  const questions: QuestionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    
    const questionText = get(cols, 'question_text');
    if (!questionText) continue; // skip empty rows

    questions.push({
      profile_code: get(cols, 'profile_code') || defaultProfileCode || '',
      question_no: parseInt(get(cols, 'question_no')) || i,
      dimension: get(cols, 'dimension'),
      category: get(cols, 'category'),
      question_text: questionText,
      option_1: get(cols, 'option_1'),
      option_2: get(cols, 'option_2'),
      option_3: get(cols, 'option_3'),
      option_4: get(cols, 'option_4'),
      option_5: get(cols, 'option_5'),
      score_1: parseInt(get(cols, 'score_1')) || 10,
      score_2: parseInt(get(cols, 'score_2')) || 20,
      score_3: parseInt(get(cols, 'score_3')) || 30,
      score_4: parseInt(get(cols, 'score_4')) || 40,
      score_5: parseInt(get(cols, 'score_5')) || 50,
      is_active: get(cols, 'is_active').toLowerCase() !== 'false',
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
