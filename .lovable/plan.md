

## Plan: Cache TTS Audio in Storage to Eliminate Redundant API Calls

### Problem
Every user session calls ElevenLabs API for the same static narration texts (welcome, consent, profile, reflection, question prompts). This wastes API quota and adds latency.

### Solution
Store generated audio files in a storage bucket. The edge function checks for a cached file before calling ElevenLabs. On cache miss, it generates audio, stores it, and returns it. On cache hit, it serves the stored file directly — zero API calls, instant playback.

### Static Texts to Cache (identified from codebase)
- **WelcomeScreen**: 1 fixed text
- **ConsentScreen**: 1 fixed text
- **ProfileScreen**: 2 fixed texts (step 0, step 1)
- **QuestionPlay**: 18 texts ("Question 1. Read through and pick...")
- **ReflectionScreen**: 2 fixed texts (step 0, step 1)

**Total: ~24 unique texts** — after first playthrough, all future users get instant cached audio.

### Changes

#### 1. Create Storage Bucket (`tts-cache`)
- Migration to create a public `tts-cache` bucket
- RLS: public read access, service role writes (edge function only)

#### 2. Update Edge Function (`supabase/functions/elevenlabs-tts/index.ts`)
- Hash the input text (SHA-256) to create a deterministic filename
- Check if `tts-cache/{hash}.mp3` exists in storage
- **Cache hit**: Return the stored file directly (no ElevenLabs call)
- **Cache miss**: Call ElevenLabs, upload result to storage, return audio
- Log usage with a new `cached` status to distinguish cached vs fresh calls

#### 3. Update Client (`src/hooks/useNarration.ts`)
- No changes needed — the edge function handles caching transparently
- Client already fetches from the same endpoint and plays the blob

#### 4. Admin Cache Management (optional, in Settings)
- Add a "Clear TTS Cache" button in Admin Settings to purge the bucket
- Show cache hit/miss stats from `tts_usage_logs`

### Benefits
- **API savings**: ~24 texts cached; after first user, zero ElevenLabs calls for narration
- **Speed**: Cached audio serves from storage (~50ms) vs ElevenLabs API (~1-3s)
- **No client changes**: Fully transparent to the frontend

