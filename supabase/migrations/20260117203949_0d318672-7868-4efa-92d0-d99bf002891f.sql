-- CRITICAL FIX: Secure user_roles table - only allow admins to manage roles
-- Users should NEVER be able to insert, update, or delete their own roles

-- Deny all INSERT operations (role assignment should only happen through admin or triggers)
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'parent') AND EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'parent'
  ) = false);
-- Actually, let's make it simpler - deny all inserts from regular users
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;

CREATE POLICY "Deny role insertion"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (false);

-- Deny all UPDATE operations on user_roles
CREATE POLICY "Deny role updates"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  USING (false);

-- Deny all DELETE operations on user_roles
CREATE POLICY "Deny role deletion"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  USING (false);

-- Add restrictive auth policy to ensure only authenticated users can even attempt operations
CREATE POLICY "Require authentication for user roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- FIX: Add UPDATE and DELETE policies for quest_progress (parents can manage their children's progress)
CREATE POLICY "Parents can update children quest progress"
  ON public.quest_progress
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = quest_progress.child_id
    AND children.parent_id = auth.uid()
  ));

CREATE POLICY "Parents can delete children quest progress"
  ON public.quest_progress
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = quest_progress.child_id
    AND children.parent_id = auth.uid()
  ));

-- Add restrictive auth policy for quest_progress
CREATE POLICY "Require authentication for quest progress"
  ON public.quest_progress
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- FIX: Add DELETE policy for earned_badges (parents can remove badges from their children)
CREATE POLICY "Parents can delete children earned badges"
  ON public.earned_badges
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = earned_badges.child_id
    AND children.parent_id = auth.uid()
  ));

-- Add restrictive auth policy for earned_badges
CREATE POLICY "Require authentication for earned badges"
  ON public.earned_badges
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- FIX: Add UPDATE and DELETE policies for brushing_sessions (parents can correct their children's sessions)
CREATE POLICY "Parents can update children brushing sessions"
  ON public.brushing_sessions
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = brushing_sessions.child_id
    AND children.parent_id = auth.uid()
  ));

CREATE POLICY "Parents can delete children brushing sessions"
  ON public.brushing_sessions
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = brushing_sessions.child_id
    AND children.parent_id = auth.uid()
  ));