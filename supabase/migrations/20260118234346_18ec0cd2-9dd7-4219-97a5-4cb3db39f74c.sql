-- Fix 1: Remove the overly permissive public leaderboard policy
-- Replace with authenticated-only access
DROP POLICY IF EXISTS "Anyone can view public leaderboard profiles" ON public.leaderboard_profiles;

-- Authenticated users can view public leaderboard profiles (not anonymous internet users)
CREATE POLICY "Authenticated users can view public leaderboard profiles"
  ON public.leaderboard_profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Fix 2: Ensure admin_audit_logs has RLS enabled (it should already, but let's be safe)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Fix 3: Update the get_public_leaderboard function to require authentication
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  child_id UUID,
  display_name TEXT,
  avatar_emoji TEXT,
  total_xp BIGINT,
  quests_completed BIGINT,
  badges_earned BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users to view leaderboard
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view leaderboard';
  END IF;

  RETURN QUERY
  SELECT 
    lp.child_id,
    lp.display_name,
    c.avatar_emoji,
    COALESCE(SUM(qp.xp_earned), 0)::BIGINT as total_xp,
    COUNT(DISTINCT qp.quest_id)::BIGINT as quests_completed,
    COUNT(DISTINCT eb.badge_id)::BIGINT as badges_earned
  FROM public.leaderboard_profiles lp
  INNER JOIN public.children c ON c.id = lp.child_id
  LEFT JOIN public.quest_progress qp ON qp.child_id = lp.child_id
  LEFT JOIN public.earned_badges eb ON eb.child_id = lp.child_id
  WHERE lp.is_public = true
  GROUP BY lp.child_id, lp.display_name, c.avatar_emoji
  ORDER BY total_xp DESC
  LIMIT limit_count;
END;
$$;

-- Revoke execute from anon, only allow authenticated
REVOKE EXECUTE ON FUNCTION public.get_public_leaderboard(INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard(INTEGER) TO authenticated;