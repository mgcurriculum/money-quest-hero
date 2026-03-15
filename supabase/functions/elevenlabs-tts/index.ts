import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getApiKey(): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const { data } = await admin
        .from('admin_settings')
        .select('value')
        .eq('key', 'elevenlabs_api_key')
        .maybeSingle();
      const dbKey = (data?.value as any)?.key;
      if (dbKey) return dbKey;
    }
  } catch (e) {
    console.warn('Could not read API key from DB, falling back to env:', e.message);
  }
  return Deno.env.get('ELEVENLABS_API_KEY') || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();
    const ELEVENLABS_API_KEY = await getApiKey();

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const maxRetries = 3;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'Ih3XRGwQe2qczi6DzW48'}?output_format=mp3_22050_32`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true,
              speed: 1.0,
            },
          }),
        }
      );

      if (response.ok) break;

      if ((response.status === 409 || response.status === 429) && attempt < maxRetries - 1) {
        const delay = 1000 * (attempt + 1);
        console.log(`${response.status} received, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const errorText = await response.text();
      let parsed: any = null;
      try { parsed = JSON.parse(errorText); } catch { parsed = null; }

      const detailStatus = parsed?.detail?.status;
      const detailMessage = parsed?.detail?.message || errorText;

      if (detailStatus === 'quota_exceeded') {
        return new Response(
          JSON.stringify({ error: 'quota_exceeded', message: detailMessage }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `ElevenLabs API error [${response.status}]`, message: detailMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: 'TTS request failed after retries' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
