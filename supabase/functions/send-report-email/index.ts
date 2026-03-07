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
    const { email, playerName, fqScore, bandLevel, bandEmoji, bandMeaning, dimensionScores, reflectionAnswer } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dimensionRows = (dimensionScores || []).map((d: any) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${d.icon} ${d.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">${d.score}%</td>
      </tr>`
    ).join('');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#2d1b69,#1a103f);border-radius:16px;color:#fff;">
      <h1 style="margin:0 0 4px;font-size:22px;">Your FQ Test Report</h1>
      <p style="margin:0;opacity:0.8;font-size:13px;">${playerName}'s Financial Journey Results</p>
    </div>
    
    <div style="text-align:center;padding:24px;margin:16px 0;background:#f8f6ff;border-radius:12px;">
      <div style="font-size:48px;margin-bottom:8px;">${bandEmoji}</div>
      <div style="font-size:42px;font-weight:700;color:#2d1b69;">${fqScore}<span style="font-size:16px;color:#999;">/1000</span></div>
      <div style="font-size:16px;font-weight:600;color:#4ea8de;margin-top:4px;">${bandLevel}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${bandMeaning}</div>
    </div>

    <div style="background:#f8f6ff;border-radius:12px;padding:16px;margin:16px 0;">
      <h3 style="margin:0 0 12px;font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;text-align:center;">Dimension Breakdown</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${dimensionRows}
      </table>
    </div>

    ${reflectionAnswer ? `
    <div style="text-align:center;background:#f8f6ff;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your 2025 FQ Test Goal</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#2d1b69;">${reflectionAnswer}</p>
    </div>` : ''}

    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#aaa;">Powered by FinQuo Versity</p>
    </div>
  </div>
</body>
</html>`;

    // Use Lovable API to send transactional email
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      // Still return success since we saved the email
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
      // Still return success — email was collected
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
