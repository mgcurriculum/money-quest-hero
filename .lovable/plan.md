

## Plan: Log ElevenLabs TTS Consumption in Admin Dashboard

### What
Track every TTS API call (text length, character count, success/failure, timestamp) in a new `tts_usage_logs` table and display a usage summary in the Admin Settings page.

### Changes

#### 1. New database table: `tts_usage_logs`
```sql
CREATE TABLE public.tts_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  text_length integer NOT NULL DEFAULT 0,
  voice_id text,
  status text NOT NULL DEFAULT 'success',
  error_message text
);
ALTER TABLE public.tts_usage_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can read logs
CREATE POLICY "Admins can read tts logs" ON public.tts_usage_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
-- Edge function inserts via service role (bypasses RLS)
```

#### 2. Edge Function (`supabase/functions/elevenlabs-tts/index.ts`)
After each TTS call (success or failure), insert a row into `tts_usage_logs` with:
- `text_length`: character count of the input text
- `voice_id`: the voice used
- `status`: 'success', 'error', or 'quota_exceeded'
- `error_message`: error detail if failed

Uses the existing service-role admin client already created in `getApiKey()`.

#### 3. Admin Settings page (`src/pages/admin/Settings.tsx`)
Add an "ElevenLabs Usage" card below the API Keys card showing:
- **Today's characters used** (sum of text_length for today)
- **This month's characters used** (sum for current month)
- **Total requests** (count all-time)
- **Recent log table** (last 20 entries with timestamp, characters, status)

Data fetched from `tts_usage_logs` table on page load.

