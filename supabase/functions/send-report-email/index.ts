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

    // Build HTML email body
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

    const htmlBody = `<!DOCTYPE html>
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
    <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e8e0f0;">
      <h2 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;text-align:center;margin:0 0 12px;">Dimension Breakdown</h2>
      <table style="width:100%;border-collapse:collapse;">${dimensionRows}</table>
    </div>
    ${qaHTML ? `<div style="margin-bottom:16px;"><h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">Your Answers</h2>${qaHTML}</div>` : ''}
    ${tipsHTML ? `<div style="margin-bottom:16px;"><h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">Personalized Tips</h2>${tipsHTML}</div>` : ''}
    ${suggestionsHTML ? `<div style="margin-bottom:16px;"><h2 style="font-size:15px;color:#2D1B69;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #4FC3F7;">Suggestions for You</h2>${suggestionsHTML}</div>` : ''}
    <div style="text-align:center;margin-top:20px;"><p style="font-size:11px;color:#aaa;">Powered by FinQuo Versity</p></div>
  </div>
</body>
</html>`;

    // Send via AWS SES using SigV4
    const subject = `Your Financial Intelligence Report from FinQuo Versity`;
    const plainText = `Hi ${playerName},\n\nThank you for completing the FQ Test on FinQuo Versity.\n\nYour FQ Score: ${fqScore}/1000\nBand: ${bandLevel}\n\nPlease view the HTML version of this email for your full detailed report with dimension breakdown, tips, and suggestions.\n\nBest regards,\nFinQuo Versity Team\nhttps://finquo.ai`;
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
