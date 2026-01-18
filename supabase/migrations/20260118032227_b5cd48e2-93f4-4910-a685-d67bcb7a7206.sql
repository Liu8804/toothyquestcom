-- Fix 1: Profiles table - ensure only owner or admin can view
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: admin_audit_logs_safe - restrict to admins only
REVOKE ALL ON public.admin_audit_logs_safe FROM anon;
REVOKE ALL ON public.admin_audit_logs_safe FROM authenticated;
GRANT SELECT ON public.admin_audit_logs_safe TO authenticated;

-- Create a function to check admin access for the view
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role)
$$;

-- Drop and recreate the view with admin-only access via security_invoker
DROP VIEW IF EXISTS public.admin_audit_logs_safe;

CREATE VIEW public.admin_audit_logs_safe
WITH (security_invoker = on)
AS SELECT 
  id,
  admin_user_id,
  action,
  target_table,
  target_id,
  details,
  created_at
FROM public.admin_audit_logs
WHERE has_role(auth.uid(), 'admin'::app_role);

-- Grant only to authenticated (the view's WHERE clause enforces admin check)
GRANT SELECT ON public.admin_audit_logs_safe TO authenticated;

-- Fix 3: Brushing sessions - add explicit TO authenticated clause for clarity
DROP POLICY IF EXISTS "Parents can view children brushing sessions or admin can view a" ON public.brushing_sessions;

CREATE POLICY "Parents can view children brushing sessions or admin can view all"
ON public.brushing_sessions
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM children
    WHERE children.id = brushing_sessions.child_id 
    AND children.parent_id = auth.uid()
  )) OR has_role(auth.uid(), 'admin'::app_role)
);