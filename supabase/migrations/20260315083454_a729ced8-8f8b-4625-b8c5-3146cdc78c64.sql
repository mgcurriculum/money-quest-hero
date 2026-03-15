
-- Create tts-cache storage bucket (public read, service role writes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read cached audio files
CREATE POLICY "Public read access for tts-cache"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-cache');

-- Allow service role (edge functions) to insert cached audio
CREATE POLICY "Service role can insert tts-cache"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tts-cache');

-- Allow service role to delete cached audio (for cache clearing)
CREATE POLICY "Service role can delete tts-cache"
ON storage.objects FOR DELETE
USING (bucket_id = 'tts-cache');
