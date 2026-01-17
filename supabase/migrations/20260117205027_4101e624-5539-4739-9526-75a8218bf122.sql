-- Fix children table UPDATE policy to prevent parent_id manipulation
-- Drop the existing policy and recreate with both USING and WITH CHECK

DROP POLICY IF EXISTS "Parents can update their children" ON public.children;

CREATE POLICY "Parents can update their children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id)
WITH CHECK (auth.uid() = parent_id);