import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// AWS Signature V4 helpers
function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key instanceof ArrayBuffer ? key : key.buffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function sha256(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)));
}

async function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode('AWS4' + secretKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email, playerName, profileLabel, fqScore, maxScore, bandLevel, bandEmoji, bandMeaning,
      dimensionScores, reflectionAnswer, questionsAndAnswers, tips,
    } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION') || 'ap-south-1';
    const fromEmail = Deno.env.get('AWS_SES_FROM_EMAIL') || 'info@finquo.ai';

    if (!accessKeyId || !secretAccessKey) {
      console.error('AWS credentials not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalMaxScore = maxScore || 810;
    const scorePercent = Math.round((fqScore / totalMaxScore) * 100);

    // Dimension rows
    const dimensionRows = (dimensionScores || []).map((d: any) => {
      const pct = d.score ?? d.percentage ?? 0;
      const label = d.label ?? d.dimension ?? '';
      const icon = d.icon ?? '';
      return `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;font-size:13px;color:#333;white-space:nowrap;vertical-align:middle;">
          <span style="font-size:16px;margin-right:6px;">${icon}</span>${label}
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;width:45%;vertical-align:middle;">
          <div style="background:#f0f0f0;border-radius:10px;height:14px;overflow:hidden;">
            <div style="height:100%;border-radius:10px;background:linear-gradient(90deg,#6C63FF,#4FC3F7);width:${pct}%;min-width:${pct > 0 ? '8px' : '0'};"></div>
          </div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;font-size:12px;font-weight:700;text-align:right;vertical-align:middle;white-space:nowrap;">
          <span style="color:${getScoreColor(pct)};background:${getScoreBg(pct)};padding:3px 10px;border-radius:12px;">${pct}%</span>
        </td>
      </tr>`;
    }).join('');

    // Group Q&A by dimension
    const qaByDim: Record<string, any[]> = {};
    (questionsAndAnswers || []).forEach((qa: any) => {
      const key = qa.dimension || 'General';
      if (!qaByDim[key]) qaByDim[key] = [];
      qaByDim[key].push(qa);
    });

    const maxScorePerQ = 45;
    const qaHTML = Object.entries(qaByDim).map(([dim, qas]) => `
      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:#2D1B69;padding:10px 16px;background:linear-gradient(135deg,#f0ebff,#e8e0f0);border-radius:10px;margin-bottom:10px;">${dim}</div>
        ${qas.map((qa: any) => {
          const qScore = qa.score || 0;
          const scorePct = (qScore / maxScorePerQ) * 100;
          return `
          <div style="padding:12px 16px;border-left:4px solid #6C63FF;margin-bottom:8px;background:#fafbfc;border-radius:0 10px 10px 0;">
            <p style="font-size:12px;color:#555;margin:0 0 8px;line-height:1.5;">
              <span style="font-weight:700;color:#333;">Q${qa.questionNo}.</span> ${qa.question}
            </p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <p style="font-size:12px;font-weight:600;color:#2D1B69;margin:0;">✓ ${qa.selectedOption}</p>
              <span style="font-size:11px;font-weight:700;color:${getScoreColor(scorePct)};background:${getScoreBg(scorePct)};padding:2px 8px;border-radius:8px;white-space:nowrap;">${qScore}/${maxScorePerQ}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    `).join('');

    const tipsHTML = (tips || []).map((t: string) => `
      <div style="padding:12px 16px;background:#f8f6ff;border-radius:10px;margin-bottom:8px;font-size:12px;color:#333;line-height:1.6;border-left:4px solid #6C63FF;">${t}</div>
    `).join('');

    const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="text-align:center;padding:32px 24px;background:linear-gradient(135deg,#2D1B69 0%,#1a103f 50%,#0f0a2e 100%);color:#fff;">
        <div style="font-size:11px;font-weight:600;letter-spacing:2px;opacity:0.6;margin-bottom:6px;">FINQUO VERSITY</div>
        <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-0.5px;">FQ Test Report</h1>
        <p style="margin:0;opacity:0.6;font-size:12px;">${playerName}${profileLabel ? ` • ${profileLabel}` : ''}</p>
      </div>

      <!-- Score -->
      <div style="text-align:center;padding:28px 24px;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:52px;margin-bottom:8px;line-height:1;">${bandEmoji}</div>
        <div style="font-size:48px;font-weight:800;color:#2D1B69;line-height:1;">${fqScore}<span style="font-size:16px;color:#aaa;font-weight:400;">/${totalMaxScore}</span></div>
        <div style="margin:12px auto;width:200px;height:8px;background:#f0f0f0;border-radius:8px;overflow:hidden;">
          <div style="height:100%;width:${scorePercent}%;background:linear-gradient(90deg,#6C63FF,#4FC3F7);border-radius:8px;"></div>
        </div>
        <div style="font-size:12px;color:#999;margin-top:8px;">You are</div>
        <div style="font-size:18px;font-weight:700;color:#6C63FF;margin-top:4px;">${bandEmoji} ${bandLevel}</div>
        <div style="font-size:12px;color:#888;margin-top:6px;">${bandMeaning}</div>
      </div>

      <!-- Dimensions -->
      <div style="padding:24px;">
        <h2 style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;text-align:center;margin:0 0 16px;font-weight:600;">Dimension Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;">${dimensionRows}</table>
      </div>

      <!-- Q&A -->
      ${qaHTML ? `
      <div style="padding:0 24px 24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #6C63FF;">
          <span style="font-size:16px;">📝</span>
          <h2 style="font-size:15px;color:#2D1B69;margin:0;font-weight:700;">Your Answers</h2>
        </div>
        ${qaHTML}
      </div>` : ''}

      <!-- Tips -->
      ${tipsHTML ? `
      <div style="padding:0 24px 24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:10px;border-bottom:3px solid #6C63FF;">
          <span style="font-size:16px;">🎯</span>
          <h2 style="font-size:15px;color:#2D1B69;margin:0;font-weight:700;">Financial Tips</h2>
        </div>
        ${tipsHTML}
      </div>` : ''}

      <!-- Reflection -->
      ${reflectionAnswer ? `
      <div style="padding:0 24px 24px;">
        <div style="padding:16px;background:linear-gradient(135deg,#f0f7ff,#e8f0fe);border-radius:12px;border:1px solid #d0e0f0;">
          <p style="font-size:10px;color:#888;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">💭 Your Reflection</p>
          <p style="font-size:13px;color:#333;margin:0;line-height:1.6;">${reflectionAnswer}</p>
        </div>
      </div>` : ''}

      <!-- Footer -->
      <div style="text-align:center;padding:20px 24px;background:#fafafa;border-top:1px solid #eee;">
        <p style="font-size:11px;color:#bbb;margin:0 0 4px;">Powered by <strong style="color:#999;">FinQuo Versity</strong></p>
        <p style="font-size:10px;color:#ccc;margin:0;">Take the test at fqtest.finquo.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send via AWS SES using SigV4
    const subject = `Your FQ Test Report — ${bandEmoji} ${bandLevel} (${fqScore}/${totalMaxScore})`;
    const plainText = `Hi ${playerName},\n\nThank you for completing the FQ Test on FinQuo Versity.\n\nYour FQ Score: ${fqScore}/${totalMaxScore}\nBand: ${bandLevel}\n${bandMeaning}\n\nPlease view the HTML version of this email for your full detailed report.\n\nBest regards,\nFinQuo Versity Team\nhttps://finquo.ai`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const dateStamp = amzDate.slice(0, 8);
    const service = 'ses';
    const host = `email.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;

    const params = new URLSearchParams();
    params.append('Action', 'SendEmail');
    params.append('Source', `FinQuo Versity <${fromEmail}>`);
    params.append('ReplyToAddresses.member.1', fromEmail);
    params.append('Destination.ToAddresses.member.1', email);
    params.append('Message.Subject.Data', subject);
    params.append('Message.Subject.Charset', 'UTF-8');
    params.append('Message.Body.Html.Data', htmlBody);
    params.append('Message.Body.Html.Charset', 'UTF-8');
    params.append('Message.Body.Text.Data', plainText);
    params.append('Message.Body.Text.Charset', 'UTF-8');
    params.append('Version', '2010-12-01');

    const requestBody = params.toString();
    const payloadHash = await sha256(requestBody);
    const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-date';
    const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = toHex(await hmac(signingKey, stringToSign));
    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const sesResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': host,
        'X-Amz-Date': amzDate,
        'Authorization': authHeader,
      },
      body: requestBody,
    });

    if (!sesResponse.ok) {
      const errText = await sesResponse.text();
      console.error('SES send failed:', sesResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Email sent successfully via AWS SES to:', email);
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
