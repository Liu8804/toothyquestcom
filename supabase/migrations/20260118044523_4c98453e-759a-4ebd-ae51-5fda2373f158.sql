-- Add user SELECT access for their own analytics events (and tighten roles)

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Tighten existing policies to authenticated only (RLS already checks auth.uid(), but this removes anon from the policy role list)
ALTER POLICY "Admins can view all analytics"
ON public.analytics_events
TO authenticated;

ALTER POLICY "Users can insert their own analytics events"
ON public.analytics_events
TO authenticated;

-- Allow regular users to read back only their own events
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view own analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
