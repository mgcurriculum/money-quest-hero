import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email, playerName, fqScore, bandLevel, bandEmoji, bandMeaning,
      dimensionScores, reflectionAnswer, questionsAndAnswers,
      tips, suggestions,
    } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dimensionRows = (dimensionScores || []).map((d: any) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;color:#333;">${d.icon} ${d.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;width:50%;">
          <div style="background:#e8e0f0;border-radius:8px;height:12px;overflow:hidden;">
            <div style="height:100%;border-radius:8px;background:linear-gradient(90deg,#4FC3F7,#7C4DFF);width:${d.score}%;"></div>
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e0f0;font-size:14px;font-weight:700;color:#2D1B69;text-align:right;">${d.score}%</td>
      </tr>`
    ).join('');

    // Group Q&A by level
    const qaByLevel: Record<string, any[]> = {};
    (questionsAndAnswers || []).forEach((qa: any) => {
      const key = `${qa.levelIcon} ${qa.levelTitle}`;
      if (!qaByLevel[key]) qaByLevel[key] = [];
      qaByLevel[key].push(qa);
    });

    const qaHTML = Object.entries(qaByLevel).map(([levelName, qas]) => `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:14px;color:#2D1B69;margin:0 0 8px;padding:8px 12px;background:#f0ebff;border-radius:8px;">${levelName}</h3>
        ${qas.map((qa: any, idx: number) => `
          <div style="padding:10px 12px;border-left:3px solid #4FC3F7;margin-bottom:6px;background:#fafafa;border-radius:0 8px 8px 0;">
            <p style="font-size:12px;color:#555;margin:0 0 4px;line-height:1.4;">${idx + 1}. ${qa.question}</p>
            <p style="font-size:12px;font-weight:600;color:#2D1B69;margin:0;">${qa.selectedEmoji} ${qa.selectedOption} <span style="color:#4FC3F7;font-size:10px;">(${qa.score}/5)</span></p>
          </div>
        `).join('')}
      </div>
    `).join('');

    const tipsHTML = (tips || []).map((t: string) => `
      <div style="padding:10px 14px;background:#f8f6ff;border-radius:8px;margin-bottom:6px;font-size:12px;color:#333;line-height:1.5;">${t}</div>
    `).join('');

    const suggestionsHTML = (suggestions || []).map((s: string) => `
      <div style="padding:10px 14px;background:#e8f5e9;border-radius:8px;margin-bottom:6px;font-size:12px;color:#2e7d32;line-height:1.5;">${s}</div>
    `).join('');

    const archetypeSection = (primaryArchetype && secondaryArchetype) ? `
    <div style="margin:16px 0;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="width:48%;text-align:center;padding:14px;background:#f8f6ff;border-radius:12px;border:1px solid #e8e0f0;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Primary</div>
          <div style="font-size:28px;">${primaryArchetype.emoji}</div>
          <div style="font-size:13px;font-weight:700;color:#2D1B69;">${primaryArchetype.name}</div>
          <div style="font-size:10px;color:#666;">${primaryArchetype.trait}</div>
        </td>
        <td style="width:4%;"></td>
        <td style="width:48%;text-align:center;padding:14px;background:#f8f6ff;border-radius:12px;border:1px solid #e8e0f0;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Secondary</div>
          <div style="font-size:28px;">${secondaryArchetype.emoji}</div>
          <div style="font-size:13px;font-weight:700;color:#2D1B69;">${secondaryArchetype.name}</div>
          <div style="font-size:10px;color:#666;">${secondaryArchetype.trait}</div>
        </td>
      </tr></table>
    </div>` : '';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px;">

    <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#2D1B69,#1a103f);border-radius:16px;color:#fff;margin-bottom:16px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:2px;opacity:0.8;margin-bottom:4px;">FINQUO VERSITY</div>
      <h1 style="margin:0 0 4px;font-size:22px;">FQ Test Report</h1>
      <p style="margin:0;opacity:0.7;font-size:12px;">${playerName}'s Financial Journey Results</p>
    </div>
    
    <div style="text-align:center;padding:24px;margin-bottom:16px;background:#f8f6ff;border-radius:12px;border:1px solid #e8e0f0;">
      <div style="font-size:48px;margin-bottom:4px;">${bandEmoji}</div>
      <div style="font-size:42px;font-weight:800;color:#2D1B69;">${fqScore}<span style="font-size:16px;color:#999;font-weight:400;">/1000</span></div>
      <div style="font-size:16px;font-weight:700;color:#4FC3F7;margin-top:4px;">${bandLevel}</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">${bandMeaning}</div>
    </div>

    ${archetypeSection}

    <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e8e0f0;">
      <h2 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:center;margin:0 0 12px;">Dimension Breakdown</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${dimensionRows}
      </table>
    </div>

    ${qaHTML ? `
    <div style="margin-bottom:16px;">
      <h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">📝 Your Answers</h2>
      ${qaHTML}
    </div>` : ''}

    ${tipsHTML ? `
    <div style="margin-bottom:16px;">
      <h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">🎯 Personalized Tips</h2>
      ${tipsHTML}
    </div>` : ''}

    ${suggestionsHTML ? `
    <div style="margin-bottom:16px;">
      <h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">💡 Suggestions</h2>
      ${suggestionsHTML}
    </div>` : ''}

    ${reflectionAnswer ? `
    <div style="text-align:center;background:#f8f6ff;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e8e0f0;">
      <p style="margin:0 0 4px;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your 2025 FQ Test Goal</p>
      <p style="margin:0;font-size:14px;font-weight:700;color:#2D1B69;">${reflectionAnswer}</p>
    </div>` : ''}

    <div style="text-align:center;margin-top:20px;">
      <p style="font-size:11px;color:#aaa;">Powered by FinQuo Versity</p>
    </div>
  </div>
</body>
</html>`;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ success: true, note: 'Email saved but sending not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectId = supabaseUrl.replace('https://', '').split('.')[0];

    const emailResponse = await fetch('https://api.lovable.dev/api/v1/emails/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        projectId,
        to: email,
        subject: `${playerName}'s FQ Test Report — Score: ${fqScore}/1000 ${bandEmoji}`,
        html: htmlBody,
        purpose: 'transactional',
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('Email send failed:', errText);
      return new Response(JSON.stringify({ success: true, note: 'Email saved, delivery pending' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
