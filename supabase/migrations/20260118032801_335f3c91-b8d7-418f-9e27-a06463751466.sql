-- The issue is that PERMISSIVE policies with USING (false) still allow access 
-- because PERMISSIVE policies are ORed together. We need to revoke table-level 
-- permissions from anon role to completely block anonymous access.

-- Revoke all permissions from anon role on all sensitive tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.children FROM anon;
REVOKE ALL ON public.brushing_sessions FROM anon;
REVOKE ALL ON public.quest_progress FROM anon;
REVOKE ALL ON public.earned_badges FROM anon;
REVOKE ALL ON public.game_scores FROM anon;
REVOKE ALL ON public.earned_achievements FROM anon;
REVOKE ALL ON public.daily_challenge_progress FROM anon;
REVOKE ALL ON public.admin_audit_logs FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.rate_limits FROM anon;

-- Also revoke INSERT/UPDATE/DELETE for anon on tables that might have grants
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.children FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.brushing_sessions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.quest_progress FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.earned_badges FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.game_scores FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.earned_achievements FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.daily_challenge_progress FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.admin_audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.rate_limits FROM anon;

-- Drop the PERMISSIVE policies we created since they're not effective
DROP POLICY IF EXISTS "Block anonymous profile access" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous children access" ON public.children;
DROP POLICY IF EXISTS "Block anonymous brushing sessions access" ON public.brushing_sessions;
DROP POLICY IF EXISTS "Block anonymous quest progress access" ON public.quest_progress;
DROP POLICY IF EXISTS "Block anonymous earned badges access" ON public.earned_badges;
DROP POLICY IF EXISTS "Block anonymous game scores access" ON public.game_scores;
DROP POLICY IF EXISTS "Block anonymous earned achievements access" ON public.earned_achievements;
DROP POLICY IF EXISTS "Block anonymous daily challenge progress access" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Block anonymous admin audit logs access" ON public.admin_audit_logs;