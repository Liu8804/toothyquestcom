-- Restrict leaderboard_profiles SELECT to only show public profiles to parents who own the child
-- First drop the existing policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.leaderboard_profiles;
DROP POLICY IF EXISTS "Public leaderboard profiles viewable" ON public.leaderboard_profiles;
DROP POLICY IF EXISTS "Leaderboard profiles are viewable" ON public.leaderboard_profiles;

-- Create a more restrictive policy: users can only see their own child's profile OR anonymized public data
-- For public display, we'll use a database function that returns anonymized data
CREATE POLICY "Users can view their own child leaderboard profile"
ON public.leaderboard_profiles
FOR SELECT
USING (
  child_id IN (
    SELECT id FROM public.children WHERE parent_id = auth.uid()
  )
);

-- Allow public read for the get_public_leaderboard function (which only returns display_name, not child_id to callers)
-- The function itself handles anonymization