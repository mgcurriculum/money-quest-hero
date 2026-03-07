
CREATE TABLE public.profile_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  age_groups text[] NOT NULL DEFAULT ARRAY['18-25','26-39','40-59','60+'],
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profile options" ON public.profile_options FOR SELECT USING (true);
CREATE POLICY "Admins can insert profile options" ON public.profile_options FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update profile options" ON public.profile_options FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete profile options" ON public.profile_options FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
