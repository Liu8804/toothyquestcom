-- Fix: Tester Invitation Codes Should Not Be Publicly Readable
-- The current policy allows anyone to enumerate and steal beta invitation codes

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can check active invitations" ON public.tester_invitations;

-- Create a more secure policy that only allows checking if a specific code exists
-- Users can only validate a code they already know (e.g., from an email invite)
CREATE POLICY "Users can validate specific invitation codes"
ON public.tester_invitations
FOR SELECT
USING (
  -- Only allow SELECT when checking a specific code via query parameter
  -- This prevents enumeration of all codes
  true
);

-- Actually, the safest approach is to handle code validation entirely server-side
-- Let's remove the public policy and rely on the edge function for validation
DROP POLICY IF EXISTS "Users can validate specific invitation codes" ON public.tester_invitations;

-- Create a restrictive policy - only admins can view invitations
CREATE POLICY "Only admins can view invitations"
ON public.tester_invitations
FOR SELECT
USING (
  public.current_user_has_role('admin')
);

-- The edge function (redeem-tester-invite) uses service role key
-- so it can still validate codes without needing a public policy