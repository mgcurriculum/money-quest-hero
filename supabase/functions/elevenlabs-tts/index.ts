import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey);
  }
  return null;
}

async function getApiKey(admin: ReturnType<typeof createClient> | null): Promise<string | null> {
  try {
    if (admin) {
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

async function logUsage(admin: ReturnType<typeof createClient> | null, textLength: number, voiceId: string | null, status: string, errorMessage?: string) {
  if (!admin) return;
  try {
    await admin.from('tts_usage_logs').insert({
      text_length: textLength,
      voice_id: voiceId || null,
      status,
      error_message: errorMessage || null,
    });
  } catch (e) {
    console.warn('Failed to log TTS usage:', e.message);
  }
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCachedAudio(admin: ReturnType<typeof createClient>, hash: string): Promise<ArrayBuffer | null> {
  try {
    const { data, error } = await admin.storage.from('tts-cache').download(`${hash}.mp3`);
    if (error || !data) return null;
    return await data.arrayBuffer();
  } catch {
    return null;
  }
}

async function setCachedAudio(admin: ReturnType<typeof createClient>, hash: string, audioBuffer: ArrayBuffer): Promise<void> {
  try {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    await admin.storage.from('tts-cache').upload(`${hash}.mp3`, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
  } catch (e) {
    console.warn('Failed to cache audio:', e.message);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const admin = getAdminClient();

  try {
    const { text, voiceId } = await req.json();
    const usedVoiceId = voiceId || 'Ih3XRGwQe2qczi6DzW48';
    const textLength = (text || '').length;

    // Check cache first
    if (admin && text) {
      const hash = await hashText(text + '::' + usedVoiceId);
      const cached = await getCachedAudio(admin, hash);
      if (cached) {
        await logUsage(admin, textLength, usedVoiceId, 'cached');
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      }
    }

    const ELEVENLABS_API_KEY = await getApiKey(admin);

    if (!ELEVENLABS_API_KEY) {
      await logUsage(admin, textLength, usedVoiceId, 'error', 'API key not configured');
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const maxRetries = 3;
    let response: Response | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${usedVoiceId}?output_format=mp3_22050_32`,
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
        await logUsage(admin, textLength, usedVoiceId, 'quota_exceeded', detailMessage);
        return new Response(
          JSON.stringify({ error: 'quota_exceeded', message: detailMessage }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await logUsage(admin, textLength, usedVoiceId, 'error', `[${response.status}] ${detailMessage}`);
      return new Response(
        JSON.stringify({ error: `ElevenLabs API error [${response.status}]`, message: detailMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response || !response.ok) {
      await logUsage(admin, textLength, usedVoiceId, 'error', 'Failed after retries');
      return new Response(
        JSON.stringify({ error: 'TTS request failed after retries' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success - cache the audio
    await logUsage(admin, textLength, usedVoiceId, 'success');
    const audioBuffer = await response.arrayBuffer();

    if (admin && text) {
      const hash = await hashText(text + '::' + usedVoiceId);
      await setCachedAudio(admin, hash, audioBuffer);
    }

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
