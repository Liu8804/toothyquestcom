-- Add authentication requirement policy for children table
CREATE POLICY "Require authentication for children" 
ON public.children 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);