
-- Deny anonymous access to admin_audit_logs table
CREATE POLICY "deny_anonymous_access" ON public.admin_audit_logs
  FOR ALL TO anon USING (false);
