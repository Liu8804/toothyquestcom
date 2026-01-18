-- Prevent cross-user profile exposure through SECURITY DEFINER functions
-- by (1) using a safe current_user_has_role wrapper in policies,
-- and (2) revoking PUBLIC EXECUTE on sensitive admin RPC functions.

-- 1) Safer role check (no user_id parameter => no role enumeration via RPC)
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN _role IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = _role
    )
  END;
$$;

-- 2) Update policies to use current_user_has_role('admin') instead of has_role(auth.uid(), ...)

-- admin_audit_logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

-- analytics_events (admin read)
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_events;
CREATE POLICY "Admins can view all analytics"
ON public.analytics_events
FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

-- badges
DROP POLICY IF EXISTS "Only admins can insert badges" ON public.badges;
CREATE POLICY "Only admins can insert badges"
ON public.badges
FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update badges" ON public.badges;
CREATE POLICY "Only admins can update badges"
ON public.badges
FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete badges" ON public.badges;
CREATE POLICY "Only admins can delete badges"
ON public.badges
FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- brushing_sessions (admin override)
DROP POLICY IF EXISTS "Parents can view children brushing sessions or admin can view a" ON public.brushing_sessions;
CREATE POLICY "Parents can view children brushing sessions or admin can view a"
ON public.brushing_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.children
    WHERE children.id = brushing_sessions.child_id
      AND children.parent_id = auth.uid()
  )
  OR public.current_user_has_role('admin'::app_role)
);

-- daily_challenges
DROP POLICY IF EXISTS "Only admins can insert daily challenges" ON public.daily_challenges;
CREATE POLICY "Only admins can insert daily challenges"
ON public.daily_challenges
FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update daily challenges" ON public.daily_challenges;
CREATE POLICY "Only admins can update daily challenges"
ON public.daily_challenges
FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete daily challenges" ON public.daily_challenges;
CREATE POLICY "Only admins can delete daily challenges"
ON public.daily_challenges
FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- earned_badges (admin override)
DROP POLICY IF EXISTS "Parents can view children earned badges or admin can view all" ON public.earned_badges;
CREATE POLICY "Parents can view children earned badges or admin can view all"
ON public.earned_badges
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.children
    WHERE children.id = earned_badges.child_id
      AND children.parent_id = auth.uid()
  )
  OR public.current_user_has_role('admin'::app_role)
);

-- game_achievements
DROP POLICY IF EXISTS "Only admins can insert game achievements" ON public.game_achievements;
CREATE POLICY "Only admins can insert game achievements"
ON public.game_achievements
FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update game achievements" ON public.game_achievements;
CREATE POLICY "Only admins can update game achievements"
ON public.game_achievements
FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete game achievements" ON public.game_achievements;
CREATE POLICY "Only admins can delete game achievements"
ON public.game_achievements
FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- quest_progress (admin override)
DROP POLICY IF EXISTS "Parents can view children quest progress or admin can view all" ON public.quest_progress;
CREATE POLICY "Parents can view children quest progress or admin can view all"
ON public.quest_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.children
    WHERE children.id = quest_progress.child_id
      AND children.parent_id = auth.uid()
  )
  OR public.current_user_has_role('admin'::app_role)
);

-- user_roles (admin management)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- 3) Update admin helper functions to use current_user_has_role

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.current_user_has_role('admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_children bigint, total_badges bigint, total_xp_earned bigint, total_quests_completed bigint, total_brushing_sessions bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.current_user_has_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY SELECT
    (SELECT count(*) FROM public.profiles) as total_users,
    (SELECT count(*) FROM public.children) as total_children,
    (SELECT count(*) FROM public.badges) as total_badges,
    (SELECT COALESCE(SUM(xp_earned), 0) FROM public.quest_progress) as total_xp_earned,
    (SELECT count(*) FROM public.quest_progress) as total_quests_completed,
    (SELECT count(*) FROM public.brushing_sessions) as total_brushing_sessions;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_audit_logs()
RETURNS TABLE(id uuid, admin_user_id uuid, action text, target_table text, target_id uuid, details jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.current_user_has_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    aal.id,
    aal.admin_user_id,
    aal.action,
    aal.target_table,
    aal.target_id,
    aal.details,
    aal.created_at
  FROM public.admin_audit_logs aal
  ORDER BY aal.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_emoji text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_has_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_table, details)
  VALUES (auth.uid(), 'view_all', 'profiles', jsonb_build_object('action_type', 'bulk_view'));

  RETURN QUERY
  SELECT p.id, p.user_id, p.display_name, p.avatar_emoji, p.created_at, p.updated_at
  FROM public.profiles p;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_all_children()
RETURNS TABLE(
  id uuid,
  parent_id uuid,
  name text,
  avatar_emoji text,
  created_at timestamptz,
  age_group text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_has_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_table, details)
  VALUES (auth.uid(), 'view_all', 'children', jsonb_build_object('action_type', 'bulk_view'));

  RETURN QUERY
  SELECT 
    c.id, 
    c.parent_id, 
    c.name, 
    c.avatar_emoji, 
    c.created_at,
    CASE 
      WHEN c.birth_year IS NULL THEN 'unknown'
      WHEN EXTRACT(YEAR FROM CURRENT_DATE) - c.birth_year < 5 THEN 'under 5'
      WHEN EXTRACT(YEAR FROM CURRENT_DATE) - c.birth_year < 8 THEN '5-7'
      WHEN EXTRACT(YEAR FROM CURRENT_DATE) - c.birth_year < 12 THEN '8-11'
      ELSE '12+'
    END as age_group
  FROM public.children c;
END;
$$;

-- 4) Lock down SECURITY DEFINER RPC surface area
-- Keep admin RPC callable for logged-in users, but NOT for anon/public.
REVOKE EXECUTE ON FUNCTION public.admin_get_all_profiles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_all_children() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_audit_logs() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_children() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_audit_logs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Remove ability for clients to call has_role(user_id, role) directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Note: RLS now uses current_user_has_role(), so has_role() no longer needs to be client-callable.