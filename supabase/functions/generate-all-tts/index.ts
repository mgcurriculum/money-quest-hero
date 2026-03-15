import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NARRATION_TEXTS = [
  // Welcome
  "Hey there! I'm your financial guide. This is a quick quiz that'll help you understand how smart you really are with money. It only takes about 3 minutes. Ready? Just tap Start!",
  // Consent
  "Alright, just a quick heads up! We need your consent before we start. Don't worry, your data stays safe and private. Just check both boxes and we're good to go!",
  // Profile Step 0
  "Let's get to know you a bit! Fill in your details to personalize your results.",
  // Profile Step 1
  "Almost there! What best describes your current role?",
  // Reflection Step 0
  "We're almost done! I'm curious — how interested are you in actually getting better with finances? Be honest!",
  // Reflection Step 1
  "Last question! If you could level up just one financial skill this year, which would it be? Pick the one that matters most to you.",
];

// Report page narration
NARRATION_TEXTS.push("Here's your FQ Test report! Your overall score shows how financially aware you are. Check out the radar chart to see how you performed across six key dimensions like Earning, Spending, Saving, and more. You can download your report, share it with friends, or even take the test again to improve your score!");

// Question 1 with full instructions
NARRATION_TEXTS.push(`Question 1. Read through and pick the answer that feels most like you.`);
// Questions 2-18 short
for (let i = 2; i <= 18; i++) {
  NARRATION_TEXTS.push(`Question ${i}`);
}

const DEFAULT_VOICE_ID = 'Ih3XRGwQe2qczi6DzW48';

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Get API key from DB or env
  let apiKey: string | null = null;
  try {
    const { data } = await admin.from('admin_settings').select('value').eq('key', 'elevenlabs_api_key').maybeSingle();
    apiKey = (data?.value as any)?.key || null;
  } catch { /* ignore */ }
  if (!apiKey) apiKey = Deno.env.get('ELEVENLABS_API_KEY') || null;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const voiceId = DEFAULT_VOICE_ID;
  const results: { text: string; status: string; error?: string }[] = [];
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < NARRATION_TEXTS.length; i++) {
    const text = NARRATION_TEXTS[i];
    const hash = await hashText(text + '::' + voiceId);
    const filePath = `${hash}.mp3`;

    // Check if already cached
    const { data: existing } = await admin.storage.from('tts-cache').download(filePath);
    if (existing) {
      skipped++;
      results.push({ text: text.slice(0, 50) + '...', status: 'skipped' });
      continue;
    }

    // Generate via ElevenLabs
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
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

      if (!response.ok) {
        const errText = await response.text();
        failed++;
        results.push({ text: text.slice(0, 50) + '...', status: 'failed', error: `[${response.status}] ${errText.slice(0, 100)}` });
        continue;
      }

      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      await admin.storage.from('tts-cache').upload(filePath, blob, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

      // Log usage
      await admin.from('tts_usage_logs').insert({
        text_length: text.length,
        voice_id: voiceId,
        status: 'success',
      });

      generated++;
      results.push({ text: text.slice(0, 50) + '...', status: 'generated' });

      // Rate limit delay: 500ms between calls
      if (i < NARRATION_TEXTS.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      failed++;
      results.push({ text: text.slice(0, 50) + '...', status: 'failed', error: err.message });
    }
  }

  return new Response(JSON.stringify({
    total: NARRATION_TEXTS.length,
    generated,
    skipped,
    failed,
    results,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
