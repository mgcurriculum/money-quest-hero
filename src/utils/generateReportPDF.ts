import {
  dimensionLabels,
  dimensionIcons,
  archetypes,
  realityQuestions,
  levels,
  type RealityQuestion,
} from '@/data/questions';

export interface QAEntry {
  levelTitle: string;
  levelIcon: string;
  question: string;
  selectedOption: string;
  selectedEmoji: string;
  score: number;
}

export function extractQuestionsAndAnswers(
  answers: { [level: number]: { [q: number]: number } }
): QAEntry[] {
  const entries: QAEntry[] = [];

  // Level 0 — Reality Check
  const level0Answers = answers[0] || {};
  realityQuestions.forEach((rq: RealityQuestion, qIdx: number) => {
    const score = level0Answers[qIdx];
    if (score !== undefined) {
      const optIdx = score - 1;
      const opt = rq.options[optIdx];
      entries.push({
        levelTitle: levels[0].title,
        levelIcon: levels[0].icon,
        question: rq.question,
        selectedOption: opt?.text || `Option ${score}`,
        selectedEmoji: opt?.emoji || '',
        score,
      });
    }
  });

  // Levels 1-6 — Scenarios
  for (let lvl = 1; lvl <= 6; lvl++) {
    const levelAnswers = answers[lvl] || {};
    const levelData = levels[lvl];
    if (!levelData) continue;
    levelData.scenarios.forEach((scenario, sIdx) => {
      const score = levelAnswers[sIdx];
      if (score !== undefined) {
        const optIdx = score - 1;
        const opt = scenario.options[optIdx];
        entries.push({
          levelTitle: levelData.title,
          levelIcon: levelData.icon,
          question: scenario.situation,
          selectedOption: opt?.text || `Option ${score}`,
          selectedEmoji: opt?.emoji || '',
          score,
        });
      }
    });
  }

  return entries;
}

export function getFinancialTips(normalizedScores: number[]): { tips: string[]; suggestions: string[] } {
  const tips: string[] = [];

  normalizedScores.forEach((score, i) => {
    const arch = archetypes[i];
    if (score < 50) {
      tips.push(`${dimensionIcons[i]} ${dimensionLabels[i]}: ${arch.low.risk} — ${arch.low.quest}`);
    } else {
      tips.push(`${dimensionIcons[i]} ${dimensionLabels[i]}: ${arch.high.strength} — ${arch.high.quest}`);
    }
  });

  const suggestions = [
    "📝 Create a monthly budget and review it every week to stay on track.",
    "🏦 Open a dedicated savings account and automate a fixed monthly transfer.",
    "📚 Read or listen to one personal finance resource every month.",
    "🛡️ Never share OTPs, PINs, or passwords — even with people claiming to be from your bank.",
    "📈 Start small with investments — even ₹500/month in a mutual fund SIP can build wealth over time.",
  ];

  return { tips, suggestions };
}

