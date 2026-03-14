import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(JSON.stringify({ success: false, verified: false, error: 'Phone and OTP are required' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedPhone = String(phone).trim();
    const normalizedOtp = String(otp).trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const nowIso = new Date().toISOString();

    // Try to match an active OTP for this phone/code
    const { data: matchedRows, error: matchError } = await supabase
      .from('phone_otps')
      .select('id')
      .eq('phone', normalizedPhone)
      .eq('otp_code', normalizedOtp)
      .eq('verified', false)
      .gte('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1);

    if (matchError) {
      console.error('DB match query error:', matchError);
      return new Response(JSON.stringify({ success: false, verified: false, error: 'Verification service error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const matched = matchedRows?.[0];

    if (!matched) {
      // Check whether there is any active OTP for clearer message
      const { data: activeRows, error: activeError } = await supabase
        .from('phone_otps')
        .select('id')
        .eq('phone', normalizedPhone)
        .eq('verified', false)
        .gte('expires_at', nowIso)
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeError) {
        console.error('DB active query error:', activeError);
        return new Response(JSON.stringify({ success: false, verified: false, error: 'Verification service error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const errorMessage = activeRows && activeRows.length > 0
        ? 'Incorrect OTP. Please try again.'
        : 'No active OTP found. Please request a new one.';

      return new Response(JSON.stringify({ success: false, verified: false, error: errorMessage }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark matching OTP as verified
    const { error: updateError } = await supabase
      .from('phone_otps')
      .update({ verified: true })
      .eq('id', matched.id);

    if (updateError) {
      console.error('DB update error:', updateError);
      return new Response(JSON.stringify({ success: false, verified: false, error: 'Failed to update verification status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, verified: true }), {
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
