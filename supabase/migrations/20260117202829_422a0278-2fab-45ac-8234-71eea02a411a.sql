-- Add DELETE policy for profiles table
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Fix get_child_total_xp to add authorization check
CREATE OR REPLACE FUNCTION public.get_child_total_xp(child_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(xp_earned), 0)::INTEGER
  FROM public.quest_progress
  WHERE child_id = child_uuid
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE id = child_uuid
    AND parent_id = auth.uid()
  )
$$;