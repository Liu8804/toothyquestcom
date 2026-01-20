-- Grant admin + premium access to the 3 owner accounts (by email)
-- Keeps behavior unchanged for all other users.

DO $$
DECLARE
  v_emails text[] := ARRAY[
    'marliudlewis@gmail.com',
    'marlonlewisbradhsaw@gmail.com',
    'karlaelia976@gmail.com'
  ];
BEGIN
  -- 1) Ensure these users have the 'admin' role
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'admin'::public.app_role
  FROM auth.users u
  WHERE u.email = ANY(v_emails)
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = u.id
        AND ur.role = 'admin'::public.app_role
    );

  -- 2) Ensure these users also have a manual premium entitlement
  INSERT INTO public.manual_entitlements (user_id, granted_via)
  SELECT u.id, 'admin_grant'
  FROM auth.users u
  WHERE u.email = ANY(v_emails)
  ON CONFLICT (user_id)
  DO UPDATE SET
    granted_via = EXCLUDED.granted_via,
    granted_at = now();
END $$;

-- Make entitlement write-denial explicit (RLS already blocks by default, but this removes ambiguity)
DROP POLICY IF EXISTS "Deny entitlement inserts" ON public.manual_entitlements;
CREATE POLICY "Deny entitlement inserts"
ON public.manual_entitlements
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny entitlement updates" ON public.manual_entitlements;
CREATE POLICY "Deny entitlement updates"
ON public.manual_entitlements
FOR UPDATE
TO authenticated
USING (false);

DROP POLICY IF EXISTS "Deny entitlement deletes" ON public.manual_entitlements;
CREATE POLICY "Deny entitlement deletes"
ON public.manual_entitlements
FOR DELETE
TO authenticated
USING (false);
