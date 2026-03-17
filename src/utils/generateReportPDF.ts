import type { QuestionItem } from '@/hooks/useQuestions';
import { dimensions, dimensionIcons, MAX_SCORE_PER_QUESTION } from '@/data/questions';

// Canonical dimension order for sorting
const DIMENSION_ORDER = [...dimensions];

export interface QAEntry {
  questionNo: number;
  dimension: string;
  category: string;
  question: string;
  selectedOption: string;
  score: number;
}

export interface DimensionScore {
  dimension: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export function extractQuestionsAndAnswers(
  questions: QuestionItem[],
  answers: { [idx: number]: number }
): QAEntry[] {
  return questions.map((q, idx) => {
    const score = answers[idx] || 0;
    const selectedOpt = q.options.find(o => o.score === score);
    return {
      questionNo: q.questionNo,
      dimension: q.dimension,
      category: q.category,
      question: q.questionText,
      selectedOption: selectedOpt?.text || `Score ${score}`,
      score,
    };
  });
}

export function getFinancialTips(dimScores: DimensionScore[]): string[] {
  const tips: string[] = [];
  dimScores.forEach(ds => {
    if (ds.percentage < 50) {
      tips.push(`${ds.dimension}: Needs improvement - focus on building better habits here.`);
    } else if (ds.percentage < 75) {
      tips.push(`${ds.dimension}: Good progress - keep strengthening this area.`);
    } else {
      tips.push(`${ds.dimension}: Strong performance - you're doing great here!`);
    }
  });
  tips.push('Create a monthly budget and review it every week to stay on track.');
  tips.push('Open a dedicated savings account and automate a fixed monthly transfer.');
  tips.push('Never share OTPs, PINs, or passwords - even with people claiming to be from your bank.');
  return tips;
}

function getScoreColor(percentage: number): string {
  if (percentage >= 75) return '#2e7d32';
  if (percentage >= 50) return '#f57c00';
  return '#c62828';
}

function getScoreBg(percentage: number): string {
  if (percentage >= 75) return '#e8f5e9';
  if (percentage >= 50) return '#fff3e0';
  return '#ffebee';
}

function padQNo(n: number | undefined): string {
  if (n === undefined || n === null) return 'Q--';
  return `Q${n.toString().padStart(2, '0')}`;
}

const SHORT_TO_FULL: Record<string, string> = {
  'Earning': 'Earning Mindset',
  'Spending': 'Spending Behaviour',
  'Saving': 'Saving Behaviour',
  'Borrowing': 'Debt Awareness',
  'Investing': 'Investment Awareness',
  'Protecting': 'Financial Safety',
};

function normalizeDimension(dim: string): string {
  const trimmed = dim.trim();
  // Check short-name map first
  for (const [short, full] of Object.entries(SHORT_TO_FULL)) {
    if (trimmed.toLowerCase() === short.toLowerCase()) return full;
  }
  // Then check canonical full names
  const lower = trimmed.toLowerCase();
  for (const canonical of DIMENSION_ORDER) {
    if (canonical.toLowerCase() === lower) return canonical;
  }
  return trimmed;
}

export function generateReportHTML(params: {
  logoUrl?: string;
  playerName: string;
  profileLabel: string;
  playerAge?: number;
  totalScore: number;
  maxScore: number;
  bandLevel: string;
  bandEmoji: string;
  bandMeaning: string;
  dimensionScores: DimensionScore[];
  questionsAndAnswers: QAEntry[];
  tips: string[];
  reflectionAnswer?: string;
}): string {
  const {
    logoUrl, playerName, profileLabel, playerAge, totalScore, maxScore,
    bandLevel, bandEmoji, bandMeaning, dimensionScores, questionsAndAnswers, tips, reflectionAnswer,
  } = params;

  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const dimensionRows = dimensionScores.map(ds => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;font-size:13px;color:#333;vertical-align:middle;">
        <span style="font-size:16px;margin-right:6px;">${ds.icon}</span>${ds.dimension}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;vertical-align:middle;">
        <div style="background:#f0f0f0;border-radius:10px;height:14px;overflow:hidden;position:relative;">
          <div style="height:100%;border-radius:10px;background:linear-gradient(90deg,#6C63FF,#4FC3F7);width:${ds.percentage}%;min-width:${ds.percentage > 0 ? '8px' : '0'};"></div>
        </div>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;font-size:14px;font-weight:700;text-align:center;vertical-align:middle;white-space:nowrap;">
        <span style="color:${getScoreColor(ds.percentage)};background:${getScoreBg(ds.percentage)};padding:3px 10px;border-radius:12px;font-size:12px;display:inline-block;min-width:48px;text-align:center;">${ds.percentage}%</span>
      </td>
    </tr>
  `).join('');

  // Normalize, group, and sort Q&A by canonical dimension order, then by questionNo
  const normalizedQA = questionsAndAnswers.map(qa => ({
    ...qa,
    dimension: normalizeDimension(qa.dimension || 'General'),
  }));

  const qaByDim: Record<string, QAEntry[]> = {};
  // Initialize in canonical order
  for (const dim of DIMENSION_ORDER) {
    qaByDim[dim] = [];
  }
  normalizedQA.forEach(qa => {
    const key = qa.dimension;
    if (!qaByDim[key]) qaByDim[key] = [];
    qaByDim[key].push(qa);
  });
  // Sort questions within each dimension by questionNo
  for (const key of Object.keys(qaByDim)) {
    qaByDim[key].sort((a, b) => (a.questionNo || 0) - (b.questionNo || 0));
  }
  // Remove empty dimensions
  for (const key of Object.keys(qaByDim)) {
    if (qaByDim[key].length === 0) delete qaByDim[key];
  }

  const qaHTML = Object.entries(qaByDim).map(([dim, qas]) => `
    <div class="qa-section" style="margin-bottom:20px;">
      <div class="section-title" style="font-size:13px;font-weight:700;color:#2D1B69;padding:10px 16px;background:linear-gradient(135deg,#f0ebff,#e8e0f0);border-radius:10px;margin-bottom:10px;letter-spacing:0.3px;page-break-after:avoid;">
        ${dim}
      </div>
      ${qas.map(qa => {
        const scoreColor = getScoreColor((qa.score / MAX_SCORE_PER_QUESTION) * 100);
        const scoreBg = getScoreBg((qa.score / MAX_SCORE_PER_QUESTION) * 100);
        return `
        <div class="qa-card" style="padding:12px 16px;border-left:4px solid #6C63FF;margin-bottom:8px;background:#fafbfc;border-radius:0 10px 10px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;width:40px;padding-right:8px;">
                <span style="display:inline-block;width:36px;height:22px;line-height:22px;text-align:center;font-size:11px;font-weight:700;color:#4f46e5;background:#ede9fe;border-radius:6px;">${padQNo(qa.questionNo)}</span>
              </td>
              <td style="vertical-align:top;">
                <p style="font-size:12px;color:#555;margin:0 0 8px;line-height:1.5;">${qa.question}</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;font-size:12px;font-weight:600;color:#2D1B69;padding:0;">Ans: ${qa.selectedOption}</td>
                    <td style="vertical-align:middle;text-align:right;white-space:nowrap;padding:0;width:60px;">
                      <span style="font-size:11px;font-weight:700;color:${scoreColor};background:${scoreBg};padding:2px 8px;border-radius:8px;">${qa.score}/${MAX_SCORE_PER_QUESTION}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>`;
      }).join('')}
    </div>
  `).join('');

  const tipsHTML = tips.map((t, i) => {
    const forceNextPage = i === 5;
    const extra = forceNextPage ? 'page-break-before:always;break-before:page;' : '';
    return `
    <div class="tip-card" style="padding:12px 16px;background:#f8f6ff;border-radius:10px;margin-bottom:8px;font-size:12px;color:#333;line-height:1.6;border-left:4px solid #6C63FF;page-break-inside:avoid;break-inside:avoid;${extra}">
      <span style="font-weight:700;color:#4f46e5;margin-right:4px;">${i + 1}.</span> ${t}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${playerName}'s FQ Test Report</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    * { box-sizing: border-box; }
    body { margin:0; padding:0; background:#fff; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color:#333; line-height:1.5; }
    .qa-card, .tip-card { page-break-inside: avoid; }
    .qa-section { page-break-inside: auto; }
    .section-title { page-break-after: avoid; }
    .section-break { page-break-before: always; }
  </style>
</head>
<body>
  <div style="max-width:100%;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 16px;background:linear-gradient(135deg,#2D1B69 0%,#1a103f 50%,#0f0a2e 100%);border-radius:20px;color:#fff;margin-bottom:24px;position:relative;overflow:hidden;width:100%;box-sizing:border-box;">
      <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,0.03);border-radius:50%;"></div>
      <div style="position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;background:rgba(255,255,255,0.03);border-radius:50%;"></div>
      ${logoUrl ? `<img src="${logoUrl}" alt="FinQuo Versity" style="width:90px;height:auto;margin:0 auto 16px;display:block;opacity:0.95;" />` : ''}
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:-0.5px;">FQ Test Report</h1>
      <p style="margin:0;opacity:0.65;font-size:13px;font-weight:400;word-wrap:break-word;overflow-wrap:break-word;">${playerName}${playerAge ? ` | Age: ${playerAge}` : ''} | ${profileLabel}</p>
    </div>

    <!-- Score Card -->
    <div style="text-align:center;padding:28px 24px;background:#fff;border-radius:20px;margin-bottom:24px;border:2px solid #f0ebff;box-shadow:0 4px 24px rgba(45,27,105,0.06);">
      <div style="font-size:52px;font-weight:800;color:#2D1B69;line-height:1;">
        ${totalScore}<span style="font-size:18px;color:#aaa;font-weight:400;">/${maxScore}</span>
      </div>
      <div style="margin:22px auto 0;width:80%;max-width:320px;height:8px;background:#f0f0f0;border-radius:8px;overflow:hidden;">
        <div style="height:100%;width:${scorePercent}%;background:linear-gradient(90deg,#6C63FF,#4FC3F7);border-radius:8px;"></div>
      </div>
      <div style="font-size:12px;color:#999;margin-top:8px;">You are</div>
      <div style="font-size:20px;font-weight:700;color:#6C63FF;margin-top:4px;">${bandLevel}</div>
      <div style="font-size:12px;color:#888;margin-top:6px;max-width:300px;margin-left:auto;margin-right:auto;">${bandMeaning}</div>
    </div>

    <!-- Dimension Breakdown -->
    <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:24px;border:2px solid #f0ebff;box-shadow:0 4px 24px rgba(45,27,105,0.06);">
      <h2 style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1.5px;text-align:center;margin:0 0 16px;font-weight:600;">Dimension Breakdown</h2>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:40%;" />
          <col style="width:38%;" />
          <col style="width:22%;" />
        </colgroup>
        ${dimensionRows}
      </table>
    </div>

    <!-- Your Answers -->
    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #6C63FF;">
        <h2 style="font-size:16px;color:#2D1B69;margin:0;font-weight:700;">Your Answers</h2>
      </div>
      ${qaHTML}
    </div>

    <!-- Financial Tips -->
    <div class="section-break"></div>
    <div style="margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #6C63FF;">
        <h2 style="font-size:16px;color:#2D1B69;margin:0;font-weight:700;">Financial Tips</h2>
      </div>
      ${tipsHTML}
    </div>

    <!-- Reflection -->
    ${reflectionAnswer ? `
    <div style="margin-bottom:24px;padding:20px;background:linear-gradient(135deg,#f0f7ff,#e8f0fe);border-radius:16px;border:1px solid #d0e0f0;">
      <p style="font-size:11px;color:#888;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">YOUR REFLECTION</p>
      <p style="font-size:14px;color:#333;margin:0;line-height:1.6;">${reflectionAnswer}</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding:20px 16px;margin-top:8px;border-top:1px solid #eee;">
      <p style="font-size:11px;color:#bbb;margin:0 0 4px;">Powered by <strong style="color:#999;">FinQuo Versity</strong></p>
      <p style="font-size:10px;color:#ccc;margin:0;">Take the test at fqtest.finquo.com</p>
    </div>
  </div>
</body>
</html>`;
}

export async function downloadReportAsFile(html: string, filename: string) {
  const html2pdf = (await import('html2pdf.js')).default;

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const source = document.createElement('div');
  source.style.width = '720px';
  source.style.background = '#ffffff';
  source.innerHTML = parsed.body.innerHTML;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-9999';
  container.style.pointerEvents = 'none';
  container.appendChild(source);
  document.body.appendChild(container);

  const pdfFilename = filename.replace(/\.html$/i, '.pdf');

  await new Promise(r => setTimeout(r, 500));

  try {
    await html2pdf()
      .set({
        margin: [4, 8, 4, 8],
        filename: pdfFilename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 720 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.qa-card', '.tip-card'] },
      })
      .from(source)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

// Legacy export for backward compat
export function openPrintableReport(html: string) {
  downloadReportAsFile(html, 'FQ-Test-Report.pdf');
}
