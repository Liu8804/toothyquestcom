-- Add explicit DENY policies for badges table write operations
-- Only admins via service role should manage badges

DROP POLICY IF EXISTS "Deny badge insertion" ON public.badges;
DROP POLICY IF EXISTS "Deny badge updates" ON public.badges;
DROP POLICY IF EXISTS "Deny badge deletion" ON public.badges;

CREATE POLICY "Deny badge insertion" 
ON public.badges 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Deny badge updates" 
ON public.badges 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny badge deletion" 
ON public.badges 
FOR DELETE 
USING (false);