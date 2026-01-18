-- Fix game content access - require authentication

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.game_achievements;
DROP POLICY IF EXISTS "Authenticated users can view badges" ON public.badges;
DROP POLICY IF EXISTS "Authenticated users can view active challenges" ON public.daily_challenges;

-- Create proper auth-required policies for game_achievements
CREATE POLICY "Authenticated users can view achievements"
ON public.game_achievements
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create proper auth-required policies for badges  
CREATE POLICY "Authenticated users can view badges"
ON public.badges
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create proper auth-required policies for daily_challenges
CREATE POLICY "Authenticated users can view active challenges"
ON public.daily_challenges
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Revoke anonymous access from these tables
REVOKE SELECT ON public.game_achievements FROM anon;
REVOKE SELECT ON public.badges FROM anon;
REVOKE SELECT ON public.daily_challenges FROM anon;