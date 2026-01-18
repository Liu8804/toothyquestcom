-- Fix 1: Add authentication requirement for profiles table
-- Drop existing policies and recreate with proper authentication checks
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Add base authentication requirement
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate specific policies with proper auth
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Restrict admin audit logs so admins only see their own IP
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view own audit logs with IP, others without"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  AND (admin_user_id = auth.uid())
);

-- Create a view for admins to see all logs but with IP redacted for other admins
CREATE OR REPLACE VIEW public.admin_audit_logs_safe AS
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
FROM public.admin_audit_logs
WHERE public.has_role(auth.uid(), 'admin'::app_role);

-- Fix 3: Rate limits table note - the current "service role only" policy is correct
-- as rate limiting should only be managed by edge functions using service role
-- No changes needed, but adding a comment for clarity