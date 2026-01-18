-- Fix 1: Ensure profiles table denies unauthenticated access
-- Drop any existing permissive policies and add strict authentication
DROP POLICY IF EXISTS "Deny anonymous profile access" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Recreate with explicit anon denial
CREATE POLICY "Deny anonymous profile access"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Fix 2: Secure the admin_audit_logs_safe view
-- Drop the existing view and recreate without IP addresses for regular admins
DROP VIEW IF EXISTS public.admin_audit_logs_safe;

-- Create a secure view that hides sensitive IP address data
CREATE VIEW public.admin_audit_logs_safe
WITH (security_invoker = on) AS
SELECT 
    id,
    admin_user_id,
    action,
    target_table,
    target_id,
    details,
    created_at
    -- IP address intentionally excluded for security
FROM public.admin_audit_logs;

-- Add comment explaining the security decision
COMMENT ON VIEW public.admin_audit_logs_safe IS 'Secure view of audit logs that excludes IP addresses to protect admin privacy';

-- Fix 3: Ensure admin_audit_logs base table has proper RLS
-- Verify the base table denies direct SELECT to non-admins (already exists but reinforce)
DROP POLICY IF EXISTS "Block direct table access for non-admins" ON public.admin_audit_logs;

CREATE POLICY "Block direct table access for non-admins"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));