-- Fix all tables that have RESTRICTIVE "Require authentication" policies 
-- but are missing PERMISSIVE policies to block anonymous access
-- The issue is RESTRICTIVE policies only restrict existing permissions, 
-- they don't grant new ones or block access by themselves

-- 1. profiles table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous profile access"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. children table - add PERMISSIVE policy blocking anonymous access  
CREATE POLICY "Block anonymous children access"
ON public.children
FOR SELECT
TO anon
USING (false);

-- 3. brushing_sessions table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous brushing sessions access"
ON public.brushing_sessions
FOR SELECT
TO anon
USING (false);

-- 4. quest_progress table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous quest progress access"
ON public.quest_progress
FOR SELECT
TO anon
USING (false);

-- 5. earned_badges table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous earned badges access"
ON public.earned_badges
FOR SELECT
TO anon
USING (false);

-- 6. game_scores table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous game scores access"
ON public.game_scores
FOR SELECT
TO anon
USING (false);

-- 7. earned_achievements table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous earned achievements access"
ON public.earned_achievements
FOR SELECT
TO anon
USING (false);

-- 8. daily_challenge_progress table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous daily challenge progress access"
ON public.daily_challenge_progress
FOR SELECT
TO anon
USING (false);

-- 9. admin_audit_logs table - add PERMISSIVE policy blocking anonymous access
CREATE POLICY "Block anonymous admin audit logs access"
ON public.admin_audit_logs
FOR SELECT
TO anon
USING (false);