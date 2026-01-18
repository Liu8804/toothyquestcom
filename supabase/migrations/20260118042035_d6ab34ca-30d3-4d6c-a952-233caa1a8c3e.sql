-- Fix analytics_events INSERT policy to strictly enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);