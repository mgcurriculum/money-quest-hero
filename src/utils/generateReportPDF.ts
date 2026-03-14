import type { QuestionItem } from '@/hooks/useQuestions';
import { dimensions, dimensionIcons, MAX_SCORE_PER_QUESTION } from '@/data/questions';

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
      tips.push(`${ds.icon} ${ds.dimension}: Needs improvement — focus on building better habits here.`);
    } else if (ds.percentage < 75) {
      tips.push(`${ds.icon} ${ds.dimension}: Good progress — keep strengthening this area.`);
    } else {
      tips.push(`${ds.icon} ${ds.dimension}: Strong performance — you're doing great here!`);
    }
  });
  tips.push('📝 Create a monthly budget and review it every week to stay on track.');
  tips.push('🏦 Open a dedicated savings account and automate a fixed monthly transfer.');
  tips.push('🛡️ Never share OTPs, PINs, or passwords — even with people claiming to be from your bank.');
  return tips;
}

export function generateReportHTML(params: {
  logoUrl?: string;
  playerName: string;
  profileLabel: string;
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
    logoUrl, playerName, profileLabel, totalScore, maxScore,
    bandLevel, bandEmoji, bandMeaning, dimensionScores, questionsAndAnswers, tips, reflectionAnswer,
  } = params;

  const dimensionRows = dimensionScores.map(ds => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;color:#333;">${ds.icon} ${ds.dimension}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;width:55%;">
        <div style="background:#e8e0f0;border-radius:8px;height:12px;overflow:hidden;">
          <div style="height:100%;border-radius:8px;background:linear-gradient(90deg,#4FC3F7,#7C4DFF);width:${ds.percentage}%;"></div>
        </div>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;font-weight:700;color:#2D1B69;text-align:right;">${ds.percentage}%</td>
    </tr>
  `).join('');

  // Group Q&A by dimension
  const qaByDim: Record<string, QAEntry[]> = {};
  questionsAndAnswers.forEach(qa => {
    const key = qa.dimension || 'General';
    if (!qaByDim[key]) qaByDim[key] = [];
    qaByDim[key].push(qa);
  });

  const qaHTML = Object.entries(qaByDim).map(([dim, qas]) => `
    <div style="margin-bottom:16px;">
      <h3 style="font-size:15px;color:#2D1B69;margin:0 0 8px;padding:8px 12px;background:#f0ebff;border-radius:8px;">${dim}</h3>
      ${qas.map((qa, idx) => `
        <div style="padding:10px 12px;border-left:3px solid #4FC3F7;margin-bottom:8px;background:#fafafa;border-radius:0 8px 8px 0;">
          <p style="font-size:13px;color:#555;margin:0 0 6px;line-height:1.4;">Q${qa.questionNo}. ${qa.question}</p>
          <p style="font-size:13px;font-weight:600;color:#2D1B69;margin:0;">${qa.selectedOption} <span style="color:#4FC3F7;font-size:11px;margin-left:8px;">(Score: ${qa.score}/${MAX_SCORE_PER_QUESTION})</span></p>
        </div>
      `).join('')}
    </div>
  `).join('');

  const tipsHTML = tips.map(t => `
    <div style="padding:10px 14px;background:#f8f6ff;border-radius:8px;margin-bottom:6px;font-size:13px;color:#333;line-height:1.5;">${t}</div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${playerName}'s FQ Test Report</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page-break { page-break-before: always; }
    }
    body { margin:0; padding:0; background:#fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#333; }
  </style>
</head>
<body>
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:28px 24px;background:linear-gradient(135deg,#23113f,#1a103f);border-radius:16px;color:#fff;margin-bottom:20px;">
      ${logoUrl ? `<img src="${logoUrl}" alt="FinQuo Versity" style="width:100px;height:auto;margin:0 auto 12px;display:block;" />` : ''}
      <h1 style="margin:0 0 4px;font-size:24px;">FQ Test Report</h1>
      <p style="margin:0;opacity:0.7;font-size:13px;">${playerName} • ${profileLabel}</p>
    </div>
    <div style="text-align:center;padding:24px;background:#f8f6ff;border-radius:16px;margin-bottom:20px;border:1px solid #e8e0f0;">
      <div style="font-size:52px;margin-bottom:4px;">${bandEmoji}</div>
      <div style="font-size:48px;font-weight:800;color:#2D1B69;">${totalScore}<span style="font-size:18px;color:#999;font-weight:400;">/${maxScore}</span></div>
      <div style="font-size:14px;color:#888;margin-top:4px;">You are</div>
      <div style="font-size:18px;font-weight:700;color:#4FC3F7;margin-top:4px;">${bandEmoji} ${bandLevel}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${bandMeaning}</div>
    </div>
    <div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:20px;border:1px solid #e8e0f0;">
      <h2 style="font-size:14px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:center;margin:0 0 12px;">Dimension Breakdown</h2>
      <table style="width:100%;border-collapse:collapse;">${dimensionRows}</table>
    </div>
    <div class="page-break" style="margin-bottom:20px;">
      <h2 style="font-size:16px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">📝 Your Answers</h2>
      ${qaHTML}
    </div>
    <div class="page-break" style="margin-bottom:20px;">
      <h2 style="font-size:16px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">🎯 Financial Tips</h2>
      ${tipsHTML}
    </div>
    ${reflectionAnswer ? `<div style="margin-bottom:20px;padding:16px;background:#f0f7ff;border-radius:12px;border:1px solid #e0e8f0;"><p style="font-size:12px;color:#888;margin:0 0 4px;">Reflection</p><p style="font-size:14px;color:#333;margin:0;">${reflectionAnswer}</p></div>` : ''}
    <div style="text-align:center;padding:16px;margin-top:12px;">
      <p style="font-size:11px;color:#aaa;margin:0;">Powered by FinQuo Versity • Take the test at fqtest.finquo.com</p>
    </div>
  </div>
</body>
</html>`;
}

export async function downloadReportAsFile(html: string, filename: string) {
  const html2pdf = (await import('html2pdf.js')).default;
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const pdfFilename = filename.replace(/\.html$/i, '.pdf');

  try {
    await html2pdf()
      .set({
        margin: [4, 2, 4, 2],
        filename: pdfFilename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', 'div'] },
      })
      .from(container.firstElementChild || container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

// Legacy export for backward compat
export function openPrintableReport(html: string) {
  downloadReportAsFile(html, 'FQ-Test-Report.pdf');
}
