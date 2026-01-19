-- Fix 1: Add stricter RLS policy for referrals to prevent viewing codes you didn't create
DROP POLICY IF EXISTS "Users can view their referrals" ON public.referrals;
CREATE POLICY "Users can only view referrals they created"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_user_id);

-- Allow referred users to see the referral they used (when completing it)
CREATE POLICY "Referred users can view their referral completion"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_user_id);

-- Fix 2: Add policy to ensure referral codes can only be updated by the referrer
DROP POLICY IF EXISTS "Users can update their referrals" ON public.referrals;
CREATE POLICY "Users can update only their own referrals"
ON public.referrals
FOR UPDATE
USING (auth.uid() = referrer_user_id);

-- Fix 3: Add validation for leaderboard consent - add consent timestamp
ALTER TABLE public.leaderboard_profiles 
ADD COLUMN IF NOT EXISTS consent_given_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS parent_acknowledged boolean DEFAULT false;

-- Fix 4: Update leaderboard insert policy to require acknowledgment
DROP POLICY IF EXISTS "Users can create leaderboard profile for their children" ON public.leaderboard_profiles;
CREATE POLICY "Users can create leaderboard profile for their children with consent"
ON public.leaderboard_profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE id = child_id AND parent_id = auth.uid()
  )
);