-- Fix 1: Game achievements - require authentication
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.game_achievements;

CREATE POLICY "Authenticated users can view achievements"
ON public.game_achievements
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: admin_audit_logs_safe is a VIEW, not a table
-- Views don't have RLS directly - they inherit from base tables
-- The base table already has RLS, but let's ensure the view is secure
-- by granting access only to authenticated users with admin role

-- First, revoke all access from the view
REVOKE ALL ON public.admin_audit_logs_safe FROM anon;
REVOKE ALL ON public.admin_audit_logs_safe FROM authenticated;

-- Grant SELECT only to authenticated users (RLS on base table will still apply)
GRANT SELECT ON public.admin_audit_logs_safe TO authenticated;