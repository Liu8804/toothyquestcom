-- Fix security issues: Add SELECT restrictions to prevent public access to user data

-- 1. Profiles: Only authenticated users can view profiles (their own by default, or public visibility)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Children: Only parents can view their own children (already has policy, just ensure no public access)
-- The existing "Parents can view their children" policy is correct

-- 3. User roles: Only users can see their own roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Analytics events: Only users can see their own events
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
CREATE POLICY "Users can view own analytics" 
ON public.analytics_events FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Admin audit logs: Only admins can view
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (public.is_admin());

-- 6. Brushing sessions: Parents view their children's sessions
DROP POLICY IF EXISTS "Parents can view brushing sessions" ON public.brushing_sessions;
CREATE POLICY "Parents can view children brushing sessions" 
ON public.brushing_sessions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = brushing_sessions.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 7. Quest progress: Parents view their children's progress
DROP POLICY IF EXISTS "Parents can view quest progress" ON public.quest_progress;
CREATE POLICY "Parents can view children quest progress" 
ON public.quest_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = quest_progress.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 8. Earned badges: Parents view their children's badges
DROP POLICY IF EXISTS "Parents can view earned badges" ON public.earned_badges;
CREATE POLICY "Parents can view children earned badges" 
ON public.earned_badges FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = earned_badges.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 9. Game scores: Parents view their children's scores
DROP POLICY IF EXISTS "Parents can view game scores" ON public.game_scores;
CREATE POLICY "Parents can view children game scores" 
ON public.game_scores FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = game_scores.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 10. Earned achievements: Parents view their children's achievements
DROP POLICY IF EXISTS "Parents can view earned achievements" ON public.earned_achievements;
CREATE POLICY "Parents can view children earned achievements" 
ON public.earned_achievements FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = earned_achievements.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 11. Daily challenge progress: Parents view their children's progress
DROP POLICY IF EXISTS "Parents can view challenge progress" ON public.daily_challenge_progress;
CREATE POLICY "Parents can view children challenge progress" 
ON public.daily_challenge_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = daily_challenge_progress.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- 12. Leaderboard profiles: Public access is intentional for leaderboard display
-- Keep existing policy as this is meant to be public