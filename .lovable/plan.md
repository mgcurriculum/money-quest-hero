

## Plan: Add ElevenLabs API Key Management to Admin Settings

### What
Add a section in the Admin Settings page where admins can view/update the ElevenLabs API key, stored in the `admin_settings` table. The edge function will read from this table first, falling back to the environment secret.

### Changes

1. **Admin Settings page** (`src/pages/admin/Settings.tsx`)
   - Add an "API Keys" card with a masked input field for the ElevenLabs API key
   - Load the key from `admin_settings` table (key: `elevenlabs_api_key`)
   - Save button to upsert the key (reusing existing `upsert` helper)
   - Show the key masked (e.g., `sk_****...aec`) with a show/hide toggle

2. **Edge Function** (`supabase/functions/elevenlabs-tts/index.ts`)
   - Before using `Deno.env.get('ELEVENLABS_API_KEY')`, check if `admin_settings` has an `elevenlabs_api_key` entry
   - If found, use that value; otherwise fall back to the environment secret
   - This requires creating a Supabase admin client in the edge function using the service role key

### Security Note
The API key will be stored in the `admin_settings` table which is already protected by RLS (admin-only access). The edge function will read it using the service role key, bypassing RLS safely server-side.

