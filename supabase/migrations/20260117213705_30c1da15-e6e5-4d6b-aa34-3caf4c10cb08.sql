-- Add authentication requirement policy for admin_audit_logs table
CREATE POLICY "Require authentication for audit logs"
ON public.admin_audit_logs
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);