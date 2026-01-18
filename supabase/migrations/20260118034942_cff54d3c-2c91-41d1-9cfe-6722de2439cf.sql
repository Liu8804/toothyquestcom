-- Remove direct admin SELECT access to profiles and children tables
-- Admins will use audited functions instead

-- Drop admin SELECT policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Update children policy to remove admin direct access
DROP POLICY IF EXISTS "Parents can view their children or admin can view all" ON public.children;

-- Recreate children SELECT policy for parents only
CREATE POLICY "Parents can view their children"
ON public.children
FOR SELECT
USING (auth.uid() = parent_id);

-- Create audited function for admin to view profiles
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
  -- Check admin authorization
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Log this admin action
  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_table, details)
  VALUES (auth.uid(), 'view_all', 'profiles', jsonb_build_object('action_type', 'bulk_view'));

  -- Return profiles data
  RETURN QUERY
  SELECT p.id, p.user_id, p.display_name, p.avatar_emoji, p.created_at, p.updated_at
  FROM public.profiles p;
END;
$$;

-- Create audited function for admin to view children (without exposing birth_year directly)
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
  -- Check admin authorization
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Log this admin action
  INSERT INTO public.admin_audit_logs (admin_user_id, action, target_table, details)
  VALUES (auth.uid(), 'view_all', 'children', jsonb_build_object('action_type', 'bulk_view'));

  -- Return children data with age_group instead of exact birth_year
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