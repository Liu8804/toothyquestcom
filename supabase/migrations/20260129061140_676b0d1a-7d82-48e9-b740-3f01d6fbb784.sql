-- Grant execute permission on admin helper functions to authenticated users
-- (They are SECURITY DEFINER so they can query user_roles internally)

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(public.app_role) TO anon;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;