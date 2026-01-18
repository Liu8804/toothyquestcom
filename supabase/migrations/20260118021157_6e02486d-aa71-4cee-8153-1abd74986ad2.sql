-- Fix the security definer view issue by using security_invoker
DROP VIEW IF EXISTS public.admin_audit_logs_safe;

-- Recreate view with security_invoker (uses caller's permissions, not definer's)
CREATE VIEW public.admin_audit_logs_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  created_at,
  target_table,
  CASE 
    WHEN admin_user_id = auth.uid() THEN ip_address
    ELSE '[REDACTED]'
  END as ip_address,
  action,
  details,
  target_id,
  admin_user_id
FROM public.admin_audit_logs;

-- Also update the audit logs policy to allow admins to see all logs (needed for the view to work)
DROP POLICY IF EXISTS "Admins can view own audit logs with IP, others without" ON public.admin_audit_logs;

CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));