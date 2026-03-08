
-- Create campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  winner_session_id uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL
);

-- Add campaign_id to game_sessions
ALTER TABLE public.game_sessions ADD COLUMN campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Admins full CRUD
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can read active campaigns
CREATE POLICY "Anyone can read active campaigns" ON public.campaigns FOR SELECT USING (is_active = true);

-- Enable realtime on game_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
