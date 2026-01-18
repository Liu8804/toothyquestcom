-- The admin_audit_logs_safe is a VIEW which cannot have RLS policies
-- Replace with a security definer function that enforces admin access

-- Drop the view
DROP VIEW IF EXISTS public.admin_audit_logs_safe;

-- Create a secure function instead that returns audit logs for admins only
CREATE OR REPLACE FUNCTION public.get_admin_audit_logs()
RETURNS TABLE (
  id uuid,
  admin_user_id uuid,
  action text,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if user is an admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
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

-- Revoke execute from public and grant only to authenticated
REVOKE ALL ON FUNCTION public.get_admin_audit_logs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_audit_logs() TO authenticated;