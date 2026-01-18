-- The admin_audit_logs_safe is a VIEW, not a table
-- Views with security_invoker inherit RLS from their base tables
-- Since admin_audit_logs has proper RLS, the view is already secure
-- We just need to grant proper permissions

-- Revoke any public access and ensure only authenticated users can use the view
REVOKE ALL ON public.admin_audit_logs_safe FROM anon;
REVOKE ALL ON public.admin_audit_logs_safe FROM public;
GRANT SELECT ON public.admin_audit_logs_safe TO authenticated;