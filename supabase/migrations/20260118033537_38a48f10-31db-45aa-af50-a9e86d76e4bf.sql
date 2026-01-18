-- Add explicit deny policies for analytics to make security intention clear
CREATE POLICY "Block analytics updates"
ON public.analytics_events
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Block analytics deletes"
ON public.analytics_events
FOR DELETE
TO authenticated
USING (false);