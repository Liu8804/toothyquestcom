-- Drop the old policy that still exists (different name)
DROP POLICY IF EXISTS "Anyone can view public leaderboard profiles" ON public.leaderboard_profiles;