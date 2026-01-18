-- Clean up confusing "Deny" policies that use PERMISSIVE with USING(false)
-- These don't actually block access - they just don't match any rows
-- The proper approach is REVOKE which we already did

-- Drop confusing deny policies (we already revoked access at table level)
DROP POLICY IF EXISTS "Deny anonymous profile access" ON public.profiles;

-- Also drop any ALL policies that might cause confusion on children
DROP POLICY IF EXISTS "Require authentication for children" ON public.children;

-- Drop any ALL policies on brushing_sessions  
DROP POLICY IF EXISTS "Require authentication for brushing sessions" ON public.brushing_sessions;

-- Drop any ALL policies on quest_progress
DROP POLICY IF EXISTS "Require authentication for quest progress" ON public.quest_progress;

-- Drop any ALL policies on earned_badges
DROP POLICY IF EXISTS "Require authentication for earned badges" ON public.earned_badges;

-- Drop any ALL policies on admin_audit_logs
DROP POLICY IF EXISTS "Require authentication for audit logs" ON public.admin_audit_logs;

-- Drop any ALL policies on user_roles
DROP POLICY IF EXISTS "Require authentication for user roles" ON public.user_roles;