export function generateReportHTML(params: {
  logoUrl?: string;
  fqScore: number;
  bandLevel: string;
  bandEmoji: string;
  bandMeaning: string;
  normalizedScores: number[];
  questionsAndAnswers: QAEntry[];
  tips: string[];
  suggestions: string[];
  reflectionAnswer?: string;
}): string {
  const {
    logoUrl, playerName, fqScore, bandLevel, bandEmoji, bandMeaning,
    normalizedScores, questionsAndAnswers, tips, suggestions,
    reflectionAnswer,
  } = params;

  const dimensionRows = dimensionLabels.map((label, i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;color:#333;">${dimensionIcons[i]} ${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;width:55%;">
        <div style="background:#e8e0f0;border-radius:8px;height:12px;overflow:hidden;">
          <div style="height:100%;border-radius:8px;background:linear-gradient(90deg,#4FC3F7,#7C4DFF);width:${Math.round(normalizedScores[i])}%;"></div>
        </div>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;font-weight:700;color:#2D1B69;text-align:right;">${Math.round(normalizedScores[i])}%</td>
    </tr>
  `).join('');

  // Group Q&A by level
  const qaByLevel: Record<string, QAEntry[]> = {};
  questionsAndAnswers.forEach(qa => {
    const key = `${qa.levelIcon} ${qa.levelTitle}`;
    if (!qaByLevel[key]) qaByLevel[key] = [];
    qaByLevel[key].push(qa);
  });

  const qaHTML = Object.entries(qaByLevel).map(([levelName, qas]) => `
    <div style="margin-bottom:16px;">
      <h3 style="font-size:15px;color:#2D1B69;margin:0 0 8px;padding:8px 12px;background:#f0ebff;border-radius:8px;">${levelName}</h3>
      ${qas.map((qa, idx) => `
        <div style="padding:10px 12px;border-left:3px solid #4FC3F7;margin-bottom:8px;background:#fafafa;border-radius:0 8px 8px 0;">
          <p style="font-size:13px;color:#555;margin:0 0 6px;line-height:1.4;">${idx + 1}. ${qa.question.replace(/[🎬🎨🛍️⚡📞😨🎮🏛️🎰🕸️📱🎁]/g, '').trim()}</p>
          <p style="font-size:13px;font-weight:600;color:#2D1B69;margin:0;">${qa.selectedEmoji} ${qa.selectedOption} <span style="color:#4FC3F7;font-size:11px;margin-left:8px;">(Score: ${qa.score}/5)</span></p>
        </div>
      `).join('')}
    </div>
  `).join('');

  const tipsHTML = tips.map(t => `
    <div style="padding:10px 14px;background:#f8f6ff;border-radius:8px;margin-bottom:6px;font-size:13px;color:#333;line-height:1.5;">${t}</div>
  `).join('');

  const suggestionsHTML = suggestions.map(s => `
    <div style="padding:10px 14px;background:#e8f5e9;border-radius:8px;margin-bottom:6px;font-size:13px;color:#2e7d32;line-height:1.5;">${s}</div>
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

    <!-- Header -->
    <div style="text-align:center;padding:28px 24px;background:linear-gradient(135deg,#2D1B69,#1a103f);border-radius:16px;color:#fff;margin-bottom:20px;">
      ${logoUrl ? `<img src="${logoUrl}" alt="FinQuo Versity" style="width:100px;height:auto;margin:0 auto 12px;display:block;" />` : ''}
      <h1 style="margin:0 0 4px;font-size:24px;">FQ Test Report</h1>
      <p style="margin:0;opacity:0.7;font-size:13px;">${playerName}'s Financial Journey Results</p>
    </div>

    <!-- FQ Score -->
    <div style="text-align:center;padding:24px;background:#f8f6ff;border-radius:16px;margin-bottom:20px;border:1px solid #e8e0f0;">
      <div style="font-size:52px;margin-bottom:4px;">${bandEmoji}</div>
      <div style="font-size:48px;font-weight:800;color:#2D1B69;">${fqScore}<span style="font-size:18px;color:#999;font-weight:400;">/1000</span></div>
      <div style="font-size:18px;font-weight:700;color:#4FC3F7;margin-top:4px;">${bandLevel}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${bandMeaning}</div>
    </div>


    <!-- Dimension Breakdown -->
    <div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:20px;border:1px solid #e8e0f0;">
      <h2 style="font-size:14px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:center;margin:0 0 12px;">Dimension Breakdown</h2>
      <table style="width:100%;border-collapse:collapse;">${dimensionRows}</table>
    </div>

    <!-- Q&A Section -->
    <div class="page-break" style="margin-bottom:20px;">
      <h2 style="font-size:16px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">📝 Your Answers</h2>
      ${qaHTML}
    </div>

    <!-- Financial Tips -->
    <div class="page-break" style="margin-bottom:20px;">
      <h2 style="font-size:16px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">🎯 Personalized Financial Tips</h2>
      ${tipsHTML}
    </div>

    <!-- Suggestions -->
    <div style="margin-bottom:20px;">
      <h2 style="font-size:16px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">💡 Suggestions for You</h2>
      ${suggestionsHTML}
    </div>


    <!-- Footer -->
    <div style="text-align:center;padding:16px;margin-top:12px;">
      <p style="font-size:11px;color:#aaa;margin:0;">Powered by FinQuo Versity • Take the test at fqtest.finquo.com</p>
    </div>
  </div>
</body>
</html>`;
}

export function openPrintableReport(html: string) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to download your report.');
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 500);
}
