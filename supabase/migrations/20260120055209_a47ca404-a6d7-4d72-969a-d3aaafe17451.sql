-- Manual unlock codes + entitlements (for admin/owner support)

CREATE TABLE IF NOT EXISTS public.unlock_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_by UUID,
  redeemed_at TIMESTAMPTZ
);

ALTER TABLE public.unlock_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies on purpose: clients should never be able to read or write unlock codes.

CREATE TABLE IF NOT EXISTS public.manual_entitlements (
  user_id UUID NOT NULL PRIMARY KEY,
  granted_via TEXT NOT NULL DEFAULT 'unlock_code',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entitlements"
ON public.manual_entitlements
FOR SELECT
USING (auth.uid() = user_id);
