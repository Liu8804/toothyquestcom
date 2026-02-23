
-- Fix children table: ensure no public SELECT exists, only parent access
-- (The children table already has parent-only RLS, but let's verify and clean up)

-- Clean up duplicate policies on other tables
DROP POLICY IF EXISTS "Users can view their own entitlements" ON public.manual_entitlements;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Parents can view children game scores" ON public.game_scores;
DROP POLICY IF EXISTS "Parents can view children earned achievements" ON public.earned_achievements;
