

## Plan: Pre-Generate All TTS Audio from Admin Panel

### Idea
Add a "Generate All Audio" button in the admin Settings page that pre-generates all narration audio files via ElevenLabs and stores them in the `tts-cache` storage bucket. The client-side hook then always loads from cache first, eliminating runtime API calls.

### All Narration Texts to Pre-Generate

There are 7 fixed narration texts used across screens:

1. **Welcome**: "Hey there! I'm your financial guide..."
2. **Consent**: "Alright, just a quick heads up!..."
3. **Profile Step 0**: "Let's get to know you a bit!..."
4. **Profile Step 1**: "Almost there! What best describes..."
5. **Reflection Step 0**: "We're almost done! I'm curious..."
6. **Reflection Step 1**: "Last question! If you could level up..."
7. **Question Play** (template): "Question {N}. Read through and pick the answer that feels most like you." — generates for N = 1 to 18

**Total: ~24 audio files**

### Changes

**1. New edge function: `supabase/functions/generate-all-tts/index.ts`**
- Accepts POST request (admin-only, no JWT verification needed since it's called from admin UI)
- Defines the full list of narration texts (hardcoded + question templates 1-18)
- For each text: compute SHA-256 hash (matching existing cache key format: `text + '::' + voiceId`), check if already cached in `tts-cache`, skip if exists, otherwise call ElevenLabs API and upload to cache
- Returns progress/results JSON (count generated, count skipped, errors)
- Includes delay between API calls to avoid rate limits

**2. New admin component: `src/components/admin/TTSPreGenerateCard.tsx`**
- Card with "Generate All Audio" button
- Shows progress during generation (e.g., "Generating 5/24...")
- Displays results: how many generated, skipped (already cached), failed
- Placed in the Settings page alongside existing TTS cards

**3. Update `src/pages/admin/Settings.tsx`**
- Import and render `TTSPreGenerateCard`

**4. Update `supabase/config.toml`**
- Add `[functions.generate-all-tts]` with `verify_jwt = false`

### How Cache Lookup Works (Already Implemented)
The existing edge function `elevenlabs-tts` already uses SHA-256 hash of `text + '::' + voiceId` to check `tts-cache` bucket before calling ElevenLabs. So pre-generated files will be served automatically with zero changes to the client.

### No Database Changes Required
Uses existing `tts-cache` storage bucket and `tts_usage_logs` table.

