-- Allow admins to manage unlock_codes

DROP POLICY IF EXISTS "Deny all select on unlock codes" ON public.unlock_codes;
DROP POLICY IF EXISTS "Deny all insert on unlock codes" ON public.unlock_codes;
DROP POLICY IF EXISTS "Deny all update on unlock codes" ON public.unlock_codes;
DROP POLICY IF EXISTS "Deny all delete on unlock codes" ON public.unlock_codes;

-- Admins can do everything with unlock codes
CREATE POLICY "Admins can view unlock codes"
ON public.unlock_codes
FOR SELECT
USING (current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can insert unlock codes"
ON public.unlock_codes
FOR INSERT
WITH CHECK (current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can update unlock codes"
ON public.unlock_codes
FOR UPDATE
USING (current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can delete unlock codes"
ON public.unlock_codes
FOR DELETE
USING (current_user_has_role('admin'::app_role));