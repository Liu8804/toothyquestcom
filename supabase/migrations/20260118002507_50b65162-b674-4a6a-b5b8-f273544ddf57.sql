-- Add missing DELETE policies for data management

-- game_scores: Add UPDATE and DELETE policies for parents
CREATE POLICY "Parents can update children game scores"
ON public.game_scores
FOR UPDATE
TO authenticated
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete children game scores"
ON public.game_scores
FOR DELETE
TO authenticated
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- earned_achievements: Add UPDATE and DELETE policies
CREATE POLICY "Parents can update children achievements"
ON public.earned_achievements
FOR UPDATE
TO authenticated
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can delete children achievements"
ON public.earned_achievements
FOR DELETE
TO authenticated
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- daily_challenge_progress: Add DELETE policy
CREATE POLICY "Parents can delete children challenge progress"
ON public.daily_challenge_progress
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM children WHERE children.id = daily_challenge_progress.child_id AND children.parent_id = auth.uid()));

-- Fix admin_audit_logs INSERT policy: Allow any authenticated admin to insert
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));