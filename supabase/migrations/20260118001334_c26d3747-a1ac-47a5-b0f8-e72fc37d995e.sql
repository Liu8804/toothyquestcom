-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;

-- Create a new PERMISSIVE SELECT policy that requires authentication
CREATE POLICY "Authenticated users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'));