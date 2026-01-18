-- Fix 1: admin_audit_logs_safe view - the view itself doesn't have RLS, 
-- but we enforce admin check in the view definition. Let's also ensure proper grants.
-- The view already has WHERE has_role(auth.uid(), 'admin'::app_role) which enforces admin-only access.

-- Revoke from anon to ensure no anonymous access
REVOKE ALL ON public.admin_audit_logs_safe FROM anon;
REVOKE ALL ON public.admin_audit_logs_safe FROM public;

-- Fix 2: rate_limits table - add permissive policies for service role operations
-- The table should only be accessible by the service role for rate limiting logic

-- First drop the existing restrictive policy
DROP POLICY IF EXISTS "Service role only" ON public.rate_limits;

-- Create a policy that allows authenticated users to see only their own rate limits (read-only)
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Deny all other operations from regular users (service role bypasses RLS)
CREATE POLICY "Block user inserts on rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Block user updates on rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Block user deletes on rate limits"
ON public.rate_limits
FOR DELETE
TO authenticated
USING (false);