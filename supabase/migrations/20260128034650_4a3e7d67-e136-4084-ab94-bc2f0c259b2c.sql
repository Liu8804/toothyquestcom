-- Create tester_invitations table for invitation links
CREATE TABLE public.tester_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    email TEXT,
    note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_uses INTEGER NOT NULL DEFAULT 1,
    uses_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tester_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tester_invitations
CREATE POLICY "Admins can view all invitations"
ON public.tester_invitations FOR SELECT
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can insert invitations"
ON public.tester_invitations FOR INSERT
WITH CHECK (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can update invitations"
ON public.tester_invitations FOR UPDATE
USING (public.current_user_has_role('admin'::app_role));

CREATE POLICY "Admins can delete invitations"
ON public.tester_invitations FOR DELETE
USING (public.current_user_has_role('admin'::app_role));

-- Public can view active invitations (needed for redemption check)
CREATE POLICY "Anyone can check active invitations"
ON public.tester_invitations FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses IS NULL OR uses_count < max_uses));

-- Function to generate random invitation code
CREATE OR REPLACE FUNCTION public.generate_tester_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'TQ-TEST-' || upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.tester_invitations WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Add index for faster code lookups
CREATE INDEX idx_tester_invitations_code ON public.tester_invitations(code);
CREATE INDEX idx_tester_invitations_active ON public.tester_invitations(is_active) WHERE is_active = true;