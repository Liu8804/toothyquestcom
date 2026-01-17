-- Add UPDATE policy for earned_badges table
DROP POLICY IF EXISTS "Parents can update children earned badges" ON public.earned_badges;

CREATE POLICY "Parents can update children earned badges" 
ON public.earned_badges 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = earned_badges.child_id 
  AND children.parent_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = earned_badges.child_id 
  AND children.parent_id = auth.uid()
));