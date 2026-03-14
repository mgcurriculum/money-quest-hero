CREATE POLICY "Anyone can read sessions by phone"
ON public.game_sessions
FOR SELECT
TO public
USING (player_phone IS NOT NULL);