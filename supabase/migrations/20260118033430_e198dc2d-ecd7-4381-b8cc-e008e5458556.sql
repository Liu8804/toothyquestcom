-- Fix 1: Add SELECT policy for analytics_events so users can view their own data
CREATE POLICY "Users can view their own analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Separate admin SELECT policy for profiles 
-- First drop and recreate the policy to be more restrictive
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

-- Users can ONLY view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles (separate policy)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));