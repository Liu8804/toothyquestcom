
-- Fix security: restrict SELECT on sensitive tables

-- 1. referrals
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Referrals owner select" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- 2. push_subscriptions
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can view push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Push subs owner select" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 3. notification_preferences
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Anyone can view notification preferences" ON public.notification_preferences;
CREATE POLICY "Notif prefs owner select" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- 4. user_streaks
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Anyone can view user streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Authenticated users can view their own streaks" ON public.user_streaks;
CREATE POLICY "Streaks owner select" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- 5. tester_usage_logs
DROP POLICY IF EXISTS "Users can view their own tester usage logs" ON public.tester_usage_logs;
DROP POLICY IF EXISTS "Users can view own tester usage logs" ON public.tester_usage_logs;
DROP POLICY IF EXISTS "Anyone can view tester usage logs" ON public.tester_usage_logs;
CREATE POLICY "Tester logs owner select" ON public.tester_usage_logs
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_has_role('admin'::app_role));

-- 6. tester_activity_summary
DROP POLICY IF EXISTS "Users can view their own tester activity summary" ON public.tester_activity_summary;
DROP POLICY IF EXISTS "Users can view own tester activity summary" ON public.tester_activity_summary;
DROP POLICY IF EXISTS "Anyone can view tester activity summary" ON public.tester_activity_summary;
CREATE POLICY "Tester summary owner select" ON public.tester_activity_summary
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_has_role('admin'::app_role));

-- 7. tester_accounts
DROP POLICY IF EXISTS "Users can view their own tester accounts" ON public.tester_accounts;
DROP POLICY IF EXISTS "Users can view own tester accounts" ON public.tester_accounts;
DROP POLICY IF EXISTS "Anyone can view tester accounts" ON public.tester_accounts;
DROP POLICY IF EXISTS "Authenticated users can view their own tester account" ON public.tester_accounts;
CREATE POLICY "Tester accounts owner select" ON public.tester_accounts
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_has_role('admin'::app_role));

-- 8. code_redemptions
DROP POLICY IF EXISTS "Users can view their own code redemptions" ON public.code_redemptions;
DROP POLICY IF EXISTS "Users can view own code redemptions" ON public.code_redemptions;
DROP POLICY IF EXISTS "Anyone can view code redemptions" ON public.code_redemptions;
CREATE POLICY "Redemptions owner select" ON public.code_redemptions
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_has_role('admin'::app_role));

-- 9. user_clinic_selections
DROP POLICY IF EXISTS "Users can view their own clinic selections" ON public.user_clinic_selections;
DROP POLICY IF EXISTS "Users can view own clinic selections" ON public.user_clinic_selections;
DROP POLICY IF EXISTS "Anyone can view clinic selections" ON public.user_clinic_selections;
CREATE POLICY "Clinic selections owner select" ON public.user_clinic_selections
  FOR SELECT USING (auth.uid() = user_id);

-- 10. streak_recoveries
DROP POLICY IF EXISTS "Users can view their own streak recoveries" ON public.streak_recoveries;
DROP POLICY IF EXISTS "Users can view own streak recoveries" ON public.streak_recoveries;
DROP POLICY IF EXISTS "Anyone can view streak recoveries" ON public.streak_recoveries;
CREATE POLICY "Streak recovery owner select" ON public.streak_recoveries
  FOR SELECT USING (auth.uid() = user_id);

-- 11. manual_entitlements
DROP POLICY IF EXISTS "Users can view their own manual entitlements" ON public.manual_entitlements;
DROP POLICY IF EXISTS "Users can view own manual entitlements" ON public.manual_entitlements;
DROP POLICY IF EXISTS "Anyone can view manual entitlements" ON public.manual_entitlements;
CREATE POLICY "Entitlements owner select" ON public.manual_entitlements
  FOR SELECT USING (auth.uid() = user_id OR public.current_user_has_role('admin'::app_role));

-- 12. unlock_codes: admin only
DROP POLICY IF EXISTS "Anyone can view unlock codes" ON public.unlock_codes;
DROP POLICY IF EXISTS "Admins can view all unlock codes" ON public.unlock_codes;
DROP POLICY IF EXISTS "Admins can view unlock codes" ON public.unlock_codes;
CREATE POLICY "Unlock codes admin select" ON public.unlock_codes
  FOR SELECT USING (public.current_user_has_role('admin'::app_role));

-- 13. tester_invitations: admin only
DROP POLICY IF EXISTS "Anyone can view tester invitations" ON public.tester_invitations;
DROP POLICY IF EXISTS "Admins can view tester invitations" ON public.tester_invitations;
CREATE POLICY "Tester invites admin select" ON public.tester_invitations
  FOR SELECT USING (public.current_user_has_role('admin'::app_role));
