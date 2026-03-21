import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function signAndFetch(
  method: string,
  host: string,
  endpoint: string,
  service: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  requestBody: string,
  contentType: string,
): Promise<Response> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = await sha256(requestBody);
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const canonicalRequest = `${method}\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(signingKey, stringToSign));
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return fetch(endpoint, {
    method,
    headers: {
      'Content-Type': contentType,
      'Host': host,
      'X-Amz-Date': amzDate,
      'Authorization': authHeader,
    },
    body: requestBody,
  });
}

async function sendSMS(
  phone: string,
  message: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
): Promise<boolean> {
  try {
    const host = `sns.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;

    const params = new URLSearchParams();
    params.append('Action', 'Publish');
    params.append('PhoneNumber', phone);
    params.append('Message', message);
    params.append('MessageAttributes.entry.1.Name', 'AWS.SNS.SMS.SenderID');
    params.append('MessageAttributes.entry.1.Value.DataType', 'String');
    params.append('MessageAttributes.entry.1.Value.StringValue', 'FinQuo');
    params.append('MessageAttributes.entry.2.Name', 'AWS.SNS.SMS.SMSType');
    params.append('MessageAttributes.entry.2.Value.DataType', 'String');
    params.append('MessageAttributes.entry.2.Value.StringValue', 'Transactional');
    params.append('Version', '2010-03-31');

    const response = await signAndFetch(
      'POST', host, endpoint, 'sns', region,
      accessKeyId, secretAccessKey,
      params.toString(), 'application/x-www-form-urlencoded',
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('SNS send failed:', response.status, errText);
      return false;
    }
    console.log('OTP sent via SMS to:', phone);
    return true;
  } catch (err) {
    console.error('SMS send error:', err);
    return false;
  }
}

async function sendEmail(
  email: string,
  otpCode: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  fromEmail: string,
): Promise<boolean> {
  try {
    const host = `email.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;

    const subject = 'Your FinQuo Versity Verification Code';
    const bodyHtml = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a1a2e;margin-bottom:16px;">FinQuo Versity</h2>
        <p style="color:#333;font-size:16px;">Your verification code is:</p>
        <div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#d4a843;">${otpCode}</span>
        </div>
        <p style="color:#666;font-size:14px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
      </div>
    `;
    const bodyText = `Your FinQuo Versity verification code is: ${otpCode}. Valid for 5 minutes.`;

    const params = new URLSearchParams();
    params.append('Action', 'SendEmail');
    params.append('Source', fromEmail);
    params.append('Destination.ToAddresses.member.1', email);
    params.append('Message.Subject.Data', subject);
    params.append('Message.Subject.Charset', 'UTF-8');
    params.append('Message.Body.Html.Data', bodyHtml);
    params.append('Message.Body.Html.Charset', 'UTF-8');
    params.append('Message.Body.Text.Data', bodyText);
    params.append('Message.Body.Text.Charset', 'UTF-8');

    const response = await signAndFetch(
      'POST', host, endpoint, 'ses', region,
      accessKeyId, secretAccessKey,
      params.toString(), 'application/x-www-form-urlencoded',
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('SES send failed:', response.status, errText);
      return false;
    }
    console.log('OTP sent via email to:', email);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, email } = await req.json();

    if (!phone || phone.length < 10) {
      return new Response(JSON.stringify({ error: 'Valid phone number is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const region = Deno.env.get('AWS_REGION') || 'ap-south-1';
    const fromEmail = Deno.env.get('AWS_SES_FROM_EMAIL') || '';

    if (!accessKeyId || !secretAccessKey) {
      console.error('AWS credentials not configured');
      return new Response(JSON.stringify({ error: 'SMS service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('phone_otps').insert({
      phone,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
    });

    // Send OTP via SMS
    const smsMessage = `Your FinQuo Versity verification code is: ${otpCode}. Valid for 5 minutes.`;
    const smsSuccess = await sendSMS(phone, smsMessage, region, accessKeyId, secretAccessKey);

    // Send OTP via Email (if email provided)
    let emailSuccess = false;
    if (email && email.includes('@') && fromEmail) {
      emailSuccess = await sendEmail(email, otpCode, region, accessKeyId, secretAccessKey, fromEmail);
    }

    // If BOTH fail, return error
    if (!smsSuccess && !emailSuccess) {
      return new Response(JSON.stringify({ error: 'Failed to send OTP. Please try again.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`OTP sent — SMS: ${smsSuccess}, Email: ${emailSuccess}`);
    return new Response(JSON.stringify({
      success: true,
      smsSent: smsSuccess,
      emailSent: emailSuccess,
    }), {
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
