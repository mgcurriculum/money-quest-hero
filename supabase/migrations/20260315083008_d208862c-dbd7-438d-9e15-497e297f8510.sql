
CREATE TABLE public.tts_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  text_length integer NOT NULL DEFAULT 0,
  voice_id text,
  status text NOT NULL DEFAULT 'success',
  error_message text
);

ALTER TABLE public.tts_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tts logs" ON public.tts_usage_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
