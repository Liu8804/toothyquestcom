-- Drop the existing view
DROP VIEW IF EXISTS public.admin_stats;

-- Recreate as a function that checks admin role
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users bigint,
  total_children bigint,
  total_badges bigint,
  total_xp_earned bigint,
  total_quests_completed bigint,
  total_brushing_sessions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles) as total_users,
    (SELECT count(*) FROM public.children) as total_children,
    (SELECT count(*) FROM public.badges) as total_badges,
    (SELECT COALESCE(SUM(xp_earned), 0) FROM public.quest_progress) as total_xp_earned,
    (SELECT count(*) FROM public.quest_progress) as total_quests_completed,
    (SELECT count(*) FROM public.brushing_sessions) as total_brushing_sessions
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
$$;