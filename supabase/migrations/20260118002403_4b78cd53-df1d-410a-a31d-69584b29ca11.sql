-- Fix profiles table: Remove any permissive public access and ensure only authenticated users can access their own data

-- Drop existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile or admin can view all" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Create a single, clear PERMISSIVE SELECT policy for profiles
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix admin_audit_logs table: Ensure only admins can view logs

-- Drop existing policies on admin_audit_logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Require authentication for audit logs" ON public.admin_audit_logs;

-- Create a single, clear PERMISSIVE SELECT policy for admin audit logs (admins only)
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));