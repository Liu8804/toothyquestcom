-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.daily_challenges;

-- Create a new policy that requires authentication to view active challenges
CREATE POLICY "Authenticated users can view active challenges"
ON public.daily_challenges
FOR SELECT
TO authenticated
USING (is_active = true);