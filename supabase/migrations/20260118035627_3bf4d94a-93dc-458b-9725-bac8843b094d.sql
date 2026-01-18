-- Fix rate_limits table - block all direct user operations
-- Rate limiting is managed via increment_rate_limit() SECURITY DEFINER function

CREATE POLICY "Block user inserts on rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block user updates on rate limits"  
ON public.rate_limits
FOR UPDATE
USING (false);

CREATE POLICY "Block user deletes on rate limits"
ON public.rate_limits
FOR DELETE
USING (false);