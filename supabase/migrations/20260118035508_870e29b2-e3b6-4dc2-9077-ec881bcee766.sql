-- Fix remaining security issues

-- 1. Allow admins to manage user roles
DROP POLICY IF EXISTS "Deny role insertion" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role updates" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role deletion" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix rate_limits - allow service role operations (via triggers/functions)
-- Keep blocking direct user access but allow system to manage via triggers
DROP POLICY IF EXISTS "Block user inserts on rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Block user updates on rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Block user deletes on rate limits" ON public.rate_limits;

-- Rate limits should be managed by edge functions using service role
-- Users should not have direct access - this is correct
-- Create function-based rate limit management
CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_user_id uuid, p_endpoint text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
BEGIN
  v_window_start := date_trunc('minute', now());
  
  -- Try to insert or update rate limit
  INSERT INTO public.rate_limits (user_id, endpoint, window_start, request_count)
  VALUES (p_user_id, p_endpoint, v_window_start, 1)
  ON CONFLICT (user_id, endpoint) 
  DO UPDATE SET 
    request_count = CASE 
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < v_window_start THEN v_window_start
      ELSE rate_limits.window_start
    END;
  
  -- Return true if under limit (100 requests per minute)
  SELECT request_count INTO v_count
  FROM public.rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  RETURN v_count <= 100;
END;
$$;

-- Add unique constraint for upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rate_limits_user_endpoint_unique'
  ) THEN
    ALTER TABLE public.rate_limits 
    ADD CONSTRAINT rate_limits_user_endpoint_unique 
    UNIQUE (user_id, endpoint);
  END IF;
END $$;

-- 3. Remove redundant audit log policy
DROP POLICY IF EXISTS "Block direct table access for non-admins" ON public.admin_audit_logs;