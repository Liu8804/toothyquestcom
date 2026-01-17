-- Add explicit restrictive policy to deny anonymous access to brushing_sessions
-- This provides defense-in-depth by explicitly requiring authentication
CREATE POLICY "Require authentication for brushing sessions"
  ON public.brushing_sessions
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);