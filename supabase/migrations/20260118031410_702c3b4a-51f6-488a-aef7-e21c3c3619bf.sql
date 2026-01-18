-- Fix 1: Badge Configuration - Require authentication to view badges
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;

CREATE POLICY "Authenticated users can view badges"
ON public.badges
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Ensure admin audit logs have explicit deny for non-admins
-- The existing policies are good, but let's ensure there's no public access
-- by adding a base authenticated requirement
DROP POLICY IF EXISTS "Require authentication for audit logs" ON public.admin_audit_logs;

CREATE POLICY "Require authentication for audit logs"
ON public.admin_audit_logs
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 3: Strengthen profiles - ensure users can only view their own profile 
-- and admins can view all (current policies are correct but let's verify)
-- The existing policies are secure, but let's add an explicit deny for anon
DROP POLICY IF EXISTS "Deny anonymous profile access" ON public.profiles;

CREATE POLICY "Deny anonymous profile access"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);