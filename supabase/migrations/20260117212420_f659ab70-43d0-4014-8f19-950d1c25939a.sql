-- Create admin statistics view for dashboard
CREATE OR REPLACE VIEW public.admin_stats
WITH (security_invoker = on) AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.children) as total_children,
  (SELECT COUNT(*) FROM public.badges) as total_badges,
  (SELECT COALESCE(SUM(xp_earned), 0) FROM public.quest_progress) as total_xp_earned,
  (SELECT COUNT(*) FROM public.quest_progress) as total_quests_completed,
  (SELECT COUNT(*) FROM public.brushing_sessions) as total_brushing_sessions;

-- Drop existing profile SELECT policy and recreate with admin access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile or admin can view all" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all children
DROP POLICY IF EXISTS "Parents can view their children" ON public.children;
CREATE POLICY "Parents can view their children or admin can view all" 
ON public.children 
FOR SELECT 
USING (auth.uid() = parent_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all quest progress
DROP POLICY IF EXISTS "Parents can view children quest progress" ON public.quest_progress;
CREATE POLICY "Parents can view children quest progress or admin can view all" 
ON public.quest_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = quest_progress.child_id 
    AND children.parent_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Allow admins to view all brushing sessions
DROP POLICY IF EXISTS "Parents can view children brushing sessions" ON public.brushing_sessions;
CREATE POLICY "Parents can view children brushing sessions or admin can view all" 
ON public.brushing_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = brushing_sessions.child_id 
    AND children.parent_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Allow admins to view all earned badges
DROP POLICY IF EXISTS "Parents can view children earned badges" ON public.earned_badges;
CREATE POLICY "Parents can view children earned badges or admin can view all" 
ON public.earned_badges 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM children
    WHERE children.id = earned_badges.child_id 
    AND children.parent_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Allow admins to manage badges (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Deny badge insertion" ON public.badges;
CREATE POLICY "Only admins can insert badges" 
ON public.badges 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Deny badge updates" ON public.badges;
CREATE POLICY "Only admins can update badges" 
ON public.badges 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Deny badge deletion" ON public.badges;
CREATE POLICY "Only admins can delete badges" 
ON public.badges 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));