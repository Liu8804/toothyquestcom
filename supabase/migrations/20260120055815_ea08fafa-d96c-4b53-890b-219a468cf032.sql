-- Upgrade unlock_codes to support expiration, max redemptions, and multiple uses

ALTER TABLE public.unlock_codes
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_redemptions INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS redemption_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create redemptions tracking table
CREATE TABLE IF NOT EXISTS public.code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.unlock_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.code_redemptions
FOR SELECT
USING (auth.uid() = user_id);

-- Deny direct insert/update/delete from clients (only edge function with service role can write)
CREATE POLICY "Deny client insert on code_redemptions"
ON public.code_redemptions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny client update on code_redemptions"
ON public.code_redemptions
FOR UPDATE
USING (false);

CREATE POLICY "Deny client delete on code_redemptions"
ON public.code_redemptions
FOR DELETE
USING (false);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
ON public.code_redemptions
FOR SELECT
USING (current_user_has_role('admin'::app_role));

-- Insert the owner's personal unlock code
INSERT INTO public.unlock_codes (code, note, max_redemptions, is_active)
VALUES ('TQ-OWNER-7K9P-2M4R-8D1Q', 'Owner personal unlock code', 1, true)
ON CONFLICT (code) DO NOTHING;