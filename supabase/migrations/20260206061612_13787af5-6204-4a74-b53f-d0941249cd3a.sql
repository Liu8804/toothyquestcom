-- Add explicit deny policies for anonymous users on sensitive tables
-- This prevents enumeration attacks even if RLS is bypassed

-- Children table - contains minors' personal information
CREATE POLICY "deny_anonymous_access" ON public.children FOR ALL TO anon USING (false);

-- Profiles table - contains user display names
CREATE POLICY "deny_anonymous_access" ON public.profiles FOR ALL TO anon USING (false);

-- Notification preferences - contains daily routines
CREATE POLICY "deny_anonymous_access" ON public.notification_preferences FOR ALL TO anon USING (false);

-- Referrals table - contains user relationships
CREATE POLICY "deny_anonymous_access" ON public.referrals FOR ALL TO anon USING (false);

-- User streaks - contains engagement patterns
CREATE POLICY "deny_anonymous_access" ON public.user_streaks FOR ALL TO anon USING (false);

-- Push subscriptions - contains notification endpoints
CREATE POLICY "deny_anonymous_access" ON public.push_subscriptions FOR ALL TO anon USING (false);

-- Brushing sessions - contains children's daily routines
CREATE POLICY "deny_anonymous_access" ON public.brushing_sessions FOR ALL TO anon USING (false);

-- Quest progress - children's activity
CREATE POLICY "deny_anonymous_access" ON public.quest_progress FOR ALL TO anon USING (false);

-- Game scores - children's performance data
CREATE POLICY "deny_anonymous_access" ON public.game_scores FOR ALL TO anon USING (false);

-- Earned badges - children's achievements
CREATE POLICY "deny_anonymous_access" ON public.earned_badges FOR ALL TO anon USING (false);

-- Earned achievements - game-specific achievements
CREATE POLICY "deny_anonymous_access" ON public.earned_achievements FOR ALL TO anon USING (false);

-- Daily challenge progress
CREATE POLICY "deny_anonymous_access" ON public.daily_challenge_progress FOR ALL TO anon USING (false);

-- Analytics events - user behavior tracking
CREATE POLICY "deny_anonymous_access" ON public.analytics_events FOR ALL TO anon USING (false);

-- Tester usage logs - detailed activity
CREATE POLICY "deny_anonymous_access" ON public.tester_usage_logs FOR ALL TO anon USING (false);

-- Tester activity summary
CREATE POLICY "deny_anonymous_access" ON public.tester_activity_summary FOR ALL TO anon USING (false);

-- Tester accounts - trial information
CREATE POLICY "deny_anonymous_access" ON public.tester_accounts FOR ALL TO anon USING (false);

-- Streak recoveries
CREATE POLICY "deny_anonymous_access" ON public.streak_recoveries FOR ALL TO anon USING (false);

-- Manual entitlements
CREATE POLICY "deny_anonymous_access" ON public.manual_entitlements FOR ALL TO anon USING (false);

-- Code redemptions
CREATE POLICY "deny_anonymous_access" ON public.code_redemptions FOR ALL TO anon USING (false);

-- User roles - admin identification
CREATE POLICY "deny_anonymous_access" ON public.user_roles FOR ALL TO anon USING (false);

-- Rate limits
CREATE POLICY "deny_anonymous_access" ON public.rate_limits FOR ALL TO anon USING (false);

-- Leaderboard profiles - strengthen consent verification
DROP POLICY IF EXISTS "Authenticated users can view public leaderboard profiles" ON public.leaderboard_profiles;
CREATE POLICY "Authenticated users can view consented public profiles" 
ON public.leaderboard_profiles 
FOR SELECT 
TO authenticated 
USING (
  is_public = true 
  AND consent_given_at IS NOT NULL 
  AND parent_acknowledged = true
);

-- Deny anonymous access to leaderboard profiles
CREATE POLICY "deny_anonymous_access" ON public.leaderboard_profiles FOR ALL TO anon USING (false);