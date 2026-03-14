CREATE TABLE public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert OTPs" ON public.phone_otps FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read OTPs" ON public.phone_otps FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update OTPs" ON public.phone_otps FOR UPDATE TO public USING (true);

CREATE INDEX idx_phone_otps_phone ON public.phone_otps(phone, created_at DESC);