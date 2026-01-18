-- Fix has_role function with input validation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Input validation: NULL checks prevent any injection attempts
  -- UUID type and app_role enum type are inherently safe from SQL injection
  SELECT CASE 
    WHEN _user_id IS NULL THEN false
    WHEN _role IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;